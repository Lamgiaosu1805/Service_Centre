const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const router = express.Router()

router.post('/verifyCustomer', CustomerController.verifyCustomer);

module.exports = router;