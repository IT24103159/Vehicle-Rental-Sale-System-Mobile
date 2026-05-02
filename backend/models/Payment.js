const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  bankSlipUrl: { type: String },
  amount: { type: Number, required: true },
  remarks: { type: String },
  paymentDate: { type: Date },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
