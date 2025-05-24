const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Silakan login terlebih dahulu'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Menyimpan data user di request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'Token tidak valid atau kadaluarsa'
    });
  }
};