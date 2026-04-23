import { useState, useEffect } from 'react'
import { serviceRequests } from '../services/api'
import { RequestStatus, RequestType } from '../types'
import type { ServiceRequest, UpdateStatusDto } from '../types'

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

export default function AdminPage() {
  const [all, setAll] = useState<ServiceRequest[]>([])
  const [filter, setFilter] = useState<RequestStatus | null>(null)
  const [selected, setSelected] = useState<ServiceRequest | null>(null)
  const [modalStatus, setModalStatus] = useState<RequestStatus>(RequestStatus.Submitted)
  const [modalNotes, setModalNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const data = await serviceRequests.getAll()
      setAll(data)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (req: ServiceRequest) => {
    setSelected(req)
    setModalStatus(req.status)
    setModalNotes(req.adminNotes ?? '')
  }

  const closeModal = () => {
    setSelected(null)
    setModalNotes('')
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const dto: UpdateStatusDto = { status: modalStatus, adminNotes: modalNotes }
      await serviceRequests.updateStatus(selected.id, dto)
      await fetchAll()
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const countByStatus = (status: RequestStatus) =>
    all.filter(r => r.status === status).length

  const filtered = filter !== null ? all.filter(r => r.status === filter) : all

  const statuses = [
    RequestStatus.Submitted,
    RequestStatus.InReview,
    RequestStatus.InProgress,
    RequestStatus.Resolved,
    RequestStatus.Closed
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ marginTop: 0 }}>Admin Dashboard</h2>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <div key={s} onClick={() => setFilter(filter === s ? null : s)}
            style={{
              flex: '1 1 140px', background: filter === s ? statusColour[s] : '#f9fafb',
              border: `1px solid ${statusColour[s]}`,
              borderRadius: 8, padding: '1rem', cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.15s'
            }}>
            <div style={{
              fontSize: 28, fontWeight: 700,
              color: filter === s ? '#fff' : statusColour[s]
            }}>
              {countByStatus(s)}
            </div>
            <div style={{
              fontSize: 13,
              color: filter === s ? '#fff' : '#374151'
            }}>
              {statusLabel[s]}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter(null)} style={{
          padding: '0.4rem 1rem', borderRadius: 999, cursor: 'pointer',
          border: '1px solid #d1d5db', fontSize: 13,
          background: filter === null ? '#1d4ed8' : '#fff',
          color: filter === null ? '#fff' : '#374151'
        }}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(filter === s ? null : s)} style={{
            padding: '0.4rem 1rem', borderRadius: 999, cursor: 'pointer',
            border: `1px solid ${statusColour[s]}`, fontSize: 13,
            background: filter === s ? statusColour[s] : '#fff',
            color: filter === s ? '#fff' : '#374151'
          }}>
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No requests found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                {['Reference', 'Type', 'Name', 'Location', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: 13 }}>
                    {req.referenceNumber}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{typeLabel[req.type]}</td>
                  <td style={{ padding: '0.75rem' }}>{req.fullName}</td>
                  <td style={{ padding: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.addressOrLocation}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      background: statusColour[req.status], color: '#fff',
                      borderRadius: 999, padding: '0.2rem 0.6rem', fontSize: 12
                    }}>
                      {statusLabel[req.status]}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {new Date(req.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => openModal(req)} style={{
                      background: '#1d4ed8', color: '#fff', border: 'none',
                      borderRadius: 6, padding: '0.35rem 0.75rem',
                      fontSize: 13, cursor: 'pointer'
                    }}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: '1.5rem',
            width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>{selected.referenceNumber}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: 14 }}>
              <div><strong>Type:</strong> {typeLabel[selected.type]}</div>
              <div><strong>Name:</strong> {selected.fullName}</div>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>Location:</strong> {selected.addressOrLocation}</div>
              <div><strong>Description:</strong> {selected.description}</div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1rem' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Status</span>
              <select value={modalStatus} onChange={e => setModalStatus(Number(e.target.value))}
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                {statuses.map(s => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.5rem' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Admin Notes</span>
              <textarea value={modalNotes} onChange={e => setModalNotes(e.target.value)}
                rows={3} placeholder="Internal notes visible to resident..."
                style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db', resize: 'vertical' }} />
            </label>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{
                padding: '0.6rem 1.25rem', borderRadius: 6,
                border: '1px solid #d1d5db', background: '#fff',
                cursor: 'pointer', fontSize: 14
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '0.6rem 1.25rem', borderRadius: 6,
                background: '#1d4ed8', color: '#fff', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 14, opacity: saving ? 0.7 : 1
              }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}