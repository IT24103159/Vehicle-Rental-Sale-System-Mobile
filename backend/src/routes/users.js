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
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
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
  [body('role', 'Role must be "user" or "admin"').isIn(['user', 'admin'])],
  updateUserRole
);

// @route   PUT /api/users/:id/status
// @desc    Toggle user active status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', authorize('admin'), toggleUserStatus);

module.exports = router;
