'use client'

import { useState } from 'react'
import { LogIn, LogOut, UserCheck, Clock, Plus } from 'lucide-react'

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function duration(inIso, outIso) {
  if (!outIso) return null
  const mins = Math.round((new Date(outIso) - new Date(inIso)) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function VisitorSignInClient({ data }) {
  const [tab, setTab] = useState('visitors')
  const [showVisitorForm, setShowVisitorForm] = useState(false)
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [staffName, setStaffName] = useState('')
  const [shiftType, setShiftType] = useState('Morning')
  const [saving, setSaving] = useState(false)

  const onSite = (data?.visitors || []).filter(v => !v.signOutTime)
  const staffOnShift = (data?.staffShifts || []).filter(s => !s.clockOut)

  async function signInVisitor() {
    if (!visitorName) return
    setSaving(true)
    await fetch('/api/visitor-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorName, purpose, homeId: data?.homeId }),
    })
    setSaving(false)
    setShowVisitorForm(false)
    setVisitorName(''); setPurpose('')
    window.location.reload()
  }

  async function signOutVisitor(id) {
    await fetch(`/api/visitor-signin/${id}/signout`, { method: 'POST' })
    window.location.reload()
  }

  async function clockInStaff() {
    if (!staffName) return
    setSaving(true)
    await fetch('/api/staff-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName, shiftType, homeId: data?.homeId }),
    })
    setSaving(false)
    setShowStaffForm(false)
    setStaffName(''); setShiftType('Morning')
    window.location.reload()
  }

  async function clockOutStaff(id) {
    await fetch(`/api/staff-signin/${id}/clockout`, { method: 'POST' })
    window.location.reload()
  }

  return (
    <div className="p-4">
      {/* Stats */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'Visitors On Site', value: onSite.length, icon: <UserCheck size={16} className="text-[#16A34A]" /> },
          { label: 'Staff On Shift', value: staffOnShift.length, icon: <Clock size={16} className="text-green-500" /> },
          { label: 'Total Visitors Today', value: (data?.visitors || []).filter(v => new Date(v.signInTime).toDateString() === new Date().toDateString()).length, icon: <LogIn size={16} className="text-blue-500" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3 min-w-[140px]">
            {s.icon}
            <div>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 border-b border-gray-200">
          {[['visitors', 'Visitor Register'], ['staff', 'Staff Clock In/Out']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'text-[#166534] border-[#166534]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => tab === 'visitors' ? setShowVisitorForm(true) : setShowStaffForm(true)}
          className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
          <Plus size={13} /> {tab === 'visitors' ? 'Sign In Visitor' : 'Clock In Staff'}
        </button>
      </div>

      {/* Visitors table */}
      {tab === 'visitors' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2 font-semibold">Visitor Name</th>
                <th className="text-left px-3 py-2 font-semibold">Purpose</th>
                <th className="text-left px-3 py-2 font-semibold">Sign In</th>
                <th className="text-left px-3 py-2 font-semibold">Sign Out</th>
                <th className="text-left px-3 py-2 font-semibold">Duration</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(data?.visitors || []).length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">No visitor records.</td></tr>
              ) : (data?.visitors || []).map((v, i) => (
                <tr key={v.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    <div className="flex items-center gap-2"><UserCheck size={13} className="text-[#16A34A]" />{v.visitorName}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{v.purpose || '—'}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{fmtDateTime(v.signInTime)}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{v.signOutTime ? fmtDateTime(v.signOutTime) : '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{v.signOutTime ? duration(v.signInTime, v.signOutTime) : '—'}</td>
                  <td className="px-3 py-2">
                    {!v.signOutTime
                      ? <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">On Site</span>
                      : <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-400">Signed Out</span>}
                  </td>
                  <td className="px-3 py-2">
                    {!v.signOutTime && (
                      <button onClick={() => signOutVisitor(v.id)}
                        className="flex items-center gap-1 text-xs text-orange-600 border border-orange-200 rounded px-2 py-0.5 hover:bg-orange-50">
                        <LogOut size={10} /> Sign Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff shifts table */}
      {tab === 'staff' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2 font-semibold">Staff Member</th>
                <th className="text-left px-3 py-2 font-semibold">Shift</th>
                <th className="text-left px-3 py-2 font-semibold">Clock In</th>
                <th className="text-left px-3 py-2 font-semibold">Clock Out</th>
                <th className="text-left px-3 py-2 font-semibold">Duration</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(data?.staffShifts || []).length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">No shift records.</td></tr>
              ) : (data?.staffShifts || []).map((s, i) => (
                <tr key={s.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    <div className="flex items-center gap-2"><Clock size={13} className="text-[#16A34A]" />{s.staffName}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{s.shiftType || '—'}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{fmtDateTime(s.clockIn)}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{s.clockOut ? fmtDateTime(s.clockOut) : '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{s.clockOut ? duration(s.clockIn, s.clockOut) : '—'}</td>
                  <td className="px-3 py-2">
                    {!s.clockOut
                      ? <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">On Shift</span>
                      : <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-400">Clocked Out</span>}
                  </td>
                  <td className="px-3 py-2">
                    {!s.clockOut && (
                      <button onClick={() => clockOutStaff(s.id)}
                        className="flex items-center gap-1 text-xs text-orange-600 border border-orange-200 rounded px-2 py-0.5 hover:bg-orange-50">
                        <LogOut size={10} /> Clock Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visitor sign in modal */}
      {showVisitorForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Sign In Visitor</h3>
              <button onClick={() => setShowVisitorForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Visitor Name</label>
                <input type="text" value={visitorName} onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="Full name" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Purpose of Visit</label>
                <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="e.g. Social worker visit" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={signInVisitor} disabled={saving || !visitorName}
                  className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                  {saving ? 'Signing In...' : 'Sign In'}
                </button>
                <button onClick={() => setShowVisitorForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff clock in modal */}
      {showStaffForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Clock In Staff</h3>
              <button onClick={() => setShowStaffForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Staff Member Name</label>
                <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="Full name" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Shift Type</label>
                <select value={shiftType} onChange={(e) => setShiftType(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
                  {['Morning', 'Afternoon', 'Evening', 'Night', 'Whole Day'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={clockInStaff} disabled={saving || !staffName}
                  className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                  {saving ? 'Clocking In...' : 'Clock In'}
                </button>
                <button onClick={() => setShowStaffForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
