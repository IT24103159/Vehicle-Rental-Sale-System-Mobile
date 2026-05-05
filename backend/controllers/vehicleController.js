const VehicleRent = require('../models/VehicleRent');
const VehicleSale = require('../models/VehicleSale');

// --- RENT VEHICLES --- //

exports.getAllRentVehicles = async (req, res) => {
  try {
    const { type, gearType, fuelType, maxPrice } = req.query;
    let query = {};

    if (type) query.type = new RegExp(type, 'i');
    if (gearType) query.gearType = gearType;
    if (fuelType) query.fuelType = fuelType;
    if (maxPrice) query.dailyRate = { $lte: Number(maxPrice) };

    const vehicles = await VehicleRent.find({ ...query, status: 'Available' }).populate('promotion').sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRentVehicleById = async (req, res) => {
  try {
    const vehicle = await VehicleRent.findById(req.params.id).populate('promotion');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRentVehicle = async (req, res) => {
  try {
    console.log('--- Incoming Rent Vehicle Data ---');
    console.log(req.body);
    console.log('User ID from Token:', req.user._id);

    // Extract Cloudinary URLs from uploaded files
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    // Convert string numbers to real numbers before saving
    const data = {
      ...req.body,
      images: imageUrls,
      year: req.body.year ? Number(req.body.year) : undefined,
      dailyRate: Number(req.body.dailyRate),
      mileageLimit: req.body.mileageLimit ? Number(req.body.mileageLimit) : undefined,
      extraMileageCharge: req.body.extraMileageCharge ? Number(req.body.extraMileageCharge) : undefined,
      seats: req.body.seats ? Number(req.body.seats) : undefined,
      admin: req.user._id // Set from auth middleware
    };

    const vehicle = await VehicleRent.create(data);
    console.log('✅ Vehicle Created Successfully:', vehicle._id);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('❌ Create Rent Vehicle Error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateRentVehicle = async (req, res) => {
  try {
    let existingImages = req.body.existingImages || [];
    if (!Array.isArray(existingImages)) existingImages = [existingImages];
    
    const newImageUrls = req.files ? req.files.map(file => file.path) : [];
    const finalImages = [...existingImages, ...newImageUrls];

    const data = {
      ...req.body,
      images: finalImages,
      year: req.body.year ? Number(req.body.year) : undefined,
      dailyRate: req.body.dailyRate ? Number(req.body.dailyRate) : undefined,
      mileageLimit: req.body.mileageLimit ? Number(req.body.mileageLimit) : undefined,
      extraMileageCharge: req.body.extraMileageCharge ? Number(req.body.extraMileageCharge) : undefined,
      seats: req.body.seats ? Number(req.body.seats) : undefined,
    };
    const vehicle = await VehicleRent.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRentVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleRent.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SALE VEHICLES --- //

exports.getAllSaleVehicles = async (req, res) => {
  try {
    const { brand, model, bodyType, condition, transmission, maxPrice } = req.query;
    let query = {};

    if (brand) query.brand = new RegExp(brand, 'i');
    if (model) query.name = new RegExp(model, 'i');
    if (bodyType) query.bodyType = bodyType;
    if (condition && condition !== 'All Conditions') query.conditionStatus = condition;
    if (transmission && transmission !== 'Any') query.transmission = transmission;
    if (maxPrice) query.price = { $lte: Number(maxPrice) };

    const vehicles = await VehicleSale.find(query).populate('promotion').sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSaleVehicleById = async (req, res) => {
  try {
    const vehicle = await VehicleSale.findById(req.params.id).populate('promotion');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSaleVehicle = async (req, res) => {
  try {
    // Extract Cloudinary URLs from uploaded files
    const imageUrls = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const scanReportUrl = req.files && req.files['scanReport'] ? req.files['scanReport'][0].path : null;

    const data = {
      ...req.body,
      images: imageUrls,
      scanReportUrl: scanReportUrl,
      price: Number(req.body.price),
      yom: req.body.yom ? Number(req.body.yom) : undefined,
      yearReg: req.body.yearReg ? Number(req.body.yearReg) : undefined,
      mileage: req.body.mileage ? Number(req.body.mileage) : undefined,
      admin: req.user._id
    };

    const vehicle = await VehicleSale.create(data);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create Sale Vehicle Error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateSaleVehicle = async (req, res) => {
  try {
    let existingImages = req.body.existingImages || [];
    if (!Array.isArray(existingImages)) existingImages = [existingImages];
    
    const newImageUrls = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const finalImages = [...existingImages, ...newImageUrls];

    let scanReportUrl = req.body.scanReportUrl; // If existing report is kept
    if (req.files && req.files['scanReport']) {
      scanReportUrl = req.files['scanReport'][0].path;
    }

    const data = {
      ...req.body,
      images: finalImages,
      scanReportUrl: scanReportUrl,
      price: req.body.price ? Number(req.body.price) : undefined,
      yom: req.body.yom ? Number(req.body.yom) : undefined,
      yearReg: req.body.yearReg ? Number(req.body.yearReg) : undefined,
      mileage: req.body.mileage ? Number(req.body.mileage) : undefined,
    };
    const vehicle = await VehicleSale.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSaleVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleSale.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- TRENDING VEHICLES --- //

exports.getTrendingVehicles = async (req, res) => {
  try {
    const trendingRent = await VehicleRent.find().sort({ createdAt: -1 }).limit(4);
    const trendingSale = await VehicleSale.find().sort({ createdAt: -1 }).limit(4);
    res.json({
      trendingRent,
      trendingSale
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
