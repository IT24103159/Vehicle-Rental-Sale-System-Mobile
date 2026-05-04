const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const VehicleRent = require('../models/VehicleRent');
const emailService = require('../services/emailService');

exports.uploadPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentDate } = req.body;
    
    // If a file was uploaded, construct its URL. Otherwise, check if a URL string was provided (for backward compatibility).
    let bankSlipUrl = req.body.bankSlipUrl;
    if (req.file) {
      bankSlipUrl = `/uploads/slips/${req.file.filename}`;
    }

    if (!bankSlipUrl) {
      return res.status(400).json({ message: 'Bank slip is required.' });
    }

    const payment = await Payment.create({
      bookingId,
      amount,
      bankSlipUrl,
      paymentDate,
      status: 'Pending'
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    // Admin uses this to see all payments, populated with booking and user info
    const payments = await Payment.find()
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'customerId', select: 'fullName email phone' },
          { path: 'vehicleRentId', select: 'name type dailyRate' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, paymentDate } = req.body; // Admin can also correct the date

    const payment = await Payment.findById(id).populate('bookingId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = status;
    if (remarks) payment.remarks = remarks;
    if (paymentDate) payment.paymentDate = paymentDate;

    await payment.save();

    // Automation: If approved, update booking and lock vehicle
    if (status === 'Approved') {
      const booking = await Booking.findById(payment.bookingId._id).populate('customerId');
      if (booking) {
        booking.bookingStatus = 'Confirmed';
        await booking.save();

        const vehicle = await VehicleRent.findById(booking.vehicleRentId);
        
        // Generate PDF invoice and send Email
        await emailService.sendApprovalEmail(booking, payment, booking.customerId, vehicle);
      }
    } else if (status === 'Rejected') {
      const booking = await Booking.findById(payment.bookingId._id).populate('customerId');
      if (booking) {
        booking.bookingStatus = 'Pending Payment';
        await booking.save();
        
        // Send Rejection Email with Remarks
        await emailService.sendRejectionEmail(payment, booking, booking.customerId);
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
