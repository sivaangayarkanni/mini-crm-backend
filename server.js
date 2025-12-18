const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const leadRoutes = require('./routes/leads');
const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  });

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Mini CRM Backend API is running!', status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});