const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleBlockUser,
  deleteUser,
  getProfile,
  updateProfile
} = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.put('/:id/block', protect, adminOnly, toggleBlockUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
