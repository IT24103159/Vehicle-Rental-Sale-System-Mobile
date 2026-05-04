const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  checkAvailability,
  createBooking,
  cancelBooking,
  getCustomerBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');

router.get('/check-availability', checkAvailability);
router.post('/create', protect, createBooking);
router.delete('/:id', protect, cancelBooking);
router.get('/my-bookings', protect, getCustomerBookings);

// Admin Routes
router.get('/admin/all', protect, getAllBookings);
router.put('/admin/status/:id', protect, updateBookingStatus);
router.delete('/admin/:id', protect, deleteBooking);

module.exports = router;
