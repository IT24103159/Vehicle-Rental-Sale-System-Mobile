const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createPromotion,
  getActivePromotions,
  getAllPromotions,
  deletePromotion,
  verifyPromoCode,
  updatePromotion
} = require('../controllers/promotionController');

const { upload } = require('../middleware/uploadMiddleware');

// Public or Customer Routes
router.get('/active', getActivePromotions);
router.post('/verify', protect, verifyPromoCode);

// Admin Routes
router.post('/', protect, adminOnly, upload.single('image'), createPromotion);
router.get('/', protect, adminOnly, getAllPromotions);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePromotion);
router.delete('/:id', protect, adminOnly, deletePromotion);

module.exports = router;
