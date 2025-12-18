const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    const demoUsers = [
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

    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Demo users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
};

createDemoUsers();