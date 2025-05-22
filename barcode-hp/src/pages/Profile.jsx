import { useNavigate } from 'react-router-dom'
import '../styles/Profile.css'

function Profile() {
  const navigate = useNavigate()
  
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
            <span className="info-value">Dila Faradila</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">dila@gmail.com</span>
          </div>
          <div className="info-row">
            <span className="info-label">ID Pengguna:</span>
            <span className="info-value">JX12R5P</span>
          </div>
        </div>

        <button className="logout-button" onClick={() => {
          localStorage.removeItem('activeUser')
          navigate('/')
        }}>
          Keluar
        </button>
      </div>
    </div>
  )
}

export default Profile