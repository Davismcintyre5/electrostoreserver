const express = require('express');
const {
  getAllOrders,
  updateOrderStatus,
  confirmPayment
} = require('../../controllers/orderController');
const router = express.Router();

router.get('/', getAllOrders);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/confirm-payment', confirmPayment); // New route

module.exports = router;