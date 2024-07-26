const express = require('express');
const AddressController = require('../controllers/AddressController');
const router = express.Router()

//get-method
router.get('/get-cities', AddressController.getCity)

//post-method
router.post('/get-district', AddressController.getDistrict)


module.exports = router;