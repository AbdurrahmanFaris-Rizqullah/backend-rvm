import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

function Login() {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!userId.trim()) {
      setError('Harap masukkan ID Anda')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/user/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('activeUser', userId)
        navigate('/home')
      } else {
        setError('ID tidak ditemukan')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan, silakan coba lagi')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">🏭 RVM Login</h1>
        <div className="login-form">
          <input 
            type="text"
            className="login-input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Masukkan ID Anda"
          />
          <button 
            className="login-button primary"
            onClick={handleLogin}
          >
            Masuk
          </button>
          <button 
            className="login-button secondary"
            onClick={() => navigate('/scan')}
          >
            Scan QR
          </button>
          {error && <p className="login-error">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default Login