import { useEffect } from 'react'
import '../styles/ReceiptModal.css'

function ReceiptModal({ transaction, onClose }) {
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
            <p>ID Transaksi: {transaction.id}</p>
            <p>Status: ✅ Berhasil</p>
          </div>

          <div className="trash-details">
            <h3>Detail Sampah:</h3>
            <div className="trash-item">
              <span>{getTrashEmoji(transaction.type)}</span>
              <span>{transaction.type}</span>
              <span>+{getPointValue(transaction.type)} poin</span>
            </div>
          </div>

          <div className="points-summary">
            <div className="total-points">
              <h3>Total Poin:</h3>
              <p className="points">+{transaction.pointsAdded}</p>
            </div>
            <p className="balance">Saldo Poin: {transaction.total}</p>
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