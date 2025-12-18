const express = require('express');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', source = '' } = req.query;

    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const query = {};

    const totalLeads = await Lead.countDocuments(query);
    const wonLeads = await Lead.countDocuments({ ...query, status: 'closed_won' });
    const lostLeads = await Lead.countDocuments({ ...query, status: 'closed_lost' });

    const totalValue = await Lead.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    const wonValue = await Lead.aggregate([
      { $match: { ...query, status: 'closed_won' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    const statusDistribution = await Lead.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const sourceDistribution = await Lead.aggregate([
      { $match: query },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    res.json({
      totalLeads,
      wonLeads,
      lostLeads,
      conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0,
      totalValue: totalValue[0]?.total || 0,
      wonValue: wonValue[0]?.total || 0,
      statusDistribution,
      sourceDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating lead with data:', req.body);
    const lead = new Lead({
      ...req.body,
      user: req.user._id
    });
    const savedLead = await lead.save();
    await savedLead.populate('assignedTo', 'name email');
    await savedLead.populate('user', 'name email');
    console.log('Lead created successfully:', savedLead._id);
    res.status(201).json(savedLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(400).json({ message: error.message, details: error });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email').populate('user', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id });
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;