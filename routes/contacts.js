const express = require('express');
const Contact = require('../models/Contact');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all contacts
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .populate('assignedTo', 'name email')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create contact
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating contact with data:', req.body);
    const contact = new Contact({
      ...req.body,
      user: req.user._id
    });
    
    const savedContact = await contact.save();
    console.log('Contact created successfully:', savedContact._id);
    res.status(201).json(savedContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(400).json({ message: error.message, details: error });
  }
});

// Update contact
router.put('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email').populate('user', 'name email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;