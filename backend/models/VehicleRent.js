const mongoose = require('mongoose');

const vehicleRentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String }, // e.g., Car, SUV, Van
  year: { type: Number },
  dailyRate: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Rented'], default: 'Available' },
  description: { type: String },
  mileageLimit: { type: Number },
  extraMileageCharge: { type: Number },
  avgFuelEfficiency: { type: String },
  gearType: { type: String }, // Manual, Automatic
  seats: { type: Number },
  fuelType: { type: String },
  images: [{ type: String }], // Array of image URLs
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }
}, { timestamps: true });

module.exports = mongoose.model('VehicleRent', vehicleRentSchema);
