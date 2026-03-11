const express = require('express');
const {
  getBalance,
  getEntries,
  addExpense,
  addWithdrawal,
  addIncome
} = require('../../controllers/accountController');
const router = express.Router();

router.get('/balance', getBalance);
router.get('/', getEntries);
router.post('/expense', addExpense);
router.post('/withdrawal', addWithdrawal);
router.post('/income', addIncome); // optional

module.exports = router;