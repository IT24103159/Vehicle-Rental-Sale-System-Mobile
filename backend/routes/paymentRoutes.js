const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadSlip } = require('../middleware/uploadMiddleware');
const {
  uploadPayment,
  getAllPayments,
  updatePaymentStatus,
  getMyPayments
} = require('../controllers/paymentController');

// Customer routes
router.post('/upload', protect, uploadSlip.single('bankSlip'), uploadPayment);
router.get('/my-payments', protect, getMyPayments);

// Admin gets all payments
router.get('/', protect, adminOnly, getAllPayments);

// Admin updates payment status
router.put('/:id', protect, adminOnly, updatePaymentStatus);

module.exports = router;
