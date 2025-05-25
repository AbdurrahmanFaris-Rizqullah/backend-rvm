import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import VoucherPopup from '../components/VoucherPopup'
import '../styles/Home.css'
import { Html5Qrcode } from 'html5-qrcode'

function Home() {
  const [points, setPoints] = useState(0)
  const [vouchers, setVouchers] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [userData, setUserData] = useState(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState(null)
  const [hasScanned, setHasScanned] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const ref = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/profile', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data = await res.json()
        if (data.success) {
          setUserData(data.user)
          setPoints(data.user.points || 0)
          setVouchers(data.user.vouchers || 0)
        } else throw new Error('Invalid server response')
      } catch (err) {
        console.error('Fetch error:', err)
        if (err.message.includes('401')) navigate('/login')
      }
    }
    fetchUserData()
  }, [navigate])

  useEffect(() => {
    if (!scanning) {
      setHasPermission(false)
      return
    }

    const requestCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        setHasPermission(true)
      } catch (err) {
        console.error('Camera permission error:', err)
        alert('Mohon berikan izin kamera')
        setScanning(false)
      }
    }

    if (navigator?.mediaDevices?.getUserMedia) {
      requestCamera()
    } else {
      alert('Browser ini tidak mendukung kamera')
      setScanning(false)
    }
  }, [scanning])

  useEffect(() => {
    let scanner

    const startScanner = async () => {
      if (scanning && hasPermission && ref.current) {
        scanner = new Html5Qrcode(ref.current.id)
        setHtml5QrCode(scanner)

        try {
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            handleScan,
            (err) => {
              if (!err.toString().includes('NotFoundException')) {
                console.warn('Scan gagal:', err)
              }
            }
          )
          setErrorMessage(null)
        } catch (err) {
          console.error('Start scanner error:', err)
          setErrorMessage('Gagal memulai scanner: ' + err.message)
          setScanning(false)
        }
      }
    }

    startScanner()

    return () => {
      const stopAndClear = async () => {
        try {
          if (scanner) {
            if (scanner.getState() === 2) { // 2 = SCANNING
              await scanner.stop()
            }
            await scanner.clear()
          }
        } catch (err) {
          console.error('Cleanup scanner error:', err)
        }
      }
      stopAndClear()
    }
  }, [scanning, hasPermission])

  const handleScan = async (decodedText) => {
    if (hasScanned || !decodedText.startsWith('LOGIN_')) return
    setHasScanned(true)

    try {
      const res = await fetch('http://localhost:3000/api/auth/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ qrCode: decodedText }),
      })

      if (res.ok) {
        await html5QrCode?.stop()
        await html5QrCode?.clear()
        setHtml5QrCode(null)
        setScanning(false)
        console.log('Login berhasil')
      } else {
        console.error('Login gagal')
        alert('QR tidak valid atau sudah digunakan.')
        setHasScanned(false)
      }
    } catch (err) {
      console.error('QR Submit Error:', err)
      alert('Terjadi kesalahan saat mengirim QR')
      setHasScanned(false)
    }
  }

  const handleRedeemVoucher = () => {
    if (points >= 100) {
      setPoints(points - 100)
      setVouchers(vouchers + 1)
      setShowPopup(true)
    }
  }

  const handleToggleScan = async () => {
    if (scanning) {
      try {
        if (html5QrCode?.getState() === 2) {
          await html5QrCode.stop()
        }
        await html5QrCode?.clear()
      } catch (err) {
        console.error('Stop error:', err)
      }
      setHtml5QrCode(null)
      setScanning(false)
      setHasScanned(false)
    } else {
      setHasScanned(false)
      setScanning(true)
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
        {errorMessage && (
          <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>
        )}
        {scanning ? (
          hasPermission ? (
            <div id="reader" ref={ref} style={{ width: 300, height: 300 }} />
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

      <button className="scan-button" onClick={handleToggleScan}>
        {scanning ? '❌ Batal' : '📷 Scan QR'}
      </button>

      {showPopup && <VoucherPopup onClose={() => setShowPopup(false)} />}
    </div>
  )
}

export default Home
