const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoute');
const loginRoutes = require('./routes/loginRoute');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  credentials: true,
  origin: [
    'http://192.168.171.5:5175',
    'http://localhost:5175',
    'http://localhost:5172',
    'http://192.168.171.5:5172'
  ]
}));
app.use(cookieParser());
app.use(express.json());

// Inisialisasi Map untuk QR codes sebelum routes
global.activeQRCodes = new Map();

// Routes
app.use('/api/auth', loginRoutes);
app.use('/api', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Terjadi kesalahan pada server'
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
