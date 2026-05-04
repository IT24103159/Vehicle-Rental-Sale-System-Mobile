const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    // Fetch personal notifications AND broadcast notifications (userId: null)
    const notifications = await Notification.find({
      $or: [
        { userId: req.user._id },
        { userId: null }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
