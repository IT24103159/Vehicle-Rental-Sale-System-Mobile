const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllRentVehicles,
  getRentVehicleById,
  createRentVehicle,
  updateRentVehicle,
  deleteRentVehicle,
  getAllSaleVehicles,
  getSaleVehicleById,
  createSaleVehicle,
  updateSaleVehicle,
  deleteSaleVehicle,
  getTrendingVehicles
} = require('../controllers/vehicleController');

// Trending (Public)
router.get('/trending', getTrendingVehicles);

// Rent Endpoints
router.get('/rent', getAllRentVehicles);
router.get('/rent/:id', getRentVehicleById);
router.post('/rent', protect, adminOnly, createRentVehicle);
router.put('/rent/:id', protect, adminOnly, updateRentVehicle);
router.delete('/rent/:id', protect, adminOnly, deleteRentVehicle);

// Sale Endpoints
router.get('/sale', getAllSaleVehicles);
router.get('/sale/:id', getSaleVehicleById);
router.post('/sale', protect, adminOnly, createSaleVehicle);
router.put('/sale/:id', protect, adminOnly, updateSaleVehicle);
router.delete('/sale/:id', protect, adminOnly, deleteSaleVehicle);

module.exports = router;
