import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Harap isi semua field')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      if (data.success) {
        navigate('/')
      } else {
        setError(data.message || 'Email atau password salah')
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
        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email"
            name="email"
            className="login-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input 
            type="password"
            name="password"
            className="login-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <button 
            type="submit"
            className="login-button primary"
          >
            Masuk
          </button>
          <p className="login-divider">atau</p>
          
          
          
          {error && <p className="login-error">{error}</p>}
          <p className="login-register-link">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login