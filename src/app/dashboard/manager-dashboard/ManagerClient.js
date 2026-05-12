'use client'

import { AlertTriangle, CheckCircle, Users, Shield, Clock, FileText } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function SeverityBadge({ severity }) {
  const map = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-yellow-100 text-yellow-700', Low: 'bg-blue-100 text-blue-700' }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[severity] || 'bg-gray-100 text-gray-500'}`}>{severity || '—'}</span>
}

function Panel({ title, icon, children, count, countColor }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-[#166534] text-sm">{title}</span>
        </div>
        {count !== undefined && (
          <span className={`text-sm font-bold ${countColor || 'text-gray-700'}`}>{count}</span>
        )}
      </div>
      <div className="bg-white max-h-56 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function Row({ children }) {
  return <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-700 last:border-0">{children}</div>
}

async function signOff(id) {
  await fetch(`/api/incidents/${id}/signoff`, { method: 'POST' })
  window.location.reload()
}

export default function ManagerClient({ data, userRole }) {
  const canSignOff = ['MANAGER', 'DIRECTOR', 'OPERATIONS', 'ADMIN'].includes(userRole)

  const openIncidents = data?.incidents || []
  const criticalCount = openIncidents.filter(i => i.severity === 'Critical').length
  const staffAlerts = (data?.staff || []).filter(s => {
    const days = s.dbsExpiry ? Math.floor((new Date(s.dbsExpiry) - Date.now()) / (1000 * 60 * 60 * 24)) : null
    return (days !== null && days < 30) || s.trainingAlerts > 0
  })
  const overdueTasks = (data?.tasks || []).filter(t => t.dueDate && new Date(t.dueDate) < new Date())

  return (
    <div className="p-4 space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Open Incidents', value: openIncidents.length, color: openIncidents.length > 0 ? 'text-red-600' : 'text-green-600', bg: openIncidents.length > 0 ? 'border-red-200' : 'border-[#BBF7D0]' },
          { label: 'Critical Incidents', value: criticalCount, color: criticalCount > 0 ? 'text-red-700 font-extrabold' : 'text-gray-400', bg: 'border-[#BBF7D0]' },
          { label: 'Compliance Alerts', value: staffAlerts.length, color: staffAlerts.length > 0 ? 'text-orange-600' : 'text-green-600', bg: 'border-[#BBF7D0]' },
          { label: 'Overdue Tasks', value: overdueTasks.length, color: overdueTasks.length > 0 ? 'text-orange-600' : 'text-gray-400', bg: 'border-[#BBF7D0]' },
        ].map((c) => (
          <div key={c.label} className={`border ${c.bg} rounded p-3 bg-white text-center`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Two-col grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Open incidents requiring sign-off */}
        <Panel title="Open Incidents (Require Sign-Off)" icon={<Shield size={14} className="text-[#16A34A]" />} count={openIncidents.length} countColor={openIncidents.length > 0 ? 'text-red-600' : 'text-green-600'}>
          {openIncidents.length === 0
            ? <p className="text-gray-400 text-xs text-center py-6">No open incidents.</p>
            : openIncidents.map((inc) => (
              <Row key={inc.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SeverityBadge severity={inc.severity} />
                      <span className="text-gray-400">{inc.type}</span>
                      <span className="text-gray-400">{fmtDateTime(inc.occurredAt)}</span>
                    </div>
                  </div>
                  {canSignOff && (
                    <button onClick={() => signOff(inc.id)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs bg-[#166534] text-white px-2 py-1 rounded hover:bg-[#14532D]">
                      <CheckCircle size={10} /> Sign Off
                    </button>
                  )}
                </div>
              </Row>
            ))}
        </Panel>

        {/* Staff compliance alerts */}
        <Panel title="Staff Compliance Alerts" icon={<AlertTriangle size={14} className="text-orange-500" />} count={staffAlerts.length} countColor={staffAlerts.length > 0 ? 'text-orange-600' : 'text-green-600'}>
          {staffAlerts.length === 0
            ? <p className="text-gray-400 text-xs text-center py-6">All staff compliance up to date.</p>
            : staffAlerts.map((s) => {
              const dbsDays = s.dbsExpiry ? Math.floor((new Date(s.dbsExpiry) - Date.now()) / (1000 * 60 * 60 * 24)) : null
              return (
                <Row key={s.id}>
                  <p className="font-medium text-gray-800">{s.name} <span className="text-gray-400 font-normal">— {s.role}</span></p>
                  <div className="flex gap-3 mt-0.5">
                    {dbsDays !== null && dbsDays < 30 && (
                      <span className={`${dbsDays < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        DBS: {dbsDays < 0 ? `expired ${Math.abs(dbsDays)}d ago` : `expires in ${dbsDays}d`}
                      </span>
                    )}
                    {s.trainingAlerts > 0 && (
                      <span className="text-orange-600">{s.trainingAlerts} training expiring</span>
                    )}
                  </div>
                </Row>
              )
            })}
        </Panel>

        {/* Young people overview */}
        <Panel title="Young People" icon={<Users size={14} className="text-[#16A34A]" />} count={data?.youngPeople?.length || 0}>
          {(data?.youngPeople || []).length === 0
            ? <p className="text-gray-400 text-xs text-center py-6">No active young people.</p>
            : (data?.youngPeople || []).map((y) => (
              <Row key={y.id}>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{y.name}</span>
                  <span className="text-gray-400">Key Worker: {y.keyWorker || '—'}</span>
                </div>
              </Row>
            ))}
        </Panel>

        {/* Tasks */}
        <Panel title="Outstanding Tasks" icon={<FileText size={14} className="text-[#16A34A]" />} count={data?.tasks?.length || 0} countColor={(data?.tasks?.length || 0) > 0 ? 'text-orange-600' : 'text-gray-400'}>
          {(data?.tasks || []).length === 0
            ? <p className="text-gray-400 text-xs text-center py-6">No outstanding tasks.</p>
            : (data?.tasks || []).map((t) => {
              const overdue = t.dueDate && new Date(t.dueDate) < new Date()
              return (
                <Row key={t.id}>
                  <div className="flex justify-between">
                    <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-800'}`}>{t.title}</span>
                    {t.dueDate && <span className={`${overdue ? 'text-red-500' : 'text-gray-400'}`}>Due: {fmtDate(t.dueDate)}</span>}
                  </div>
                </Row>
              )
            })}
        </Panel>
      </div>

      {/* Recent shift records */}
      <Panel title="Recent Shift Records (Last 7 Days)" icon={<Clock size={14} className="text-[#16A34A]" />}>
        {(data?.shiftRecords || []).length === 0
          ? <p className="text-gray-400 text-xs text-center py-4">No recent shifts.</p>
          : (data?.shiftRecords || []).map((r) => (
            <Row key={r.id}>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-800 w-40 truncate">{r.staffName}</span>
                <span className="text-gray-400">{r.shiftType || 'Shift'}</span>
                <span className="text-gray-500">{fmtDateTime(r.clockIn)}</span>
                <span className="text-gray-400">→</span>
                <span className={r.clockOut ? 'text-gray-500' : 'text-orange-500'}>{r.clockOut ? fmtDateTime(r.clockOut) : 'On Shift'}</span>
              </div>
            </Row>
          ))}
      </Panel>
    </div>
  )
}
