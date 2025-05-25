import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import QrLogin from './pages/QrLogin'
import MainSimulator from './components/MainSimulator'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* QR Login sebagai halaman default */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<QrLogin />} />
          {/* Simulator hanya bisa diakses setelah scan QR */}
          <Route path="/simulator" element={
            <ProtectedRoute>
              <MainSimulator />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

function ProtectedRoute({ children }) {
  // Cek status login dari localStorage yang diset saat scan QR berhasil
  const isAuthenticated = localStorage.getItem('simulatorAuth')
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}

export default App
