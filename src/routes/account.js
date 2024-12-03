const express = require('express');
const AccountController = require('../controllers/AccountController');
const router = express.Router()

router.post('/create-admin', AccountController.createAccount);
router.post('/signIn', AccountController.signIn);

module.exports = router;