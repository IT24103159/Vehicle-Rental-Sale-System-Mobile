const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.addReview = async (req, res) => {
  try {
    const { vehicleRentId, vehicleSaleId, stars, comment } = req.body;

    // Optional: Verify if the user actually rented this vehicle
    if (vehicleRentId) {
      const hasRented = await Booking.findOne({
        customerId: req.user._id,
        vehicleRentId: vehicleRentId,
        bookingStatus: 'Confirmed'
      });

      if (!hasRented) {
        return res.status(403).json({ message: 'You can only review vehicles you have rented.' });
      }
    }

    const review = await Review.create({
      customerId: req.user._id,
      vehicleRentId: vehicleRentId || null,
      vehicleSaleId: vehicleSaleId || null,
      stars,
      comment
    });

    // Populate customer details before sending response so frontend can show the name
    await review.populate('customerId', 'fullName');

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getVehicleReviews = async (req, res) => {
  try {
    const { id } = req.params; // This will be vehicleRentId
    const reviews = await Review.find({ vehicleRentId: id })
      .populate('customerId', 'fullName')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
