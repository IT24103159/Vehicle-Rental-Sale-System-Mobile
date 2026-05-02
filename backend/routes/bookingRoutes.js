const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  checkAvailability,
  createBooking,
  cancelBooking,
  getCustomerBookings
} = require('../controllers/bookingController');

router.get('/check-availability', checkAvailability); // Public or protected based on your need
router.post('/create', protect, createBooking);
router.delete('/:id', protect, cancelBooking);
router.get('/my-bookings', protect, getCustomerBookings);

module.exports = router;
