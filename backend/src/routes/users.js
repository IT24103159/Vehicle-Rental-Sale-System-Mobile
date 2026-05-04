const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All user routes require authentication
router.use(protect);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authorize('admin'), getAllUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put(
  '/:id',
  upload.single('profileImage'),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('Name cannot be empty')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Please include a valid email')
      .normalizeEmail(),
    body('phone')
      .optional()
      .trim()
      .notEmpty().withMessage('Phone cannot be empty')
      .matches(/^[0-9+\-\s()]+$/).withMessage('Phone number contains invalid characters')
      .isLength({ min: 10, max: 20 }).withMessage('Phone must be between 10 and 20 characters'),
  ],
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), deleteUser);

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put(
  '/:id/role',
  authorize('admin'),
  [
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['user', 'admin']).withMessage('Role must be "user" or "admin"')
  ],
  updateUserRole
);

// @route   PUT /api/users/:id/status
// @desc    Toggle user active status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', authorize('admin'), toggleUserStatus);

module.exports = router;
