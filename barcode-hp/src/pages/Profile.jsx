import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Profile.css'

function Profile() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          credentials: 'include'
        })
        const data = await response.json()
        if (data.success) {
          setUserData(data.user)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        if (error.message.includes('401')) {
          navigate('/login')
        }
      }
    }
    fetchUserData()
  }, [])
  
  return (
    <div className="profile">
      <div className="nav-header">
        <button className="back-link" onClick={() => navigate('/')}>
          ← Kembali
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-image">👤</div>
          <button className="edit-button">✏️</button>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Nama:</span>
            <span className="info-value">{userData?.name || 'Loading...'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{userData?.email || 'Loading...'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ID Pengguna:</span>
            <span className="info-value">{userData?.id || 'Loading...'}</span>
          </div>
        </div>

        <button className="logout-button" onClick={async () => {
          try {
            await fetch('http://localhost:3000/api/auth/logout', {
              method: 'POST',
              credentials: 'include'
            });
          } catch (error) {
            console.error('Logout error:', error);
          }
          navigate('/login');
        }}>
          Keluar
        </button>
      </div>
    </div>
  )
}

export default Profile