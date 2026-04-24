import { useState } from 'react'
import ReportPage from './pages/ReportPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import ChatWidget from './components/ChatWidget'
import { auth, tokenStore } from './services/api'
import type { PreFill } from './types'

type Tab = 'resident' | 'admin'

export default function App() {
  const [tab, setTab] = useState<Tab>('resident')
  const [preFill, setPreFill] = useState<PreFill | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenStore.isAdmin())

  const handlePreFill = (pf: PreFill) => {
    setPreFill(pf)
    setTab('resident')
  }

  const handleLogout = () => {
    auth.logout()
    setIsAuthenticated(false)
    setTab('resident')
  }

  return (
    <div className="app">

      <header className="header">
        <div className="header-brand">
          <span className="header-brand-icon">🏛️</span>
          <span className="header-brand-name">CivicDesk</span>
          <span className="header-brand-sep">·</span>
          <span className="header-brand-sub">Cardiff Council</span>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-btn${tab === 'resident' ? ' active' : ''}`}
            onClick={() => setTab('resident')}
          >
            Resident
          </button>
          <button
            className={`nav-btn${tab === 'admin' ? ' active' : ''}`}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
          {isAuthenticated && (
            <button className="nav-signout" onClick={handleLogout}>
              Sign out
            </button>
          )}
        </nav>
      </header>

      {tab === 'resident' && (
        <div className="hero">
          <h1 className="hero-title">Cardiff Council Self-Service Portal</h1>
          <p className="hero-sub">Report issues, submit service requests and track progress online.</p>
        </div>
      )}

      <main style={{ flex: 1 }}>
        {tab === 'resident' ? (
          <ReportPage preFill={preFill} onClearPreFill={() => setPreFill(undefined)} />
        ) : isAuthenticated ? (
          <AdminPage />
        ) : (
          <LoginPage onSuccess={() => setIsAuthenticated(true)} />
        )}
      </main>

      <footer className="footer">
        © 2026 Cardiff Council · CivicDesk
      </footer>

      <ChatWidget onPreFill={handlePreFill} />
    </div>
  )
}
