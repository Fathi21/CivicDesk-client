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
  [RequestStatus.InReview]: 'In Review',
  [RequestStatus.InProgress]: 'In Progress',
  [RequestStatus.Resolved]: 'Resolved',
  [RequestStatus.Closed]: 'Closed'
}

const statusColour: Record<RequestStatus, string> = {
  [RequestStatus.Submitted]: '#3b82f6',
  [RequestStatus.InReview]: '#f59e0b',
  [RequestStatus.InProgress]: '#8b5cf6',
  [RequestStatus.Resolved]: '#22c55e',
  [RequestStatus.Closed]: '#6b7280'
}

const typeLabel: Record<RequestType, string> = {
  [RequestType.Pothole]: 'Pothole',
  [RequestType.MissedBin]: 'Missed Bin',
  [RequestType.NoiseComplaint]: 'Noise Complaint',
  [RequestType.PlanningQuery]: 'Planning Query',
  [RequestType.StreetLighting]: 'Street Lighting',
  [RequestType.Other]: 'Other'
}

export default function ReportPage({ preFill, onClearPreFill }: Props) {
  const [type, setType] = useState<RequestType>(RequestType.Pothole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [addressOrLocation, setAddressOrLocation] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState('')

  const [trackRef, setTrackRef] = useState('')
  const [tracked, setTracked] = useState<ServiceRequest | null>(null)
  const [trackError, setTrackError] = useState('')
  const [tracking, setTracking] = useState(false)

  const [residentAuthed, setResidentAuthed] = useState(() => tokenStore.isResident())
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [loadingMy, setLoadingMy] = useState(false)
  const [myEmail, setMyEmail] = useState('')
  const [myRef, setMyRef] = useState('')
  const [myError, setMyError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

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
      setFullName('')
      setEmail('')
      setAddressOrLocation('')
      setDescription('')
      setType(RequestType.Pothole)
      onClearPreFill()
    } catch {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTrack = async () => {
    setTrackError('')
    setTracked(null)
    if (!trackRef.trim()) return
    setTracking(true)
    try {
      const result = await serviceRequests.getByReference(trackRef.trim())
      setTracked(result)
    } catch {
      setTrackError('No request found with that reference number.')
    } finally {
      setTracking(false)
    }
  }

  const handleResidentSignIn = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setMyError('')
    setSigningIn(true)
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
    setMyEmail('')
    setMyRef('')
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Pre-fill banner */}
      {preFill && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 8, padding: '0.75rem 1rem',
          marginBottom: '1.5rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ color: '#1d4ed8', fontSize: 14 }}>
            ✦ Form pre-filled by CivicAssist
          </span>
          <button onClick={onClearPreFill} style={{
            background: 'none', border: 'none',
            color: '#1d4ed8', cursor: 'pointer', fontSize: 14
          }}>Clear</button>
        </div>
      )}

      {/* Submission success */}
      {submitted ? (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '1.5rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <h2 style={{ margin: '0 0 0.5rem' }}>Request Submitted</h2>
          <p style={{ margin: '0 0 0.25rem', color: '#374151' }}>
            Reference: <strong>{submitted.referenceNumber}</strong>
          </p>
          <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: 14 }}>
            Confirmation sent to {submitted.email}
          </p>
          <button onClick={() => setSubmitted(null)} style={{
            background: '#22c55e', color: '#fff', border: 'none',
            borderRadius: 6, padding: '0.6rem 1.5rem', cursor: 'pointer'
          }}>
            Submit Another
          </button>
        </div>
      ) : (
        <>
          <h2 style={{ marginTop: 0 }}>Report an Issue</h2>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 6, padding: '0.75rem', marginBottom: '1rem',
              color: '#dc2626', fontSize: 14
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Request Type</span>
              <select value={type} onChange={e => setType(Number(e.target.value))}
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option value={RequestType.Pothole}>Pothole</option>
                <option value={RequestType.MissedBin}>Missed Bin Collection</option>
                <option value={RequestType.NoiseComplaint}>Noise Complaint</option>
                <option value={RequestType.PlanningQuery}>Planning Query</option>
                <option value={RequestType.StreetLighting}>Street Lighting Fault</option>
                <option value={RequestType.Other}>Other</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Full Name</span>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Email Address</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Address or Location of Issue</span>
              <input value={addressOrLocation} onChange={e => setAddressOrLocation(e.target.value)}
                placeholder="e.g. Junction of High Street and Park Road, Cardiff"
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Description</span>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={4} placeholder="Describe the issue in as much detail as possible..."
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db', resize: 'vertical' }} />
            </label>

            <button onClick={handleSubmit} disabled={submitting} style={{
              background: '#1d4ed8', color: '#fff', border: 'none',
              borderRadius: 6, padding: '0.75rem', fontSize: 16,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </>
      )}

      {/* Track a Request */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <h2 style={{ marginTop: 0 }}>Track a Request</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={trackRef} onChange={e => setTrackRef(e.target.value)}
            placeholder="e.g. POT-20260417-AB1C2D"
            style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }} />
          <button onClick={handleTrack} disabled={tracking} style={{
            background: '#1d4ed8', color: '#fff', border: 'none',
            borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer'
          }}>
            {tracking ? '...' : 'Track'}
          </button>
        </div>

        {trackError && (
          <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{trackError}</p>
        )}

        {tracked && (
          <div style={{
            marginTop: '1rem', background: '#f9fafb',
            border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{tracked.referenceNumber}</strong>
              <span style={{
                background: statusColour[tracked.status],
                color: '#fff', borderRadius: 999,
                padding: '0.2rem 0.75rem', fontSize: 13
              }}>
                {statusLabel[tracked.status]}
              </span>
            </div>
            <p style={{ margin: '0 0 0.25rem', fontSize: 14, color: '#374151' }}>
              {tracked.addressOrLocation}
            </p>
            <p style={{ margin: '0 0 0.25rem', fontSize: 14, color: '#6b7280' }}>
              {tracked.description}
            </p>
            {tracked.adminNotes && (
              <p style={{ margin: '0.5rem 0 0', fontSize: 14, color: '#1d4ed8' }}>
                Note: {tracked.adminNotes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* My Requests */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <h2 style={{ marginTop: 0 }}>My Requests</h2>

        {residentAuthed ? (
          <>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1rem'
            }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                All requests linked to your account
              </span>
              <button onClick={handleResidentSignOut} style={{
                background: 'none', border: '1px solid #d1d5db',
                borderRadius: 6, padding: '0.35rem 0.75rem',
                fontSize: 13, cursor: 'pointer', color: '#374151'
              }}>
                Sign out
              </button>
            </div>

            {loadingMy ? (
              <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
            ) : myRequests.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: 14 }}>No requests found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myRequests.map(req => (
                  <div key={req.id} style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: 8, padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
                        {req.referenceNumber}
                      </span>
                      <span style={{
                        background: statusColour[req.status], color: '#fff',
                        borderRadius: 999, padding: '0.2rem 0.6rem', fontSize: 12
                      }}>
                        {statusLabel[req.status]}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.2rem', fontSize: 14, color: '#374151' }}>
                      <strong>{typeLabel[req.type]}</strong> — {req.addressOrLocation}
                    </p>
                    <p style={{ margin: '0 0 0.2rem', fontSize: 13, color: '#6b7280' }}>
                      {req.description}
                    </p>
                    {req.adminNotes && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: 13, color: '#1d4ed8' }}>
                        Note: {req.adminNotes}
                      </p>
                    )}
                    <p style={{ margin: '0.4rem 0 0', fontSize: 12, color: '#9ca3af' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 1rem', fontSize: 14, color: '#6b7280' }}>
              Sign in with your email and any reference number to view all your requests.
            </p>
            <form onSubmit={handleResidentSignIn}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email"
                value={myEmail}
                onChange={e => setMyEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={myRef}
                  onChange={e => setMyRef(e.target.value)}
                  placeholder="Reference number (e.g. POT-20260423-AB1C2D)"
                  required
                  style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                />
                <button type="submit" disabled={signingIn} style={{
                  background: '#1d4ed8', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '0.5rem 1rem',
                  cursor: signingIn ? 'not-allowed' : 'pointer',
                  fontSize: 14, opacity: signingIn ? 0.7 : 1, whiteSpace: 'nowrap'
                }}>
                  {signingIn ? '...' : 'Sign in'}
                </button>
              </div>
              {myError && (
                <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>{myError}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
