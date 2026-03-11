const express = require('express');
const { getAddresses, createAddress, updateAddress, setDefault, deleteAddress } = require('../../controllers/addressController');
const router = express.Router();

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.patch('/:id/default', setDefault);
router.delete('/:id', deleteAddress);

module.exports = router;