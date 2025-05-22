import { useState } from 'react'
import ReceiptModal from './ReceiptModal'
import '../styles/MainSimulator.css'

function MainSimulator() {
  const [showReceipt, setShowReceipt] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [points, setPoints] = useState(0)
  const [vouchers, setVouchers] = useState(0)

  const handleTrashInput = async (type) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: 'SIMULATOR', type })
      })
      
      const data = await response.json()
      if (data.success) {
        setPoints(data.total)
        setTransaction({
          id: Date.now(),
          type,
          pointsAdded: data.pointsAdded,
          total: data.total
        })
        setShowReceipt(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal memproses sampah')
    }
  }

  return (
    <div className="simulator-wrapper">
      <div className="simulator-container">
        <div className="machine-panel">
          <div className="machine-header">
            <h2>🏭 RVM Simulator</h2>
            <div className="machine-status">Status: Siap Digunakan</div>
          </div>

          <div className="user-info-panel">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <h3>Dila Faradila</h3>
              <p className="user-id">ID: RVM123</p>
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
              <span className="points-badge">+5</span>
            </button>
            <button onClick={() => handleTrashInput('metal')} className="trash-btn metal">
              <span className="trash-icon">🧲</span>
              <span className="trash-label">Logam</span>
              <span className="points-badge">+15</span>
            </button>
            <button onClick={() => handleTrashInput('glass')} className="trash-btn glass">
              <span className="trash-icon">🪟</span>
              <span className="trash-label">Kaca</span>
              <span className="points-badge">+20</span>
            </button>
            <button onClick={() => handleTrashInput('organic')} className="trash-btn organic">
              <span className="trash-icon">🥬</span>
              <span className="trash-label">Organik</span>
              <span className="points-badge">+30</span>
            </button>
            <button onClick={() => handleTrashInput('mantan')} className="trash-btn mantan">
              <span className="trash-icon">👻</span>
              <span className="trash-label">Mantan</span>
              <span className="points-badge">+50</span>
            </button>
          </div>
        </div>
      </div>

      {showReceipt && (
        <ReceiptModal 
          transaction={transaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}

export default MainSimulator