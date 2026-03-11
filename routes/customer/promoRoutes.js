const express = require('express');
const { getActivePromos, validatePromo } = require('../../controllers/promoController');
const router = express.Router();

router.get('/', getActivePromos);
router.post('/validate', validatePromo);

module.exports = router;