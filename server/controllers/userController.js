const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.scanQR = async (req, res) => {
  try {
    const userId = req.user.userId; // Mengambil userId dari token
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'userId is required',
        message: 'ID pengguna harus disertakan' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        points: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Pengguna tidak ditemukan'
      });
    }

    res.json({ 
      success: true,
      message: 'Scan berhasil', 
      user: user
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

exports.collectTrash = async (req, res) => {
  try {
    const userId = req.user.userId; // dari middleware autentikasi
    const { type, count = 1 } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ 
        success: false,
        message: 'ID pengguna dan tipe sampah harus disertakan'
      });
    }

    const trashType = await prisma.trashType.findUnique({
      where: { name: type }
    });

    if (!trashType) {
      return res.status(404).json({
        success: false,
        message: 'Tipe sampah tidak ditemukan'
      });
    }

    const totalPoints = trashType.points * count;

    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          trashTypeId: trashType.id,
          quantity: count,
          points: totalPoints
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: totalPoints }
        },
        include: {
          voucherRedemptions: {
            where: {
              isUsed: false,
              expiresAt: { gt: new Date() }
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      message: `Berhasil mengumpulkan ${type}`,
      pointsAdded: totalPoints,
      points: updatedUser.points,
      vouchers: updatedUser.voucherRedemptions.length
    });
  } catch (error) {
    console.error('Error pada collectTrash:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses pengumpulan sampah'
    });
  }
};


exports.redeemVoucher = async (req, res) => {
  // console.log('👉 req.user:', req.user);
  try {
    // ✅ FIXED: ambil id user dari token
    const userId = req.user.userId;

    const POINTS_NEEDED = 100;
    const DISCOUNT_PERCENT = 10;
    const VALIDITY_DAYS = 30;

    // Cek user dari database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Pengguna tidak ditemukan'
      });
    }

    if (user.points < POINTS_NEEDED) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient points',
        message: 'Poin tidak mencukupi untuk menukar voucher'
      });
    }

    // Hitung masa berlaku voucher
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + VALIDITY_DAYS);

    // Simpan ke database dalam transaksi
    const [voucher, updatedUser] = await prisma.$transaction([
      prisma.voucherRedemption.create({
        data: {
          userId,
          points: POINTS_NEEDED,
          discount: DISCOUNT_PERCENT,
          expiresAt: expiryDate
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { decrement: POINTS_NEEDED }
        }
      })
    ]);

    // Broadcast jika ada (opsional)
    if (global.broadcastUpdate) {
      global.broadcastUpdate('voucher_update', {
        userId,
        points: updatedUser.points,
        voucher
      });
    }

    // Kirim response sukses
    return res.json({
      success: true,
      message: 'Voucher berhasil ditukar',
      voucher,
      pointsLeft: updatedUser.points
    });

  } catch (error) {
    console.error('Error pada redeemVoucher:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Terjadi kesalahan saat menukar voucher'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        voucherRedemptions: {
          where: {
            isUsed: false,
            expiresAt: {
              gt: new Date()
            }
          },
          select: {
            id: true,
            points: true,
            discount: true,
            expiresAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Format response
    const formattedUser = {
      ...user,
      vouchers: user.voucherRedemptions.length // Menghitung jumlah voucher aktif
    };
    delete formattedUser.voucherRedemptions;

    res.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data profil'
    });
  }
};