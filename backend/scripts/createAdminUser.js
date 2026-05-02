const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Simple User schema for quick insert
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema, 'users');

async function createAdminUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) {
      console.log('✓ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+1234567890',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();
    console.log('✓ Admin user created successfully');
    console.log('');
    console.log('Login Credentials:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
