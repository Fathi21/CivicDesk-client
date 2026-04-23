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
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        background: '#1d4ed8', color: '#fff',
        padding: '0 1.5rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        height: 56
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏛️</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>CivicDesk</span>
          <span style={{ opacity: 0.7, fontSize: 13, marginLeft: 4 }}>Cardiff Council</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(['resident', 'admin'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: '#fff', border: 'none', borderRadius: 6,
              padding: '0.4rem 0.875rem', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t ? 600 : 400,
              textTransform: 'capitalize'
            }}>
              {t === 'resident' ? 'Resident Portal' : 'Admin'}
            </button>
          ))}
          {isAuthenticated && (
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
              padding: '0.4rem 0.875rem', cursor: 'pointer',
              fontSize: 13, marginLeft: 8
            }}>
              Sign out
            </button>
          )}
        </nav>
      </header>

      {/* Hero */}
      {tab === 'resident' && (
        <div style={{
          background: '#1e40af', color: '#fff',
          padding: '2.5rem 1.5rem', textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: 28 }}>
            Cardiff Council Self-Service Portal
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 16 }}>
            Report issues, submit service requests and track progress online.
          </p>
        </div>
      )}

      {/* Main */}
      <main>
        {tab === 'resident' ? (
          <ReportPage
            preFill={preFill}
            onClearPreFill={() => setPreFill(undefined)}
          />
        ) : isAuthenticated ? (
          <AdminPage />
        ) : (
          <LoginPage onSuccess={() => setIsAuthenticated(true)} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '2rem',
        color: '#9ca3af', fontSize: 13,
        borderTop: '1px solid #e5e7eb', marginTop: '2rem'
      }}>
        © 2026 Cardiff Council · CivicDesk Demo
      </footer>

      <ChatWidget onPreFill={handlePreFill} />
    </div>
  )
}
