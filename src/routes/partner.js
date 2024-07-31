const express = require('express');
const PartnerController = require('../controllers/PartnerController');
const router = express.Router()

//get-method


// //post-method
router.post('/create-partner', PartnerController.createPartner)
router.post('/generate-token', PartnerController.getTokenPartner)


module.exports = router;