const express = require('express');
const { stkPush, callback } = require('../controllers/mpesaController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/stkpush', auth, stkPush);
router.post('/callback', callback); // no auth, called by Safaricom

module.exports = router;