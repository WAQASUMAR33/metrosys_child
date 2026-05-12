'use client'

import { useState } from 'react'
import { Plus, Search, AlertTriangle, CheckCircle, Shield } from 'lucide-react'

const INCIDENT_TYPES = ['Behaviour', 'Physical Intervention', 'Missing Episode', 'Accident', 'Medical', 'Property Damage', 'Safeguarding', 'Other']
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function SeverityBadge({ severity }) {
  const map = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
  }
  return <span className={`px-2 py-0.5 rounded text-xs border font-medium ${map[severity] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{severity || '—'}</span>
}

function StatusBadge({ status, signedOffBy }) {
  if (status === 'Signed Off') return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
      <CheckCircle size={10} /> Signed Off{signedOffBy ? ` by ${signedOffBy}` : ''}
    </span>
  )
  if (status === 'Under Review') return <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">Under Review</span>
  return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Open</span>
}

function IncidentModal({ incident, onClose, onSignOff, userRole }) {
  if (!incident) return null
  const canSignOff = ['MANAGER', 'DIRECTOR', 'OPERATIONS', 'ADMIN'].includes(userRole)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-3 flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
          <div>
            <h2 className="font-semibold text-[#166534]">{incident.title}</h2>
            <p className="text-xs text-[#16A34A]">{incident.type} — {incident.homeName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-400 mb-0.5">Severity</p><SeverityBadge severity={incident.severity} /></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Status</p><StatusBadge status={incident.status} signedOffBy={incident.signedOffBy} /></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Occurred At</p><p className="text-gray-800">{fmtDate(incident.occurredAt)}</p></div>
            <div><p className="text-xs text-gray-400 mb-0.5">Reported By</p><p className="text-gray-800">{incident.reportedBy || '—'}</p></div>
            {incident.signedOffAt && <div><p className="text-xs text-gray-400 mb-0.5">Signed Off At</p><p className="text-gray-800">{fmtDate(incident.signedOffAt)}</p></div>}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-gray-700 bg-gray-50 rounded p-3 text-sm leading-relaxed whitespace-pre-wrap">{incident.description}</p>
          </div>
          {canSignOff && incident.status !== 'Signed Off' && (
            <button onClick={() => { onSignOff(incident.id); onClose() }}
              className="w-full text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 flex items-center justify-center gap-2">
              <CheckCircle size={14} /> Sign Off Incident
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HealthSafetyClient({ data, userRole, userId }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Behaviour', description: '', severity: 'Medium', occurredAt: '', reportedBy: '' })
  const [saving, setSaving] = useState(false)

  const incidents = (data?.incidents || []).filter((inc) => {
    const matchSearch = `${inc.title} ${inc.type} ${inc.reportedBy || ''}`.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'All' || inc.type === filterType
    const matchStatus = filterStatus === 'All' || inc.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const open = data?.incidents?.filter(i => i.status === 'Open').length || 0
  const critical = data?.incidents?.filter(i => i.severity === 'Critical').length || 0

  async function handleSignOff(id) {
    await fetch(`/api/incidents/${id}/signoff`, { method: 'POST' })
    window.location.reload()
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.occurredAt) return
    setSaving(true)
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', type: 'Behaviour', description: '', severity: 'Medium', occurredAt: '', reportedBy: '' })
    window.location.reload()
  }

  return (
    <div className="p-4">
      {/* Alert banner */}
      {open > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500" />
          <span className="text-sm text-orange-700">
            <span className="font-medium">{open} open incident{open > 1 ? 's' : ''}</span> requiring review or sign-off.
            {critical > 0 && <span className="text-red-600 font-medium ml-1">{critical} critical.</span>}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'Total Incidents', value: data?.incidents?.length || 0, color: 'text-[#166534]' },
          { label: 'Open', value: open, color: open > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Critical', value: critical, color: critical > 0 ? 'text-red-600' : 'text-gray-400' },
          { label: 'Signed Off', value: data?.incidents?.filter(i => i.status === 'Signed Off').length || 0, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center min-w-[90px]">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#16A34A] w-48" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded text-sm py-1.5 px-2 focus:outline-none">
            <option value="All">All Types</option>
            {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded text-sm py-1.5 px-2 focus:outline-none">
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Signed Off">Signed Off</option>
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
          <Plus size={13} /> Log Incident
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left px-3 py-2 font-semibold">Title</th>
              <th className="text-left px-3 py-2 font-semibold">Type</th>
              <th className="text-left px-3 py-2 font-semibold">Severity</th>
              <th className="text-left px-3 py-2 font-semibold">Occurred</th>
              <th className="text-left px-3 py-2 font-semibold">Reported By</th>
              <th className="text-left px-3 py-2 font-semibold">Home</th>
              <th className="text-left px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">No incidents found.</td></tr>
            ) : incidents.map((inc, i) => (
              <tr key={inc.id} onClick={() => setSelected(inc)}
                className={`border-t border-gray-100 hover:bg-green-50/60 cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Shield size={13} className="text-[#16A34A] flex-shrink-0" />
                    <span className="font-medium text-gray-800">{inc.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-500">{inc.type}</td>
                <td className="px-3 py-2"><SeverityBadge severity={inc.severity} /></td>
                <td className="px-3 py-2 text-gray-500 text-xs">{fmtDate(inc.occurredAt)}</td>
                <td className="px-3 py-2 text-gray-500">{inc.reportedBy || '—'}</td>
                <td className="px-3 py-2 text-gray-500">{inc.homeName}</td>
                <td className="px-3 py-2"><StatusBadge status={inc.status} signedOffBy={inc.signedOffBy} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <IncidentModal incident={selected} onClose={() => setSelected(null)} onSignOff={handleSignOff} userRole={userRole} />

      {/* Log incident modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Log Incident</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="Brief incident title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Severity</label>
                  <select value={form.severity} onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Occurred At</label>
                <input type="datetime-local" value={form.occurredAt} onChange={(e) => setForm(f => ({ ...f, occurredAt: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Reported By</label>
                <input type="text" value={form.reportedBy} onChange={(e) => setForm(f => ({ ...f, reportedBy: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="Name of reporter" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] resize-none" placeholder="Full incident description..." />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSubmit} disabled={saving || !form.title || !form.description || !form.occurredAt}
                  className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Log Incident'}
                </button>
                <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
