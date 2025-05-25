import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/QrLogin.css'

function QrLogin() {
  const [qrCode, setQrCode] = useState('')
  const [pollIntervalId, setPollIntervalId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const generateQR = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/generate-qr', {
          method: 'POST',
          credentials: 'include',
        })
        const data = await response.json()
        if (data.success) {
          setQrCode(data.qrCode)

          // Mulai polling
          const intervalId = setInterval(() => {
            checkLoginStatus(data.qrCode)
          }, 2000)

          setPollIntervalId(intervalId)
        }
      } catch (error) {
        console.error('Error generating QR:', error)
      }
    }

    const checkLoginStatus = async (code) => {
      try {
        const response = await fetch(`http://localhost:3000/api/auth/check-login?qrCode=${code}`, {
          credentials: 'include'
        })
        const data = await response.json()

        if (data.success && data.isLoggedIn) {
          clearInterval(pollIntervalId)
          navigate('/simulator')
        }
      } catch (error) {
        console.error('Error checking login status:', error)
      }
    }

    generateQR()

    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId)
    }
  }, [navigate, pollIntervalId])

  return (
    <div className="qr-login">
      <div className="qr-container">
        <h1>🏭 Smart Eco-Rewards</h1>
        <div className="qr-display">
          {qrCode ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrCode}&size=200x200`}
              alt="Login QR Code"
            />
          ) : (
            <p>Memuat QR Code...</p>
          )}
        </div>
        <p>Scan QR code menggunakan aplikasi Smart Eco-Rewards di HP Anda</p>
      </div>
    </div>
  )
}

export default QrLogin
