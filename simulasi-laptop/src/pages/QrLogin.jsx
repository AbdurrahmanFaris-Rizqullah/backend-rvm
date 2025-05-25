import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/QrLogin.css'

function QrLogin() {
  const [qrCode, setQrCode] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let pollInterval

    const generateQR = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/generate-qr', {
          method: 'POST',
          credentials: 'include'
        })
        const data = await response.json()

        if (data.success) {
          setQrCode(data.qrCode)
          pollInterval = setInterval(() => checkLoginStatus(data.qrCode), 2000)
        } else {
          console.error('Gagal generate QR code:', data.message)
        }
      } catch (error) {
        console.error('Error generating QR:', error)
      }
    }

    const checkLoginStatus = async (qrCodeToCheck) => {
      if (!qrCodeToCheck) return
      if (isChecking) return
      setIsChecking(true)

      try {
        const response = await fetch(`http://localhost:3000/api/auth/check-login?qrCode=${qrCodeToCheck}`, {
          method: 'GET',
          credentials: 'include'
        })

        const data = await response.json()

        if (data.success && data.isLoggedIn) {
          clearInterval(pollInterval)
          localStorage.setItem('simulatorAuth', 'true') // ✅ set flag login
          console.log('Login berhasil, redirect ke simulator.')
          navigate('/simulator')
        }
      } catch (error) {
        console.error('Error checking login status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    generateQR()

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [navigate])

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
            <p>Menyiapkan QR Code...</p>
          )}
        </div>
        <p>Scan QR code menggunakan aplikasi Smart Eco-Rewards di HP Anda</p>
      </div>
    </div>
  )
}

export default QrLogin
