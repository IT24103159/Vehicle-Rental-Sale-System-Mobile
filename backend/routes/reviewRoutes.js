const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addReview,
  getVehicleReviews
} = require('../controllers/reviewController');

router.post('/add', protect, addReview);
router.get('/vehicle/:id', getVehicleReviews); // Public route so anyone can see reviews

module.exports = router;
