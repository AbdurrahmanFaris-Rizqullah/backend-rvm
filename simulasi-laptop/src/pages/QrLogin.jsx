import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/QrLogin.css'

function QrLogin() {
  const [qrCode, setQrCode] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let pollInterval;
    
    const generateQR = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/generate-qr', {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          setQrCode(data.qrCode)
          // Mulai polling setelah QR dibuat
          pollInterval = setInterval(checkLoginStatus, 2000)
        }
      } catch (error) {
        console.error('Error generating QR:', error)
      }
    }

    const checkLoginStatus = async () => {
      if (!qrCode) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/auth/check-login?qrCode=${qrCode}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.isLoggedIn) {
          clearInterval(pollInterval);
          navigate('/simulator'); // Ini yang akan mengarahkan ke MainSimulator
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    generateQR()

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [])

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