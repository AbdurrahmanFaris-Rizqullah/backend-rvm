const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', loginController.register);
router.post('/login', loginController.login);
router.post('/logout', loginController.logout);
router.post('/generate-qr', loginController.generateQR);
router.post('/verify-qr', authMiddleware.authenticateToken, loginController.verifyQR);

module.exports = router;