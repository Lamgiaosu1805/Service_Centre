const express = require('express');
const PartnerController = require('../controllers/PartnerController');
const auth = require('../middlewares/auth');
const router = express.Router()

//get-method


// //post-method
router.post('/create-partner', auth.verifyAccount, PartnerController.createPartner)
router.post('/generate-token', PartnerController.getTokenPartner)


module.exports = router;