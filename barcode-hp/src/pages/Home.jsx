import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import VoucherPopup from '../components/VoucherPopup'
import '../styles/Home.css'

function Home() {
  const [points, setPoints] = useState(0)
  const [vouchers, setVouchers] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let html5QrCode

    if (scanning) {
      html5QrCode = new Html5Qrcode("reader")
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScan(decodedText)
          html5QrCode.stop()
          setScanning(false)
        },
        (error) => {
          console.error("QR Scan error:", error)
        }
      )
    }

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(err => console.error(err))
      }
    }
  }, [scanning])

  const handleScan = async (result) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: result })
      })
      const data = await response.json()
      if (data.success) {
        setPoints(data.user.points || 0)
        setVouchers(data.user.vouchers || 0)
      }
    } catch (error) {
      console.error('Scan error:', error)
    }
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
          <h2>Dila Faradila</h2>
          <p>ID: RVM123</p>
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
          <div id="reader"></div>
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