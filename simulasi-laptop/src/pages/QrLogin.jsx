import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/QrLogin.css'

function QrLogin() {
  const [qrCode, setQrCode] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Generate QR code dari server
    const generateQR = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/generate-qr', {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          setQrCode(data.qrCode)
        }
      } catch (error) {
        console.error('Error generating QR:', error)
      }
    }
    generateQR()

    // Setup WebSocket connection
    const ws = new WebSocket('ws://localhost:3000')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'login' && data.data.qrCode === qrCode) {
        // Redirect ke simulator
        navigate('/simulator')
      }
    }

    return () => ws.close()
  }, [qrCode, navigate])

  return (
    <div className="qr-login">
      <div className="qr-container">
        <h1>🏭 Smart Eco-Rewards</h1>
        <div className="qr-display">
          {qrCode && (
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrCode}&size=200x200`}
              alt="Login QR Code"
            />
          )}
        </div>
        <p>Scan QR code menggunakan aplikasi Smart Eco-Rewards di HP Anda</p>
      </div>
    </div>
  )
}

export default QrLogin