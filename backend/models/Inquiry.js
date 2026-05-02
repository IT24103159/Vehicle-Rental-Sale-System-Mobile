const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  status: { type: String, default: 'Unread' },
  message: { type: String, required: true },
  adminReply: { type: String, default: null },
  inquiryType: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleSaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleSale', default: null },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
