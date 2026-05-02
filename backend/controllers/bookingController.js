const Booking = require('../models/Booking');
const VehicleRent = require('../models/VehicleRent');

exports.checkAvailability = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;
    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check for Confirmed or Pending Payment bookings that overlap
    const existingBooking = await Booking.findOne({
      vehicleRentId: vehicleId,
      bookingStatus: { $in: ['Confirmed', 'Pending Payment'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (existingBooking) {
      return res.json(false); // Not available
    }
    res.json(true); // Available
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { customerId, vehicleRentId, startDate, endDate, totalCost, promoCode } = req.body;

    const booking = await Booking.create({
      customerId,
      vehicleRentId,
      startDate,
      endDate,
      totalCost,
      bookingStatus: 'Pending Payment',
      // If promo was applied, you could store promoId. We skip it here for simplicity.
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'Pending Payment') {
      return res.status(400).json({ message: 'Can only cancel Pending Payment bookings' });
    }

    await Booking.findByIdAndDelete(id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('vehicleRentId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
