const express = require('express');
const router = express.Router();
const { scanQR, collectTrash, redeemVoucher } = require('../controllers/userController');

router.post('/scan', scanQR);
router.post('/collect', collectTrash);
router.post('/redeem', redeemVoucher);

module.exports = router;
