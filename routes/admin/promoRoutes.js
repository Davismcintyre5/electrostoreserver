const express = require('express');
const { getAllPromos, createPromo, updatePromo, deletePromo } = require('../../controllers/promoController');
const router = express.Router();

router.get('/', getAllPromos);
router.post('/', createPromo);
router.put('/:id', updatePromo);
router.delete('/:id', deletePromo);

module.exports = router;