const express = require('express');
const F88 = require('../controllers/F88ServiceController');
const auth = require('../middlewares/auth');
const router = express.Router()

router.post('/pushDon', F88.F88ServiceController.pushDocumentRequest);
router.post('/pushData', auth.verifyAccount, F88.F88ServiceController.pushData);

module.exports = router;