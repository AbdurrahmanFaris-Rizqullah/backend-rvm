import { useEffect, useState } from 'react'
import '../styles/TrashAnimation.css'

function TrashAnimation({ type, count, onComplete }) {
  const [randomNumber] = useState(() => Math.floor(Math.random() * 5) + 1)

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, count * 300 + 1000) // Menyesuaikan waktu berdasarkan jumlah sampah
    return () => clearTimeout(timer)
  }, [onComplete, count])

  return (
    <div className="animation-container">
      <div className="random-number">{randomNumber}</div>
      <div className="trash-bin">🗑️</div>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="falling-trash"
          style={{ 
            left: '50%',
            animationDuration: '1s',
            animationDelay: `${i * 0.3}s`
          }}
        >
          {type === 'plastic' && '🧴'}
          {type === 'paper' && '📄'}
          {type === 'metal' && '🧲'}
          {type === 'glass' && '🪟'}
          {type === 'organic' && '🥬'}
          {type === 'mantan' && '👻'}
        </div>
      ))}
    </div>
  )
}

export default TrashAnimation