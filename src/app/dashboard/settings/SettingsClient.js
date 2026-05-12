'use client'

import { useState } from 'react'
import { User, Building, Lock, Save, Eye, EyeOff } from 'lucide-react'

function roleLabel(role) {
  return role?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || '—'
}

export default function SettingsClient({ data }) {
  const [tab, setTab] = useState('profile')
  const [firstName, setFirstName] = useState(data?.user?.firstName || '')
  const [lastName, setLastName] = useState(data?.user?.lastName || '')
  const [email, setEmail] = useState(data?.user?.email || '')
  const [phone, setPhone] = useState(data?.user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, phone }),
    })
    setSaving(false)
    setMessage(res.ok ? { type: 'success', text: 'Profile updated successfully.' } : { type: 'error', text: 'Failed to update profile.' })
    setTimeout(() => setMessage(null), 3000)
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setSaving(true)
    const res = await fetch('/api/settings/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setSaving(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } else {
      const { error } = await res.json()
      setMessage({ type: 'error', text: error || 'Failed to change password.' })
    }
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-bold text-[#166534] mb-5">Settings</h1>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {[['profile', 'Profile', <User size={14} />], ['password', 'Password', <Lock size={14} />], ['company', 'Company', <Building size={14} />]].map(([key, label, icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium border-b-2 flex items-center gap-1.5 transition-colors ${tab === key ? 'text-[#166534] border-[#166534]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#F0FDF4] rounded border border-[#BBF7D0]">
            <div className="w-12 h-12 rounded-full bg-[#166534] flex items-center justify-center text-white font-bold text-lg">
              {(firstName || data?.user?.firstName || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[#166534]">{data?.user?.username}</p>
              <p className="text-xs text-[#16A34A]">{roleLabel(data?.user?.role)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name', value: firstName, setter: setFirstName },
              { label: 'Last Name', value: lastName, setter: setLastName },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input type="text" value={value} onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50">
            <Save size={13} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="space-y-4 max-w-sm">
          {[
            { label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
            { label: 'New Password', value: newPassword, setter: setNewPassword },
            { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={value} onChange={(e) => setter(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 pr-9 text-sm focus:outline-none focus:border-[#16A34A]" />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">Password must be at least 8 characters.</p>
          <button onClick={changePassword} disabled={saving || !currentPassword || !newPassword}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50">
            <Lock size={13} /> {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}

      {/* Company tab */}
      {tab === 'company' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#166534] mb-3">Company Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Company Name</p>
                <p className="font-medium text-gray-800">{data?.company?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Encryption PIN</p>
                <p className="font-medium text-gray-800 font-mono">{'•'.repeat(data?.company?.encryptionPin?.length || 4)}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">To update company details or encryption PIN, contact your system administrator.</p>
        </div>
      )}
    </div>
  )
}
