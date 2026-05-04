const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleRentId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleRent', default: null },
  vehicleSaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleSale', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
