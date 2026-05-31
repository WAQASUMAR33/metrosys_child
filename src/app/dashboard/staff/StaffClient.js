'use client'

import { useState } from 'react'
import { Search, Plus, User, Clock, Lock, Home as HomeIcon, HelpCircle, Eye, EyeOff, ChevronLeft } from 'lucide-react'

const STAFF_ROLES = [
  'Director', 'Operations Manager', 'Registered Manager', 'Home Manager',
  'Deputy Manager', 'Senior Support Worker', 'Support Worker',
  'Team Leader', 'Super User', 'IRO', 'Other',
]

const TIER_MAP = {
  'Director': 0, 'Operations Manager': 0, 'Super User': 0,
  'Registered Manager': 2, 'Home Manager': 2, 'Deputy Manager': 2,
  'Senior Support Worker': 5, 'Support Worker': 5,
  'Team Leader': 5, 'IRO': 5, 'Other': 5,
}

function tierFromRole(role) {
  return TIER_MAP[role] ?? 5
}

/* ── Toggle ── */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-60"
      style={{ background: checked ? '#16a34a' : '#ef4444' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

/* ── Toggle (gray when off — for form toggles) ── */
function FormToggle({ checked, onChange }) {
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
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Lock size={15} className="text-green-600" /> Set Signing PIN
        </h3>
        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Enter PIN"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-green-500"
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm text-white font-medium"
            style={{ background: '#16a34a' }}
          >
            Save PIN
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Add Staff full-screen form ── */
function AddStaffModal({ onClose, onSaved, homes, staffList }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    signingPin: '', lineManagerId: '',
    primaryHomeId: '', username: '', role: '',
    hrAccessOnly: false, webAccess: true, active: true,
  })
  const [showPinModal, setShowPinModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNameChange(field, value) {
    const next = { ...form, [field]: value }
    const u =
      next.firstName && next.lastName
        ? `${next.firstName.toLowerCase().trim()}.${next.lastName.toLowerCase().trim()}`.replace(/\s+/g, '')
        : form.username
    setForm({ ...next, username: u })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }
    if (!form.primaryHomeId) {
      setError('Please select a primary home.')
      return
    }
    if (!form.role) {
      setError('Please select a position.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tier: tierFromRole(form.role),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add staff')
        setSaving(false)
        return
      }
      onSaved()
    } catch {
      setError('An unexpected error occurred.')
      setSaving(false)
    }
  }

  const primaryHome = homes.find(h => h.id === parseInt(form.primaryHomeId))
  const fieldClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-purple-500'
  const labelClass = 'text-sm text-gray-700 w-36 flex-shrink-0'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#f3f4f6' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-end gap-3 px-6 py-2.5 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e0a3c, #6b21a8)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-semibold text-white"
          style={{ background: '#f59e0b' }}
        >
          Cancel ✕
        </button>

        <div className="flex items-center gap-2 rounded px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <span className="text-white text-sm font-medium">Active</span>
          <FormToggle checked={form.active} onChange={v => set('active', v)} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-semibold text-white border"
          style={{ borderColor: 'rgba(255,255,255,0.3)' }}
        >
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-white">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mx-8 mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 divide-x divide-gray-200">
            {/* ════ LEFT ════ */}
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
                <input
                  type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={fieldClass}
                />
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
                <select
                  value={form.lineManagerId}
                  onChange={e => set('lineManagerId', e.target.value)}
                  className={fieldClass}
                >
                  <option value=""></option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
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
                            onChange={() => set('primaryHomeId', isPrimary ? '' : String(home.id))}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700 flex-1">{home.name}</span>
                          <button
                            type="button"
                            onClick={() => set('primaryHomeId', isPrimary ? '' : String(home.id))}
                            title="Set as primary home"
                          >
                            <HomeIcon size={14} style={{ color: isPrimary ? '#ec4899' : '#d1d5db' }} />
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

            {/* ════ RIGHT ════ */}
            <div className="p-8 space-y-5">

              {/* User Name */}
              <div className="flex items-center gap-4">
                <label className={labelClass}>User Name</label>
                <input
                  type="text" value={form.username}
                  onChange={e => set('username', e.target.value)}
                  className={fieldClass + ' bg-gray-50'}
                />
              </div>

              {/* Position */}
              <div className="flex items-start gap-4">
                <label className={labelClass + ' pt-2'}>Position *</label>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={form.role}
                      onChange={e => set('role', e.target.value)}
                      className={fieldClass}
                      disabled={!form.primaryHomeId}
                    >
                      <option value=""></option>
                      {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <Help />
                  </div>
                  {!form.primaryHomeId && (
                    <p className="text-xs text-gray-400">
                      A primary home must be selected before you can select a position.
                    </p>
                  )}
                </div>
              </div>

              {/* HR Access Only */}
              <div className="flex items-center gap-4 py-3 px-4 rounded" style={{ background: '#f9fafb' }}>
                <span className="flex-1 text-sm text-gray-700 font-medium">HR Access Only</span>
                <FormToggle checked={form.hrAccessOnly} onChange={v => set('hrAccessOnly', v)} />
                <Help />
              </div>

              {/* Web Access */}
              <div className="flex items-center gap-4 py-3 px-4 rounded" style={{ background: '#f9fafb' }}>
                <span className="flex-1 text-sm text-gray-700 font-medium">Web Access</span>
                {!form.webAccess && (
                  <span
                    className="px-3 py-1 rounded text-xs font-semibold text-white"
                    style={{ background: '#f87171' }}
                  >
                    Disabled
                  </span>
                )}
                <FormToggle checked={form.webAccess} onChange={v => set('webAccess', v)} />
                <Help />
              </div>

              {/* Photo placeholder */}
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
                className="w-full py-3 rounded text-white font-bold text-sm flex items-center justify-center gap-2"
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

/* ── formatters ── */
function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/* ── Main component ── */
export default function StaffClient({ data }) {
  const [tab, setTab] = useState('roster')
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [staffData, setStaffData] = useState(data?.staff || [])
  const [togglingId, setTogglingId] = useState(null)

  const filtered = staffData.filter(s => {
    const match = `${s.firstName} ${s.lastName} ${s.role || ''} ${s.email || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const activeMatch =
      filterActive === 'All' || (filterActive === 'Active' ? s.active : !s.active)
    return match && activeMatch
  })

  async function toggleWebAccess(staffId, current) {
    setTogglingId(staffId)
    setStaffData(prev =>
      prev.map(s => s.id === staffId ? { ...s, webAccess: !current } : s)
    )
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAccess: !current }),
      })
      if (!res.ok) {
        setStaffData(prev =>
          prev.map(s => s.id === staffId ? { ...s, webAccess: current } : s)
        )
      }
    } catch {
      setStaffData(prev =>
        prev.map(s => s.id === staffId ? { ...s, webAccess: current } : s)
      )
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {[['roster', 'Staff Roster'], ['shifts', 'Shift Records']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-purple-700 text-purple-700'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── ROSTER TAB ── */}
      {tab === 'roster' && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none w-52"
                />
              </div>
              <select
                value={filterActive}
                onChange={e => setFilterActive(e.target.value)}
                className="border border-gray-200 rounded text-sm py-1.5 px-2 focus:outline-none"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-lg hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #1e0a3c, #6b21a8)' }}
            >
              <Plus size={13} /> Add Staff
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-3">
            {[
              { label: 'Total Staff', value: staffData.length },
              { label: 'Active', value: staffData.filter(s => s.active).length },
              { label: 'Web Access', value: staffData.filter(s => s.webAccess).length },
            ].map(s => (
              <div
                key={s.label}
                className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center min-w-[100px]"
              >
                <p className="text-lg font-bold" style={{ color: '#6b21a8' }}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Position</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tier</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Web Access</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Account Name</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No staff found.
                    </td>
                  </tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 self-stretch rounded-full flex-shrink-0"
                          style={{ background: '#6b21a8', minHeight: '20px' }}
                        />
                        <span className="font-semibold text-gray-800">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{s.role || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">Tier {s.tier ?? 5}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Toggle
                        checked={!!s.webAccess}
                        onChange={() => toggleWebAccess(s.id, s.webAccess)}
                        disabled={togglingId === s.id}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="border border-gray-200 rounded px-2 py-1 bg-gray-50 text-sm text-gray-500"
                        style={{ minWidth: '120px' }}
                      >
                        {s.username || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── SHIFTS TAB ── */}
      {tab === 'shifts' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Staff Member</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Shift Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Clock In</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Clock Out</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Duration</th>
              </tr>
            </thead>
            <tbody>
              {(data?.shiftRecords || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No shift records.
                  </td>
                </tr>
              ) : (data?.shiftRecords || []).map((r, i) => {
                const duration = r.clockOut
                  ? Math.round((new Date(r.clockOut) - new Date(r.clockIn)) / (1000 * 60 * 60) * 10) / 10
                  : null
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-purple-600" />
                        <span className="font-medium text-gray-800">{r.staffName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.shiftType || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDateTime(r.clockIn)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.clockOut
                        ? fmtDateTime(r.clockOut)
                        : <span className="text-orange-500 text-xs font-medium">Still on shift</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-500">{duration ? `${duration}h` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); window.location.reload() }}
          homes={data?.homes || []}
          staffList={staffData}
        />
      )}
    </div>
  )
}
