import { useState, useEffect } from 'react'
import { serviceRequests, auth, tokenStore } from '../services/api'
import { RequestType, RequestStatus } from '../types'
import type { ServiceRequest, PreFill } from '../types'

interface Props {
  preFill?: PreFill
  onClearPreFill: () => void
}

const statusLabel: Record<RequestStatus, string> = {
  [RequestStatus.Submitted]: 'Submitted',
  [RequestStatus.InReview]:  'In Review',
  [RequestStatus.InProgress]:'In Progress',
  [RequestStatus.Resolved]:  'Resolved',
  [RequestStatus.Closed]:    'Closed',
}

const statusColour: Record<RequestStatus, string> = {
  [RequestStatus.Submitted]: '#3b82f6',
  [RequestStatus.InReview]:  '#f59e0b',
  [RequestStatus.InProgress]:'#8b5cf6',
  [RequestStatus.Resolved]:  '#22c55e',
  [RequestStatus.Closed]:    '#6b7280',
}

const typeLabel: Record<RequestType, string> = {
  [RequestType.Pothole]:        'Pothole',
  [RequestType.MissedBin]:      'Missed Bin',
  [RequestType.NoiseComplaint]: 'Noise Complaint',
  [RequestType.PlanningQuery]:  'Planning Query',
  [RequestType.StreetLighting]: 'Street Lighting',
  [RequestType.Other]:          'Other',
}

export default function ReportPage({ preFill, onClearPreFill }: Props) {
  const [type, setType]                   = useState<RequestType>(RequestType.Pothole)
  const [fullName, setFullName]           = useState('')
  const [email, setEmail]                 = useState('')
  const [addressOrLocation, setAddress]   = useState('')
  const [description, setDescription]     = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [submitted, setSubmitted]         = useState<ServiceRequest | null>(null)
  const [error, setError]                 = useState('')

  const [trackRef, setTrackRef]     = useState('')
  const [tracked, setTracked]       = useState<ServiceRequest | null>(null)
  const [trackError, setTrackError] = useState('')
  const [tracking, setTracking]     = useState(false)

  const [residentAuthed, setResidentAuthed] = useState(() => tokenStore.isResident())
  const [myRequests, setMyRequests]         = useState<ServiceRequest[]>([])
  const [loadingMy, setLoadingMy]           = useState(false)
  const [myEmail, setMyEmail]               = useState('')
  const [myRef, setMyRef]                   = useState('')
  const [myError, setMyError]               = useState('')
  const [signingIn, setSigningIn]           = useState(false)

  useEffect(() => {
    if (!preFill) return
    const matched = Object.entries(RequestType).find(
      ([key]) => key.toLowerCase() === preFill.type.toLowerCase()
    )
    if (matched) setType(matched[1] as RequestType)
    setDescription(preFill.description)
  }, [preFill])

  useEffect(() => {
    if (residentAuthed) fetchMyRequests()
  }, [residentAuthed])

  const fetchMyRequests = async () => {
    setLoadingMy(true)
    try {
      const data = await serviceRequests.getMy()
      setMyRequests(data)
    } finally {
      setLoadingMy(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!fullName || !email || !addressOrLocation || !description) {
      setError('All fields are required.')
      return
    }
    setSubmitting(true)
    try {
      const result = await serviceRequests.create({ type, fullName, email, addressOrLocation, description })
      setSubmitted(result)
      setFullName(''); setEmail(''); setAddress(''); setDescription('')
      setType(RequestType.Pothole)
      onClearPreFill()
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTrack = async () => {
    setTrackError(''); setTracked(null)
    if (!trackRef.trim()) return
    setTracking(true)
    try {
      setTracked(await serviceRequests.getByReference(trackRef.trim()))
    } catch {
      setTrackError('No request found with that reference number.')
    } finally {
      setTracking(false)
    }
  }

  const handleResidentSignIn = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setMyError(''); setSigningIn(true)
    try {
      await auth.residentLogin({ email: myEmail, referenceNumber: myRef.trim() })
      setResidentAuthed(true)
    } catch {
      setMyError('No request found matching that email and reference number.')
    } finally {
      setSigningIn(false)
    }
  }

  const handleResidentSignOut = () => {
    auth.residentLogout()
    setResidentAuthed(false)
    setMyRequests([])
    setMyEmail(''); setMyRef('')
  }

  return (
    <div className="page page-narrow">

      {/* Pre-fill banner */}
      {preFill && (
        <div className="prefill-banner">
          <span className="prefill-banner-text">✦ Form pre-filled by CivicAssist</span>
          <button className="prefill-clear" onClick={onClearPreFill}>Clear</button>
        </div>
      )}

      {/* ── Report an Issue ── */}
      {submitted ? (
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h2>Request Submitted</h2>
          <p style={{ margin: '0 0 0.25rem', color: '#374151' }}>
            Reference: <strong>{submitted.referenceNumber}</strong>
          </p>
          <p className="text-sm text-3" style={{ marginBottom: '1.5rem' }}>
            Confirmation sent to {submitted.email}
          </p>
          <button className="btn btn-primary" onClick={() => setSubmitted(null)}>
            Submit Another
          </button>
        </div>
      ) : (
        <>
          <h2 className="page-heading">Report an Issue</h2>

          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <div className="form-stack">
            <div className="form-group">
              <label className="form-label">Request Type</label>
              <select className="form-select" value={type} onChange={e => setType(Number(e.target.value))}>
                <option value={RequestType.Pothole}>Pothole</option>
                <option value={RequestType.MissedBin}>Missed Bin Collection</option>
                <option value={RequestType.NoiseComplaint}>Noise Complaint</option>
                <option value={RequestType.PlanningQuery}>Planning Query</option>
                <option value={RequestType.StreetLighting}>Street Lighting Fault</option>
                <option value={RequestType.Other}>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Address or Location of Issue</label>
              <input className="form-input" value={addressOrLocation} onChange={e => setAddress(e.target.value)} placeholder="e.g. Junction of High Street and Park Road, Cardiff" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in as much detail as possible…" rows={4} />
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </>
      )}

      {/* ── Track a Request ── */}
      <div className="section">
        <h2 className="page-heading">Track a Request</h2>
        <div className="row">
          <input
            className="form-input"
            value={trackRef}
            onChange={e => setTrackRef(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            placeholder="e.g. POT-20260417-AB1C2D"
          />
          <button className="btn btn-primary flex-none" onClick={handleTrack} disabled={tracking}>
            {tracking ? '…' : 'Track'}
          </button>
        </div>

        {trackError && <p className="text-sm" style={{ color: 'var(--error)', marginTop: 8 }}>{trackError}</p>}

        {tracked && (
          <div className="track-card">
            <div className="track-card-top">
              <span className="track-card-ref">{tracked.referenceNumber}</span>
              <span className="badge" style={{ background: statusColour[tracked.status] }}>
                {statusLabel[tracked.status]}
              </span>
            </div>
            <p className="text-sm text-2 mb-1">{tracked.addressOrLocation}</p>
            <p className="text-sm text-3">{tracked.description}</p>
            {tracked.adminNotes && (
              <p className="track-card-note">Note: {tracked.adminNotes}</p>
            )}
          </div>
        )}
      </div>

      {/* ── My Requests ── */}
      <div className="section">
        <h2 className="page-heading">My Requests</h2>

        {residentAuthed ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-sm text-3">All requests linked to your account</span>
              <button className="btn btn-secondary btn-sm" onClick={handleResidentSignOut}>Sign out</button>
            </div>

            {loadingMy ? (
              <p className="empty-state">Loading…</p>
            ) : myRequests.length === 0 ? (
              <p className="empty-state">No requests found.</p>
            ) : (
              <div>
                {myRequests.map(req => (
                  <div key={req.id} className="my-card">
                    <div className="my-card-top">
                      <span className="my-card-ref">{req.referenceNumber}</span>
                      <span className="badge" style={{ background: statusColour[req.status] }}>
                        {statusLabel[req.status]}
                      </span>
                    </div>
                    <p className="text-sm text-2 mb-1">
                      <strong>{typeLabel[req.type]}</strong> — {req.addressOrLocation}
                    </p>
                    <p className="text-xs text-3">{req.description}</p>
                    {req.adminNotes && (
                      <p className="my-card-note">Note: {req.adminNotes}</p>
                    )}
                    <p className="my-card-date">
                      Submitted {new Date(req.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-2" style={{ marginBottom: '1rem' }}>
              Sign in with your email and any reference number to view all your requests.
            </p>
            <form onSubmit={handleResidentSignIn} className="form-stack">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={myEmail} onChange={e => setMyEmail(e.target.value)} placeholder="Your email address" required />
              </div>
              <div className="form-group">
                <label className="form-label">Reference Number</label>
                <div className="row">
                  <input className="form-input" value={myRef} onChange={e => setMyRef(e.target.value)} placeholder="e.g. POT-20260423-AB1C2D" required />
                  <button type="submit" className="btn btn-primary flex-none" disabled={signingIn}>
                    {signingIn ? '…' : 'Sign in'}
                  </button>
                </div>
              </div>
              {myError && <div className="alert alert-error">{myError}</div>}
            </form>
          </>
        )}
      </div>

    </div>
  )
}
