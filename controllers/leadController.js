const Lead = require('../models/Lead');

// Get all leads
const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = { user: req.user._id };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const leads = await Lead.find(query)
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
};

// Create lead
const createLead = async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      user: req.user._id
    });
    
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get analytics
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const totalLeads = await Lead.countDocuments({ user: userId });
    const wonLeads = await Lead.countDocuments({ user: userId, status: 'closed_won' });
    const lostLeads = await Lead.countDocuments({ user: userId, status: 'closed_lost' });
    
    const totalValueResult = await Lead.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    
    const wonValueResult = await Lead.aggregate([
      { $match: { user: userId, status: 'closed_won' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    
    const statusDistribution = await Lead.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const sourceDistribution = await Lead.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    const totalValue = totalValueResult[0]?.total || 0;
    const wonValue = wonValueResult[0]?.total || 0;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
    
    res.json({
      totalLeads,
      wonLeads,
      lostLeads,
      totalValue,
      wonValue,
      conversionRate: parseFloat(conversionRate),
      statusDistribution,
      sourceDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getAnalytics
};