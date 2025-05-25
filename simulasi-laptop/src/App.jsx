import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import QrLogin from './pages/QrLogin'
import MainSimulator from './components/MainSimulator'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<QrLogin />} />
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
  const isAuthenticated = localStorage.getItem('simulatorAuth')
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}

export default App
