const express = require('express');
const { getMyNotifications, getUnreadCount, markAsRead } = require('../../controllers/notificationController');
const router = express.Router();

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-read', markAsRead);

module.exports = router;