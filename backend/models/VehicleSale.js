const mongoose = require('mongoose');

const vehicleSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  conditionStatus: { type: String }, // Brand New, Reconditioned, Registered
  yearReg: { type: Number },
  yom: { type: Number },
  edition: { type: String },
  transmission: { type: String },
  bodyType: { type: String },
  engineCap: { type: String },
  mileage: { type: Number },
  color: { type: String },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Sold', 'Reserved'], default: 'Available' },
  description: { type: String },
  scanReportUrl: { type: String },
  images: [{ type: String }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }
}, { timestamps: true });

module.exports = mongoose.model('VehicleSale', vehicleSaleSchema);
