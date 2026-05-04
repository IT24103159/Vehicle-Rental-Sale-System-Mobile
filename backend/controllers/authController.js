const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, nic, phone, role, licenseUrl } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { nic }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or NIC' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      nic,
      phone,
      role: role || 'Customer',
      licenseUrl
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        nic: user.nic,
        phone: user.phone,
        profilePic: user.profilePic,
        licenseUrl: user.licenseUrl,
        status: user.status,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (user.status === 'BLOCKED') {
        return res.status(403).json({ message: 'Your account has been blocked' });
      }

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        nic: user.nic,
        phone: user.phone,
        profilePic: user.profilePic,
        licenseUrl: user.licenseUrl,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
