import { useState, useEffect } from 'react'
import { serviceRequests } from '../services/api'
import { RequestStatus, RequestType } from '../types'
import type { ServiceRequest, UpdateStatusDto } from '../types'

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

const statuses = [
  RequestStatus.Submitted,
  RequestStatus.InReview,
  RequestStatus.InProgress,
  RequestStatus.Resolved,
  RequestStatus.Closed,
]

export default function AdminPage() {
  const [all, setAll]               = useState<ServiceRequest[]>([])
  const [filter, setFilter]         = useState<RequestStatus | null>(null)
  const [selected, setSelected]     = useState<ServiceRequest | null>(null)
  const [modalStatus, setModalStatus] = useState<RequestStatus>(RequestStatus.Submitted)
  const [modalNotes, setModalNotes] = useState('')
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try { setAll(await serviceRequests.getAll()) }
    finally { setLoading(false) }
  }

  const openModal = (req: ServiceRequest) => {
    setSelected(req)
    setModalStatus(req.status)
    setModalNotes(req.adminNotes ?? '')
  }

  const closeModal = () => { setSelected(null); setModalNotes('') }

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

  const count = (s: RequestStatus) => all.filter(r => r.status === s).length
  const filtered = filter !== null ? all.filter(r => r.status === filter) : all

  return (
    <div className="page">
      <div className="container">
        <h2 className="page-heading">Admin Dashboard</h2>

        {/* Stat cards */}
        <div className="stat-grid">
          {statuses.map(s => {
            const active = filter === s
            return (
              <div
                key={s}
                className="stat-card"
                onClick={() => setFilter(filter === s ? null : s)}
                style={active
                  ? { background: statusColour[s], border: `1.5px solid ${statusColour[s]}` }
                  : { border: `1.5px solid ${statusColour[s]}` }
                }
              >
                <div className="stat-num" style={{ color: active ? '#fff' : statusColour[s] }}>
                  {count(s)}
                </div>
                <div className="stat-label" style={{ color: active ? '#fff' : 'var(--text-2)' }}>
                  {statusLabel[s]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Filter pills */}
        <div className="filter-bar">
          <button
            className="filter-pill"
            onClick={() => setFilter(null)}
            style={filter === null
              ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
              : {}}
          >
            All ({all.length})
          </button>
          {statuses.map(s => (
            <button
              key={s}
              className="filter-pill"
              onClick={() => setFilter(filter === s ? null : s)}
              style={filter === s
                ? { background: statusColour[s], color: '#fff', borderColor: statusColour[s] }
                : { borderColor: statusColour[s], color: statusColour[s] }}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">No requests found.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="req-list">
              {filtered.map(req => (
                <div key={req.id} className="req-card">
                  <div className="req-card-top">
                    <span className="req-card-ref monospace">{req.referenceNumber}</span>
                    <span className="badge" style={{ background: statusColour[req.status] }}>
                      {statusLabel[req.status]}
                    </span>
                  </div>
                  <p className="req-card-meta">{typeLabel[req.type]} · {req.fullName}</p>
                  <p className="req-card-loc">{req.addressOrLocation}</p>
                  <div className="req-card-footer">
                    <span className="req-card-date">{new Date(req.createdAt).toLocaleDateString('en-GB')}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal(req)}>
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['Reference', 'Type', 'Name', 'Location', 'Status', 'Date', ''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => (
                    <tr key={req.id}>
                      <td className="monospace text-xs">{req.referenceNumber}</td>
                      <td>{typeLabel[req.type]}</td>
                      <td>{req.fullName}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.addressOrLocation}
                      </td>
                      <td>
                        <span className="badge" style={{ background: statusColour[req.status] }}>
                          {statusLabel[req.status]}
                        </span>
                      </td>
                      <td className="text-3 text-xs" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(req.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal(req)}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h3 className="modal-title">{selected.referenceNumber}</h3>

            <div style={{ marginBottom: '1rem' }}>
              <p className="modal-row"><strong>Type:</strong> {typeLabel[selected.type]}</p>
              <p className="modal-row"><strong>Name:</strong> {selected.fullName}</p>
              <p className="modal-row"><strong>Email:</strong> {selected.email}</p>
              <p className="modal-row"><strong>Location:</strong> {selected.addressOrLocation}</p>
              <p className="modal-row"><strong>Description:</strong> {selected.description}</p>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={modalStatus}
                onChange={e => setModalStatus(Number(e.target.value))}
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea
                className="form-textarea"
                value={modalNotes}
                onChange={e => setModalNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes visible to resident…"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
