import { useState, useEffect } from 'react'
import ReceiptModal from './ReceiptModal'
import TrashAnimation from './TrashAnimation'
import '../styles/MainSimulator.css'

function MainSimulator() {
  const [showReceipt, setShowReceipt] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [currentTrash, setCurrentTrash] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [points, setPoints] = useState(0)
  const [vouchers, setVouchers] = useState(0)
  const [isTransacting, setIsTransacting] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (data.success) {
          setUserData(data.user)
          setPoints(data.user.points)
          setVouchers(data.user.vouchers || 0)
        } else {
          console.error('Gagal mengambil data user')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleTrashInput = async (type) => {
    setIsTransacting(true)
    const randomCount = Math.floor(Math.random() * 5) + 1
    setCurrentTrash({ type, count: randomCount })
    setShowAnimation(true)

    try {
      const response = await fetch('http://localhost:3000/api/collect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, count: randomCount }) // 👈 perbaikan disini
      })

      const data = await response.json()
      if (data.success) {
        setPoints(data.points)
        setVouchers(data.vouchers)
        setTransactions(prev => [...prev, {
          id: Date.now(),
          type,
          count: randomCount,
          pointsAdded: data.pointsAdded
        }])
      } else {
        alert(data.message || 'Gagal memproses sampah')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat mengirim data')
    }
  }

  const handleFinishTransaction = () => {
    setShowReceipt(true)
    setIsTransacting(false)
    setTransactions([])
  }

  const handleCancelTransaction = () => {
    setTransactions([])
    setIsTransacting(false)
  }

  return (
    <div className="simulator-wrapper">
      <div className="simulator-container">
        <div className="machine-panel">
          <div className="machine-header">
            <h2>🏭 Smart Eco-Rewards</h2>
            <div className="machine-status">Status: Siap Digunakan</div>
          </div>

          <div className="user-info-panel">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <h3>{userData?.name || 'Loading...'}</h3>
              <p className="user-id">ID: {userData?.id || 'Loading...'}</p>
            </div>
          </div>

          <div className="machine-display">
            <div className="stats-grid">
              <div className="points-display">
                <span className="points-value">{points}</span>
                <span className="points-label">Total Poin</span>
              </div>
              <div className="voucher-display">
                <span className="voucher-value">{vouchers}</span>
                <span className="voucher-label">Voucher</span>
              </div>
            </div>
          </div>

          <div className="machine-screen">
            <div className="screen-content">
              <h3>Silakan Pilih Jenis Sampah</h3>
              <p>Pastikan sampah sesuai dengan kategorinya</p>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <div className="trash-buttons">
            <button onClick={() => handleTrashInput('plastic')} className="trash-btn plastic">
              <span className="trash-icon">🧴</span>
              <span className="trash-label">Plastik</span>
              <span className="points-badge">+10</span>
            </button>
            <button onClick={() => handleTrashInput('paper')} className="trash-btn paper">
              <span className="trash-icon">📄</span>
              <span className="trash-label">Kertas</span>
              <span className="points-badge">+8</span>
            </button>
            <button onClick={() => handleTrashInput('metal')} className="trash-btn metal">
              <span className="trash-icon">🧲</span>
              <span className="trash-label">Logam</span>
              <span className="points-badge">+6</span>
            </button>
            <button onClick={() => handleTrashInput('glass')} className="trash-btn glass">
              <span className="trash-icon">🪟</span>
              <span className="trash-label">Kaca</span>
              <span className="points-badge">+4</span>
            </button>
          </div>

          {isTransacting && (
            <div className="transaction-controls">
              <button className="finish-btn" onClick={handleFinishTransaction}>
                ✅ Selesai
              </button>
              <button className="cancel-btn" onClick={handleCancelTransaction}>
                ❌ Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {showAnimation && (
        <TrashAnimation
          type={currentTrash.type}
          count={currentTrash.count}
          onComplete={() => setShowAnimation(false)}
        />
      )}

      {showReceipt && (
        <ReceiptModal
          transactions={transactions}
          totalPoints={points}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}

export default MainSimulator
