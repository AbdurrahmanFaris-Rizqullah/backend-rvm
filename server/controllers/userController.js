const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/mockData.json');

// Inisialisasi data dari file JSON
let users = {};
try {
  users = loadData();
} catch (err) {
  // Jika file belum ada, buat file baru dengan objek kosong
  try {
    // Pastikan direktori data ada
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    saveData(users);
  } catch (error) {
    console.error('Gagal membuat file data:', error);
  }
}

exports.scanQR = (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'userId is required',
        message: 'ID pengguna harus disertakan' 
      });
    }

    if (!users[userId]) {
      users[userId] = { points: 0, vouchers: 0 };
      try {
        saveData(users);
      } catch (error) {
        console.error('Gagal menyimpan data user baru:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: 'Gagal menyimpan data pengguna'
        });
      }
    }

    res.json({ 
      success: true,
      message: 'Scan berhasil', 
      user: users[userId] 
    });
  } catch (error) {
    console.error('Error pada scanQR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat memproses QR code'
    });
  }
};

exports.collectTrash = (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields',
        message: 'ID pengguna dan tipe sampah harus disertakan' 
      });
    }

    if (!users[userId]) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found',
        message: 'Pengguna tidak ditemukan' 
      });
    }

    const pointMap = {
      plastic: 10,
      paper: 5,
      metal: 15,
      glass: 20,
      organic: 30,
      mantan: 50
    };    

    const points = pointMap[type] || 0;
    users[userId].points += points;
    
    try {
      saveData(users);
      // Broadcast update points
      global.broadcastUpdate('points_update', {
        userId,
        points: users[userId].points,
        added: points,
        type: type
      });
    } catch (error) {
      console.error('Gagal menyimpan poin:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Gagal menyimpan poin'
      });
    }

    res.json({ 
      success: true,
      message: `Berhasil mengumpulkan ${type}`, 
      pointsAdded: points, 
      total: users[userId].points 
    });
  } catch (error) {
    console.error('Error pada collectTrash:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat memproses pengumpulan sampah'
    });
  }
};

exports.redeemVoucher = (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || !users[userId]) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Pengguna tidak ditemukan'
      });
    }

    if (users[userId].points < 50) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient points',
        message: 'Poin tidak mencukupi untuk menukar voucher'
      });
    }

    users[userId].points -= 50;
    users[userId].vouchers += 1;

    try {
      saveData(users);
      // Broadcast update voucher
      global.broadcastUpdate('voucher_update', {
        userId,
        points: users[userId].points,
        vouchers: users[userId].vouchers
      });
    } catch (error) {
      console.error('Gagal menyimpan data voucher:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Gagal menyimpan data voucher'
      });
    }

    res.json({
      success: true,
      message: 'Voucher berhasil ditukar',
      vouchers: users[userId].vouchers,
      pointsLeft: users[userId].points
    });
  } catch (error) {
    console.error('Error pada redeemVoucher:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat menukar voucher'
    });
  }
};

// helper function untuk load dan simpan data
function loadData() {
  try {
    const raw = fs.readFileSync(dataPath);
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('File data tidak ditemukan');
    }
    throw new Error('Gagal membaca file data: ' + error.message);
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error('Gagal menyimpan data: ' + error.message);
  }
}