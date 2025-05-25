import { useEffect } from 'react'
function ReceiptModal({ user, transactions, totalPoints, onClose }) {
  const getTrashEmoji = (type) => {
    const emojiMap = {
      plastic: '🧴',
      paper: '📄',
      metal: '🧲',
      glass: '🪟'
    }
    return emojiMap[type] || '♻️'
  }

  const calculateSummary = () => {
    const summary = {}
    for (const t of transactions) {
      if (!summary[t.type]) {
        summary[t.type] = { count: 0, points: 0 }
      }
      summary[t.type].count += t.count
      summary[t.type].points += t.pointsAdded
    }
    return summary
  }

  const summary = calculateSummary()
  const transactionId = Math.floor(Math.random() * 100000)

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal">
        <div className="receipt-header">
          <h2>🏭 Struk Digital RVM</h2>
          <p className="timestamp">{new Date().toLocaleString()}</p>
        </div>

        <div className="receipt-body">
          <div className="transaction-info">
            <p>Nama: {user?.name || 'Pengguna'}</p>
            <p>ID: {user?.id || '---'}</p>
            <p>Transaksi #{transactionId}</p>
          </div>

          <div className="trash-details">
            <h3>Detail Sampah Dimasukkan:</h3>
            {Object.entries(summary).map(([type, { count, points }]) => (
              <div key={type} className="trash-item">
                <span>{getTrashEmoji(type)}</span>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)} x{count}</span>
                <span>+{points} poin</span>
              </div>
            ))}
          </div>

          <div className="points-summary">
            <div className="total-points">
              <h3>Total Poin:</h3>
              <p className="points">+{transactions.reduce((sum, t) => sum + t.pointsAdded, 0)}</p>
            </div>
            <p className="balance">Saldo Poin Saat Ini: {totalPoints}</p>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Terima kasih telah menggunakan Smart Eco-Rewards🌱</p>
          <button className="back-button" onClick={onClose}>
            🔙 Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal