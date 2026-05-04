const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addReview,
  getVehicleReviews,
  updateReview,
  deleteReview,
  getMyReviews
} = require('../controllers/reviewController');

router.post('/add', protect, addReview);
router.get('/vehicle/:id', getVehicleReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/my-reviews', protect, getMyReviews);

module.exports = router;
