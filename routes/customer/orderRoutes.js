const express = require('express');
const { getMyOrders, getOrderById } = require('../../controllers/orderController');
const router = express.Router();

router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;