const express = require('express');
const { getAllOrders, updateOrderStatus } = require('../../controllers/orderController'); // need admin controller
const router = express.Router();

// Use the admin order controller methods (defined earlier as getAllOrders, updateOrderStatus)
router.get('/', getAllOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;