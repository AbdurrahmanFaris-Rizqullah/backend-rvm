import '../styles/components/Header.css'

function Header({ title, showBack = false, onBack }) {
  return (
    <header className="header">
      {showBack && (
        <button className="back-button" onClick={onBack}>
          ←
        </button>
      )}
      <h1 className="header-title">{title}</h1>
    </header>
  )
}

export default Header