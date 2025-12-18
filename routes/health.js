const express = require('express');
const router = express.Router();

// Health check endpoint for Render
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Mini CRM Backend is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;