const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createPromotion,
  getActivePromotions,
  getAllPromotions,
  deletePromotion,
  verifyPromoCode
} = require('../controllers/promotionController');

// Public or Customer Routes
router.get('/active', getActivePromotions);
router.post('/verify', protect, verifyPromoCode);

// Admin Routes
router.post('/', protect, adminOnly, createPromotion);
router.get('/', protect, adminOnly, getAllPromotions);
router.delete('/:id', protect, adminOnly, deletePromotion);

module.exports = router;
