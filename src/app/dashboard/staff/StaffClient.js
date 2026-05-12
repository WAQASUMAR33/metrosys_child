'use client'

import { useState } from 'react'
import { Search, Plus, User, ChevronRight, Clock, Lock, Home as HomeIcon, HelpCircle, Eye, EyeOff } from 'lucide-react'

const STAFF_ROLES = [
  'Support Worker', 'Senior Support Worker', 'Team Leader',
  'Deputy Manager', 'Registered Manager', 'IRO', 'Other',
]

/* ── small helpers ── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? '#16a34a' : '#d1d5db' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function Help() {
  return <HelpCircle size={14} className="text-gray-400 flex-shrink-0" />
}

/* ── PIN modal ── */
function PinModal({ value, onChange, onClose }) {
  const [show, setShow] = useState(false)
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Lock size={15} className="text-green-600" /> Set Signing PIN</h3>
        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Enter PIN"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-green-500"
          />
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm text-white font-medium" style={{ background: '#16a34a' }}>Save PIN</button>
        </div>
      </div>
    </div>
  )
}

/* ── Add Staff full-screen form ── */
function AddStaffModal({ onClose, onSaved, homes, staffList }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', signingPin: '',
    lineManager: '', primaryHomeId: '', username: '', role: '',
    hrAccessOnly: true, webAccess: true, active: true,
  })
  const [showPinModal, setShowPinModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNameChange(field, value) {
    const next = { ...form, [field]: value }
    const u = next.firstName && next.lastName
      ? `${next.firstName.toLowerCase().trim()}.${next.lastName.toLowerCase().trim()}`.replace(/\s+/g, '')
      : form.username
    setForm({ ...next, username: u })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.primaryHomeId) { setError('Please select a primary home.'); return }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add staff'); setSaving(false); return }
      onSaved()
    } catch {
      setError('An unexpected error occurred.')
      setSaving(false)
    }
  }

  const primaryHome = homes.find(h => h.id === parseInt(form.primaryHomeId))

  const fieldClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500'
  const labelClass = 'text-sm text-gray-700 w-36 flex-shrink-0'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-end px-6 py-2.5 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e0a3c, #6b21a8)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold text-white"
          style={{ background: '#f59e0b' }}
        >
          Cancel ✕
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto bg-white">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mx-8 mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}

          <div className="grid grid-cols-2 divide-x divide-gray-200">

            {/* ════ LEFT COLUMN ════ */}
            <div className="p-8 space-y-5">

              {/* Name */}
              <div className="flex items-start gap-4">
                <label className={labelClass + ' pt-2'}>Name *</label>
                <div className="flex gap-2 flex-1">
                  <input
                    type="text" placeholder="First Name" value={form.firstName}
                    onChange={e => handleNameChange('firstName', e.target.value)}
                    className={fieldClass} required
                  />
                  <input
                    type="text" placeholder="Last Name" value={form.lastName}
                    onChange={e => handleNameChange('lastName', e.target.value)}
                    className={fieldClass} required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={fieldClass} />
              </div>

              {/* PIN */}
              <div className="flex items-center gap-4">
                <label className={labelClass}>Pin</label>
                <button
                  type="button"
                  onClick={() => setShowPinModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">
                    {form.signingPin ? `PIN set (${form.signingPin.length} chars)` : 'Set Signing PIN'}
                  </span>
                  <Lock size={13} className="text-gray-500" />
                </button>
              </div>

              {/* Line Manager */}
              <div className="flex items-center gap-4">
                <label className={labelClass}>Line Manager</label>
                <select value={form.lineManager} onChange={e => set('lineManager', e.target.value)} className={fieldClass}>
                  <option value=""></option>
                  {staffList.map(s => (
                    <option key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Primary Home display */}
              <div className="flex items-start gap-4">
                <label className={labelClass + ' pt-2'}>Primary Home *</label>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 min-h-[36px] text-gray-500">
                    {primaryHome?.name || ''}
                  </div>
                  <Help />
                </div>
              </div>

              {/* Accessible Homes */}
              <div className="flex items-start gap-4">
                <label className={labelClass + ' pt-1'}>Accessible Homes *</label>
                <div className="flex-1">
                  <div
                    className="border border-gray-300 rounded bg-white overflow-y-auto"
                    style={{ height: '160px' }}
                  >
                    {homes.map(home => {
                      const isPrimary = parseInt(form.primaryHomeId) === home.id
                      return (
                        <div
                          key={home.id}
                          className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={isPrimary}
                            onChange={() => set('primaryHomeId', isPrimary ? '' : home.id)}
                            className="w-4 h-4 rounded border-gray-300 text-green-600"
                          />
                          <span className="text-sm text-gray-700 flex-1">{home.name}</span>
                          <button
                            type="button"
                            onClick={() => set('primaryHomeId', isPrimary ? '' : home.id)}
                            title="Set as primary home"
                          >
                            <HomeIcon
                              size={14}
                              style={{ color: isPrimary ? '#16a34a' : '#d1d5db' }}
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#ec4899' }}>
                    <HomeIcon size={10} style={{ color: '#ec4899' }} /> Indicates primary home
                  </p>
                </div>
              </div>

              {/* Create account */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded text-white font-bold text-sm disabled:opacity-50 transition-all"
                  style={{ background: '#db2777' }}
                >
                  {saving ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </div>

            {/* ════ RIGHT COLUMN ════ */}
            <div className="p-8 space-y-5">

              {/* User Name */}
              <div className="flex items-center gap-4">
                <label className={labelClass}>User Name</label>
                <input
                  type="text" value={form.username} onChange={e => set('username', e.target.value)}
                  className={fieldClass + ' bg-gray-50'} placeholder=""
                />
              </div>

              {/* Position */}
              <div className="flex items-start gap-4">
                <label className={labelClass + ' pt-2'}>Position *</label>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={form.role} onChange={e => set('role', e.target.value)}
                      className={fieldClass}
                      disabled={!form.primaryHomeId}
                    >
                      <option value=""></option>
                      {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                      <span className="text-xs text-gray-400">▼</span>
                    </div>
                    <Help />
                  </div>
                  {!form.primaryHomeId && (
                    <p className="text-xs text-gray-400">A primary home must be selected before you can select a position.</p>
                  )}
                </div>
              </div>

              {/* HR Access Only */}
              <div className="flex items-center gap-4 py-3 bg-gray-50 px-4 rounded">
                <span className="flex-1 text-sm text-gray-700 font-medium">HR Access Only</span>
                <Toggle checked={form.hrAccessOnly} onChange={v => set('hrAccessOnly', v)} />
                <Help />
              </div>

              {/* Web Access */}
              <div className="flex items-center gap-4 py-3 bg-gray-50 px-4 rounded">
                <span className="flex-1 text-sm text-gray-700 font-medium">Web Access</span>
                {!form.webAccess && (
                  <span className="px-3 py-1 rounded text-xs font-semibold text-white" style={{ background: '#f87171' }}>Disabled</span>
                )}
                <Toggle checked={form.webAccess} onChange={v => set('webAccess', v)} />
                <Help />
              </div>

              {/* Photo box */}
              <div
                className="border border-gray-200 rounded bg-white flex items-center justify-center"
                style={{ height: '180px' }}
              >
                <div className="text-center text-gray-300">
                  <User size={40} className="mx-auto mb-1" />
                  <p className="text-xs">No photo</p>
                </div>
              </div>

              {/* Add to HR */}
              <button
                type="button"
                className="w-full py-3 rounded text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: '#06b6d4' }}
              >
                <span>👥</span> Add to HR
              </button>
            </div>
          </div>
        </form>
      </div>

      {showPinModal && (
        <PinModal
          value={form.signingPin}
          onChange={v => set('signingPin', v)}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  )
}

/* ── utility formatters ── */
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function dbsBadge(expiry) {
  if (!expiry) return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-400">No DBS</span>
  const daysLeft = Math.floor((new Date(expiry) - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Expired</span>
  if (daysLeft < 30) return <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">Expiring Soon</span>
  return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Valid</span>
}

/* ── Detail view modal ── */
function DetailModal({ staff, onClose }) {
  if (!staff) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-3 flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
          <div>
            <h2 className="font-semibold text-[#166534]">{staff.firstName} {staff.lastName}</h2>
            <p className="text-xs text-[#16A34A]">{staff.role || 'Staff'} — {staff.homeName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['Status', staff.active ? <span className="text-green-600 font-medium">Active</span> : <span className="text-gray-400">Inactive</span>],
            ['Contract', staff.contractType],
            ['Hours/Week', staff.hoursPerWeek ? `${staff.hoursPerWeek}h` : null],
            ['Start Date', fmtDate(staff.startDate)],
            ['End Date', fmtDate(staff.endDate)],
            ['Email', staff.email],
            ['Phone', staff.phone],
            ['DBS Number', staff.dbsNumber],
            ['DBS Expiry', fmtDate(staff.dbsExpiry)],
            ['DBS Status', dbsBadge(staff.dbsExpiry)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-gray-800 font-medium">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main page component ── */
export default function StaffClient({ data }) {
  const [tab, setTab] = useState('roster')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [filterActive, setFilterActive] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)

  const staffList = (data?.staff || []).filter((s) => {
    const match = `${s.firstName} ${s.lastName} ${s.role || ''}`.toLowerCase().includes(search.toLowerCase())
    const activeMatch = filterActive === 'All' || (filterActive === 'Active' ? s.active : !s.active)
    return match && activeMatch
  })

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {[['roster', 'Staff Roster'], ['shifts', 'Shift Records']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'text-[#166534] border-[#166534]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'roster' && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#16A34A] w-52" />
              </div>
              <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
                className="border border-gray-200 rounded text-sm py-1.5 px-2 focus:outline-none">
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #166534, #16a34a)', boxShadow: '0 2px 8px rgba(22,101,52,0.3)' }}
            >
              <Plus size={13} /> Add Staff
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-3">
            {[
              { label: 'Total Staff', value: data?.staff?.length || 0 },
              { label: 'Active', value: data?.staff?.filter(s => s.active).length || 0 },
              { label: 'DBS Expiring', value: data?.staff?.filter(s => {
                if (!s.dbsExpiry) return false
                const d = Math.floor((new Date(s.dbsExpiry) - Date.now()) / 86400000)
                return d >= 0 && d < 30
              }).length || 0 },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center min-w-[90px]">
                <p className="text-lg font-bold text-[#166534]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-3 py-2 font-semibold">Name</th>
                  <th className="text-left px-3 py-2 font-semibold">Role</th>
                  <th className="text-left px-3 py-2 font-semibold">Contract</th>
                  <th className="text-left px-3 py-2 font-semibold">Hrs/Wk</th>
                  <th className="text-left px-3 py-2 font-semibold">Start Date</th>
                  <th className="text-left px-3 py-2 font-semibold">DBS</th>
                  <th className="text-left px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-sm">No staff found.</td></tr>
                ) : staffList.map((s, i) => (
                  <tr key={s.id} onClick={() => setSelected(s)}
                    className={`border-t border-gray-100 hover:bg-green-50/60 cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 flex-shrink-0">
                          <User size={13} className="text-[#16A34A]" />
                        </div>
                        <span className="font-medium text-gray-800">{s.firstName} {s.lastName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{s.role || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{s.contractType || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{s.hoursPerWeek || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{fmtDate(s.startDate)}</td>
                    <td className="px-3 py-2">{dbsBadge(s.dbsExpiry)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-300"><ChevronRight size={14} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'shifts' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2 font-semibold">Staff Member</th>
                <th className="text-left px-3 py-2 font-semibold">Shift Type</th>
                <th className="text-left px-3 py-2 font-semibold">Clock In</th>
                <th className="text-left px-3 py-2 font-semibold">Clock Out</th>
                <th className="text-left px-3 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {(data?.shiftRecords || []).length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-sm">No shift records.</td></tr>
              ) : (data?.shiftRecords || []).map((r, i) => {
                const duration = r.clockOut
                  ? Math.round((new Date(r.clockOut) - new Date(r.clockIn)) / (1000 * 60 * 60) * 10) / 10
                  : null
                return (
                  <tr key={r.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#16A34A]" />
                        <span className="font-medium text-gray-800">{r.staffName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{r.shiftType || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{fmtDateTime(r.clockIn)}</td>
                    <td className="px-3 py-2 text-gray-600">{r.clockOut ? fmtDateTime(r.clockOut) : <span className="text-orange-500 text-xs">Still on shift</span>}</td>
                    <td className="px-3 py-2 text-gray-500">{duration ? `${duration}h` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <DetailModal staff={selected} onClose={() => setSelected(null)} />

      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); window.location.reload() }}
          homes={data?.homes || []}
          staffList={data?.staff || []}
        />
      )}
    </div>
  )
}
