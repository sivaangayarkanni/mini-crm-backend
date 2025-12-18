const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check endpoint for Render
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.status(200).json({
      status: 'OK',
      message: 'Mini CRM Backend is running',
      database: {
        status: dbStatus[dbState] || 'unknown',
        name: mongoose.connection.name || 'unknown'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;