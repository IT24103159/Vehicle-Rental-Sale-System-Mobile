const Promotion = require('../models/Promotion');
const Notification = require('../models/Notification');

exports.createPromotion = async (req, res) => {
  try {
    const { code, discountPercent, description, startDate, endDate } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }

    const promo = await Promotion.create({
      code: code.toUpperCase(),
      discountPercent,
      description,
      startDate,
      endDate,
      imageUrl,
      adminId: req.user._id
    });

    // Create a global notification for all customers
    await Notification.create({
      message: `New Promo Code: ${code} - Get ${discountPercent}% OFF! (${description})`,
      type: 'Promotion',
      imageUrl: imageUrl,
      userId: null // null means it's a broadcast to everyone
    });

    res.status(201).json(promo);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.getActivePromotions = async (req, res) => {
  try {
    const today = new Date();
    // Fetch active promotions
    const promos = await Promotion.find({
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).sort({ createdAt: -1 });

    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPromotions = async (req, res) => {
  try {
    // For admin to see all
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { code, discountPercent, description, startDate, endDate, existingImage } = req.body;
    
    let imageUrl = existingImage || null;
    if (req.file) {
      imageUrl = req.file.path;
    }

    const promo = await Promotion.findByIdAndUpdate(
      req.params.id,
      {
        code: code.toUpperCase(),
        discountPercent,
        description,
        startDate,
        endDate,
        imageUrl
      },
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.json(promo);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPromoCode = async (req, res) => {
  try {
    const { code, startDate, endDate } = req.body;
    
    const promo = await Promotion.findOne({
      code: code.toUpperCase()
    });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    // If booking dates are provided, check if they fall within the promo range
    if (startDate && endDate) {
      const bookStart = new Date(startDate);
      const bookEnd = new Date(endDate);
      const promoStart = new Date(promo.startDate);
      const promoEnd = new Date(promo.endDate);

      if (bookStart < promoStart || bookEnd > promoEnd) {
        return res.status(400).json({ 
          message: `This code is only valid for bookings between ${promoStart.toLocaleDateString()} and ${promoEnd.toLocaleDateString()}` 
        });
      }
    } else {
      // Default: just check if today is within range
      const today = new Date();
      if (today < promo.startDate || today > promo.endDate) {
        return res.status(400).json({ message: 'This promo code has expired or is not yet active' });
      }
    }

    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
