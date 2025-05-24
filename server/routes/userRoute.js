const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateToken);

router.post('/scan', userController.scanQR);
router.post('/collect', userController.collectTrash);
router.post('/redeem', userController.redeemVoucher);

module.exports = router;
