import { useEffect } from 'react'
import '../styles/ReceiptModal.css'

function ReceiptModal({ transactions, totalPoints, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)  // Otomatis hilang setelah 5 detik

    return () => clearTimeout(timer)
  }, [onClose])

  const getPointValue = (type) => {
    const pointMap = {
      plastic: 10,
      paper: 5,
      metal: 15,
      glass: 20,
      organic: 30,
      mantan: 50
    }
    return pointMap[type] || 0
  }

  const getTrashEmoji = (type) => {
    const emojiMap = {
      plastic: '🧴',
      paper: '📄',
      metal: '🧲',
      glass: '🪟',
      organic: '🥬',
      mantan: '👻'
    }
    return emojiMap[type] || '♻️'
  }

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal">
        <div className="receipt-header">
          <h2>🏭 Struk Digital RVM</h2>
          <p className="timestamp">{new Date().toLocaleString()}</p>
        </div>

        <div className="receipt-body">
          <div className="transaction-info">
            <p>Nama: Dila Faradila</p>
            <p>ID: RVM123</p>
            <p>Transaksi #{Math.floor(Math.random() * 1000)}</p>
          </div>

          <div className="trash-details">
            <h3>Detail Sampah:</h3>
            {transactions.map(t => (
              <div key={t.id} className="trash-item">
                <span>{getTrashEmoji(t.type)}</span>
                <span>{t.type} x{t.count}</span>
                <span>+{t.pointsAdded} poin</span>
              </div>
            ))}
          </div>

          <div className="points-summary">
            <div className="total-points">
              <h3>Total Poin:</h3>
              <p className="points">+{transactions.reduce((sum, t) => sum + t.pointsAdded, 0)}</p>
            </div>
            <p className="balance">Saldo Poin: {totalPoints}</p>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Terima kasih telah menggunakan RVM! 🌱</p>
          <small>Struk ini akan hilang dalam 5 detik</small>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal