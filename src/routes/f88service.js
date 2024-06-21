const express = require('express');
const F88ServiceController = require('../controllers/F88ServiceController');
const router = express.Router()

router.post('/pushDon', F88ServiceController.pushDocumentRequest);

module.exports = router;