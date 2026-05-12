'use client'

import { useState } from 'react'
import { Search, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(iso) {
  if (!iso) return null
  return Math.floor((new Date(iso) - Date.now()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ iso, label }) {
  const days = daysUntil(iso)
  if (days === null) return <span className="text-xs text-gray-400">No date</span>
  if (days < 0) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
      <AlertTriangle size={10} /> Expired {Math.abs(days)}d ago
    </span>
  )
  if (days < 30) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
      <Clock size={10} /> {days}d left
    </span>
  )
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
      <CheckCircle size={10} /> Valid ({days}d)
    </span>
  )
}

function TrainingStatusBadge({ status, expiresAt }) {
  const days = daysUntil(expiresAt)
  if (days !== null && days < 0) return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Expired</span>
  if (days !== null && days < 30) return <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">Expiring</span>
  if (status === 'Completed') return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Completed</span>
  return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">{status}</span>
}

export default function HRClient({ data }) {
  const [tab, setTab] = useState('dbs')
  const [search, setSearch] = useState('')

  const staff = (data?.staff || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const training = (data?.trainingRecords || []).filter((t) =>
    `${t.staffName} ${t.trainingName}`.toLowerCase().includes(search.toLowerCase())
  )

  const dbsAlerts = data?.staff?.filter((s) => {
    const days = daysUntil(s.dbsExpiry)
    return days !== null && days < 30
  }) || []

  const trainingAlerts = data?.trainingRecords?.filter((t) => {
    const days = daysUntil(t.expiresAt)
    return days !== null && days < 30
  }) || []

  return (
    <div className="p-4">
      {/* Alert banners */}
      {(dbsAlerts.length > 0 || trainingAlerts.length > 0) && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-orange-700">Compliance Alerts: </span>
            <span className="text-orange-600">
              {dbsAlerts.length > 0 && `${dbsAlerts.length} DBS check(s) expiring/expired. `}
              {trainingAlerts.length > 0 && `${trainingAlerts.length} training record(s) expiring/expired.`}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'Total Staff', value: data?.staff?.length || 0, color: 'text-[#166534]' },
          { label: 'DBS Alerts', value: dbsAlerts.length, color: dbsAlerts.length > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Training Alerts', value: trainingAlerts.length, color: trainingAlerts.length > 0 ? 'text-orange-600' : 'text-green-600' },
          { label: 'Training Records', value: data?.trainingRecords?.length || 0, color: 'text-gray-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center min-w-[90px]">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {[['dbs', 'DBS Checks'], ['training', 'Training Records']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'text-[#166534] border-[#166534]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={tab === 'dbs' ? 'Search staff...' : 'Search training...'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#16A34A] w-56" />
        </div>
        <button className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
          <Plus size={13} /> {tab === 'dbs' ? 'Log DBS' : 'Add Training'}
        </button>
      </div>

      {/* DBS Table */}
      {tab === 'dbs' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2 font-semibold">Staff Member</th>
                <th className="text-left px-3 py-2 font-semibold">Role</th>
                <th className="text-left px-3 py-2 font-semibold">Home</th>
                <th className="text-left px-3 py-2 font-semibold">DBS Number</th>
                <th className="text-left px-3 py-2 font-semibold">Expiry Date</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-sm">No staff found.</td></tr>
              ) : staff.map((s, i) => (
                <tr key={s.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 py-2 font-medium text-gray-800">{s.name}</td>
                  <td className="px-3 py-2 text-gray-500">{s.role || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{s.homeName}</td>
                  <td className="px-3 py-2 text-gray-600 font-mono text-xs">{s.dbsNumber || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{fmtDate(s.dbsExpiry)}</td>
                  <td className="px-3 py-2"><ExpiryBadge iso={s.dbsExpiry} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Training Table */}
      {tab === 'training' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2 font-semibold">Staff Member</th>
                <th className="text-left px-3 py-2 font-semibold">Training</th>
                <th className="text-left px-3 py-2 font-semibold">Completed</th>
                <th className="text-left px-3 py-2 font-semibold">Expires</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {training.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-sm">No training records found.</td></tr>
              ) : training.map((t, i) => (
                <tr key={t.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 py-2 font-medium text-gray-800">{t.staffName}</td>
                  <td className="px-3 py-2 text-gray-700">{t.trainingName}</td>
                  <td className="px-3 py-2 text-gray-500">{fmtDate(t.completedAt)}</td>
                  <td className="px-3 py-2 text-gray-500">{fmtDate(t.expiresAt)}</td>
                  <td className="px-3 py-2"><TrainingStatusBadge status={t.status} expiresAt={t.expiresAt} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
