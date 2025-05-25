import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Login.css'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validasi form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Harap isi semua field')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Redirect ke login setelah registrasi berhasil
        navigate('/login')
      } else {
        setError(data.message || 'Gagal mendaftar')
      }
    } catch (error) {
      console.error('Register error:', error)
      setError('Terjadi kesalahan, silakan coba lagi')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">🏭 RVM Register</h1>
        <form className="login-form" onSubmit={handleRegister}>
          <input 
            type="text"
            name="name"
            className="login-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama Lengkap"
          />
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
          <input 
            type="password"
            name="confirmPassword"
            className="login-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Konfirmasi Password"
          />
          <button 
            type="submit"
            className="login-button primary"
          >
            Daftar
          </button>
          {error && <p className="login-error">{error}</p>}
          <p className="login-register-link">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register