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
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
          localStorage.removeItem('token')
          navigate('/login')
        }
      }
    }
    fetchUserData()
  }, [])

  const handleScan = async (result) => {
    if (result) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/user/scan', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
          // Token tidak valid, redirect ke login
          localStorage.removeItem('token')
          navigate('/login')
        }
      }
    }
  }

  const handleError = (error) => {
    console.error(error)
    alert('Gagal mengakses kamera. Pastikan izin kamera diberikan')
    setScanning(false)
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
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            facingMode="environment"
          />
        ) : (
          <div className="scan-area">
            <p>Tekan tombol Scan QR untuk mulai</p>
          </div>
        )}
      </div>

      <div className="voucher-section">
        <div className="voucher-info">
          <span className="voucher-icon">🎫</span>
          <span className="voucher-text">Tukarkan 50 poin untuk 1 voucher</span>
        </div>
        <button 
          className="redeem-button" 
          onClick={handleRedeemVoucher}
          disabled={points < 50}
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