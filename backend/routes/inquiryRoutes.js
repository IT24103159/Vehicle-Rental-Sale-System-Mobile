const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createInquiry,
  getAdminInquiries,
  getMyInquiries,
  updateInquiryStatus,
  finalizeSale,
  getTrendingVehicles
} = require('../controllers/inquiryController');

// Customer Routes
router.post('/inquire', protect, createInquiry);
router.get('/my-inquiries', protect, getMyInquiries);

// Admin Routes
router.get('/admin/all', protect, adminOnly, getAdminInquiries);
router.put('/admin/status/:id', protect, adminOnly, updateInquiryStatus);
router.post('/admin/finalize-sale', protect, adminOnly, finalizeSale);
router.get('/trending', protect, adminOnly, getTrendingVehicles);

module.exports = router;
