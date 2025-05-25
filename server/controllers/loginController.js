const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Nama, email, dan password harus diisi'
      });
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        points: 0
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 jam
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points
      }
    });

  } catch (error) {
    console.error('Error pada register:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email dan password harus diisi'
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Email tidak terdaftar'
      });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Password salah'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 jam
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points
      }
    });

  } catch (error) {
    console.error('Error pada login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat login'
    });
  }
};

// Tambahkan fungsi logout
exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
};


// Simpan QR codes yang aktif
const activeQRCodes = new Map(); // Map untuk menyimpan {qrCode: userId}

exports.generateQR = async (req, res) => {
  try {
    const qrCode = 'LOGIN_' + Math.random().toString(36).substring(7);
    
    // Simpan QR code (dalam praktik nyata, tambahkan expiry time)
    activeQRCodes.set(qrCode, null);
    
    res.json({
      success: true,
      qrCode
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal generate QR code'
    });
  }
};

exports.verifyQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const userId = req.user.id; // dari middleware auth

    if (!activeQRCodes.has(qrCode)) {
      return res.status(400).json({
        success: false,
        message: 'QR code tidak valid atau kadaluarsa'
      });
    }

    // Update QR status dan broadcast ke web client
    activeQRCodes.set(qrCode, userId);
    
    // Broadcast melalui WebSocket
    global.broadcastUpdate('login', { qrCode, userId });

    res.json({
      success: true,
      message: 'QR code berhasil diverifikasi'
    });

    // Hapus QR setelah berhasil
    setTimeout(() => activeQRCodes.delete(qrCode), 5000);

  } catch (error) {
    console.error('Error verifying QR:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal verifikasi QR code'
    });
  }
};