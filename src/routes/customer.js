const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/uploadFile');
const router = express.Router()

router.post('/verifyCustomer', CustomerController.verifyCustomer);
router.post('/insert-customer-partner', auth.verifyToken, upload.single('file'), CustomerController.insertCustomerFromPartner);

router.get('/:customerId', auth.verifyAccount, CustomerController.getCustomerInfo);

module.exports = router;