const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate a test JWT token
const testUserId = '507f1f77bcf86cd799439011'; // Sample MongoDB ObjectId
const token = jwt.sign(
  { id: testUserId }, 
  process.env.JWT_SECRET, 
  { expiresIn: '7d' }
);

console.log('Generated JWT Token:');
console.log(token);
console.log('\nUse this token in Authorization header as:');
console.log(`Bearer ${token}`);