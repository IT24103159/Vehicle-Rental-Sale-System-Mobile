const Inquiry = require('../models/Inquiry');
const VehicleSale = require('../models/VehicleSale');
const User = require('../models/User');

// Create Inquiry
exports.createInquiry = async (req, res) => {
  try {
    const { vehicleSaleId, inquiryType, message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Validation Error: Please enter a message.' });
    }

    const newInquiry = await Inquiry.create({
      vehicleSaleId,
      inquiryType,
      message,
      customerId: req.user._id
    });

    res.status(201).json({ message: 'Inquiry sent successfully', inquiry: newInquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Inquiries for Admin
exports.getAdminInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('customerId', 'fullName email phone')
      .populate('vehicleSaleId', 'brand name price images status')
      .sort({ createdAt: -1 });
      
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Customer's own Inquiries
exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ customerId: req.user._id })
      .populate('vehicleSaleId', 'brand name price images status')
      .sort({ createdAt: -1 });
      
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Update Inquiry Status (Reply)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const inquiry = await Inquiry.findById(id).populate('customerId').populate('vehicleSaleId');
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.status = status;
    inquiry.adminReply = adminReply;
    await inquiry.save();

    // NOTE: In a production app, trigger EmailService here to send status update to customer

    res.json({ message: 'Inquiry updated successfully', inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Finalize Sale
exports.finalizeSale = async (req, res) => {
  try {
    const { vehicleId, inquiryId } = req.body;

    // 1. Update Vehicle Status to 'Sold'
    const vehicle = await VehicleSale.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    vehicle.status = 'Sold';
    await vehicle.save();

    // 2. Accept winning inquiry
    const winningInquiry = await Inquiry.findById(inquiryId);
    if (winningInquiry) {
      winningInquiry.status = 'ACCEPTED';
      winningInquiry.adminReply = 'Congratulations! Your purchase has been approved. We will contact you for payment procedures.';
      await winningInquiry.save();
      // NOTE: Send Win Email here
    }

    // 3. Reject all other pending inquiries for this vehicle
    await Inquiry.updateMany(
      { vehicleSaleId: vehicleId, _id: { $ne: inquiryId }, status: 'PENDING' },
      { 
        $set: { 
          status: 'REJECTED', 
          adminReply: 'We are sorry, but this vehicle has been sold to another buyer.' 
        } 
      }
    );
    // NOTE: Send Reject Emails here

    res.json({ message: 'Sale finalized successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analytics: Trending Vehicles (Count inquiries per vehicle)
exports.getTrendingVehicles = async (req, res) => {
  try {
    const trending = await Inquiry.aggregate([
      { $group: { _id: "$vehicleSaleId", totalInquiries: { $sum: 1 } } },
      { $sort: { totalInquiries: -1 } },
      { $limit: 10 }
    ]);

    const populatedTrending = await VehicleSale.populate(trending, { path: '_id', select: 'brand name price' });
    
    const result = populatedTrending.map(t => ({
      vehicleId: t._id._id,
      brand: t._id.brand,
      name: t._id.name,
      totalInquiries: t.totalInquiries
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
