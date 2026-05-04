const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const protect = async (req, res, next) => {
  try {
    const useMockData = process.env.USE_MOCK_DATA === 'true';
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (useMockData) {
        const mockUser = await mockStore.findById(decoded.id);

        if (!mockUser || !mockUser.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Your account has been blocked. Please contact an administrator.',
          });
        }

        req.user = { id: decoded.id, role: mockUser.role };
        return next();
      }

      const user = await User.findById(decoded.id).select('role isActive');

      if (!user || !user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked. Please contact an administrator.',
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'User role not authorized to access this route',
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
