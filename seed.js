const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create test users
    const users = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'user'
      },
      {
        name: 'Admin User',
        email: 'admin@minicrm.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Regular User',
        email: 'user@minicrm.com',
        password: 'user123',
        role: 'user'
      }
    ];
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedUsers();