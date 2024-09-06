const express = require('express');
const F88 = require('../controllers/F88ServiceController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/pushDon', F88.F88ServiceController.pushDocumentRequest);
router.post('/result-push', F88.F88ServiceController.callbackResultPOL);
router.post('/status-push', F88.F88ServiceController.callbackStatusPOL);
router.post('/pushData', auth.verifyAccount, F88.F88ServiceController.pushData);

module.exports = router;