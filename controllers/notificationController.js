const Notification = require('../models/Notification');

// Get my notifications (customer or admin)
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// Mark as read
exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { _id: { $in: req.body.ids }, user: req.user.id },
      { isRead: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};