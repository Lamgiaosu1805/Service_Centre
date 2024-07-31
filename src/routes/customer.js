const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/verifyCustomer', CustomerController.verifyCustomer);
router.post('/insert-customer-partner',auth.verifyToken, CustomerController.insertCustomerFromPartner);

module.exports = router;