const express = require('express');
const F88ServiceController = require('../controllers/F88ServiceController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/pushDon', F88ServiceController.pushDocumentRequest);
router.post('/pushData', auth.verifyAccount, F88ServiceController.pushData);

module.exports = router;