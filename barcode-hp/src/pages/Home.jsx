import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QrReader from 'react-qr-reader-es6'
import VoucherPopup from '../components/VoucherPopup'
import '../styles/Home.css'

function Home() {
  const [points, setPoints] = useState(0)
  const [vouchers, setVouchers] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [userData, setUserData] = useState(null)
  const [hasPermission, setHasPermission] = useState(false)  // State untuk izin kamera
  const navigate = useNavigate()

  // Effect untuk mengambil data user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          credentials: 'include'
        })
        const data = await response.json()
        if (data.success) {
          setUserData(data.user)
          setPoints(data.user.points || 0)
          setVouchers(data.user.vouchers || 0)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        if (error.message.includes('401')) {
          navigate('/login')
        }
      }
    }
    fetchUserData()
  }, [])

  // Effect untuk mengatur izin kamera
  useEffect(() => {
    if (scanning) {
      if (
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
      ) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(() => setHasPermission(true))
          .catch((err) => {
            console.error('Camera permission error:', err)
            alert('Mohon berikan izin akses kamera untuk menggunakan fitur scan QR')
            setScanning(false)
          })
      } else {
        console.warn('getUserMedia tidak didukung di browser ini.')
        alert('Browser ini tidak mendukung akses kamera.')
        setScanning(false)
      }
    } else {
      setHasPermission(false)
    }
  }, [scanning])
  

  const handleScan = async (result) => {
    if (result) {
      try {
        // Cek apakah QR code untuk login
        if (result.startsWith('LOGIN_')) {
          const response = await fetch('http://localhost:3000/api/auth/verify-qr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ qrCode: result })
          })

          const data = await response.json()
          if (data.success) {
            alert('Login berhasil!')
            setScanning(false)
          }
          return // Keluar dari fungsi setelah handle login QR
        }

        // Handle QR sampah seperti biasa
        const response = await fetch('http://localhost:3000/api/scan', {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ qrData: result })
        })
        const data = await response.json()
        if (data.success) {
          setPoints(data.points)
          setVouchers(data.vouchers)
        }
        setScanning(false)
      } catch (error) {
        console.error('Scan error:', error)
        if (error.message.includes('401')) {
          navigate('/login')
        }
        alert('Gagal memverifikasi QR code')
      }
    }
  }

  const handleError = (error) => {
    console.error(error)
    alert('Gagal mengakses kamera. Pastikan izin kamera diberikan')
    setScanning(false)
    setHasPermission(false)
  }

  const handleRedeemVoucher = () => {
    if (points >= 50) {
      setPoints(points - 50)
      setVouchers(vouchers + 1)
      setShowPopup(true)
    }
  }

  return (
    <div className="home">
      <div className="profile-header">
        <div className="user-info">
          <h2>{userData?.name || 'Loading...'}</h2>
          <p>ID: {userData?.id || '...'}</p>
        </div>
        <button className="profile-button" onClick={() => navigate('/profile')}>
          👤
        </button>
      </div>

      <div className="points-section">
        <div className="point-card">
          <span className="point-value">{points}</span>
          <span className="point-label">Total Poin</span>
        </div>
        <div className="point-card">
          <span className="point-value">{vouchers}</span>
          <span className="point-label">Voucher</span>
        </div>
      </div>

      <div className="scan-section">
        {scanning ? (
          hasPermission ? (
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
              constraints={{
                facingMode: 'environment',
                aspectRatio: 1
              }}
            />
          ) : (
            <div className="scan-area">
              <p>Meminta izin kamera...</p>
            </div>
          )
        ) : (
          <div className="scan-area">
            <p>Tekan tombol Scan QR untuk mulai</p>
          </div>
        )}
      </div>

      <div className="voucher-section">
        <div className="voucher-info">
          <span className="voucher-icon">🎫</span>
          <span className="voucher-text">Tukarkan 100 poin untuk 1 voucher</span>
        </div>
        <button 
          className="redeem-button" 
          onClick={handleRedeemVoucher}
          disabled={points < 100}
        >
          Tukar
        </button>
      </div>

      <button 
        className="scan-button" 
        onClick={() => setScanning(!scanning)}
      >
        {scanning ? '❌ Batal' : '📷 Scan QR'}
      </button>

      {showPopup && <VoucherPopup onClose={() => setShowPopup(false)} />}
    </div>
  )
}

export default Home
