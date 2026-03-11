const express = require('express');
const { getAllTransactions, createTransaction } = require('../../controllers/transactionController');
const router = express.Router();

router.get('/', getAllTransactions);
router.post('/', createTransaction); // Manual transaction creation

module.exports = router;