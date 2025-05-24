import { useEffect } from 'react'
import '../styles/TrashAnimation.css'

function TrashAnimation({ type, count, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="animation-container">
      <div className="trash-bin">🗑️</div>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="falling-trash"
          style={{ 
            left: `${Math.random() * 80 + 10}%`,
            animationDelay: `${i * 0.2}s`
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