const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Customer', 'Admin'], required: true },
  phone: { type: String, required: true },
  // Customer-specific
  licenseUrl: { type: String, default: null },
  // Account status
  status: { type: String, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE' }
}, { timestamps: true });

// Mongoose 9 - no need for 'next' callback, just use async/await
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
