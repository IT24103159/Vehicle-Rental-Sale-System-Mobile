const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  totalCost: { type: Number, required: true },
  bookingStatus: { 
    type: String, 
    enum: ['Pending Payment', 'Confirmed', 'Cancelled'], 
    default: 'Pending Payment' 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleRentId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleRent', required: true },
  promoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
