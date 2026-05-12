'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronRight, User, Camera } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function truncate(text, len = 60) {
  if (!text) return '—'
  return text.length > len ? text.slice(0, len) + '…' : text
}


function AddModal({ onClose, onSaved }) {
  const empty = {
    firstName: '', lastName: '', admissionDate: '', gender: '',
    dateOfBirth: '', photoUrl: '', longTermPlan: '', currentSupportNeeds: '', placement: '',
  }
  const [form, setForm] = useState(empty)
  const [preview, setPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.firstName || !form.lastName) { setError('First and last name are required.'); return }
    setSaving(true)
    try {
      let photoUrl = form.photoUrl
      if (photoFile) {
        const fd = new FormData()
        fd.append('file', photoFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) { setError('Image upload failed.'); setSaving(false); return }
        const { url } = await upRes.json()
        photoUrl = url
      }
      const res = await fetch('/api/young-people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photoUrl }),
      })
      if (res.ok) { onSaved() } else { setError('Failed to save. Please try again.') }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-3 flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
          <h2 className="font-semibold text-[#166534]">Add Young Person</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5">
          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

          {/* Photo picker */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Camera size={22} />
                  <span className="text-[10px]">Photo</span>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-[#16A34A] border border-[#16A34A] rounded px-3 py-1.5 hover:bg-green-50 transition-colors"
              >
                Browse image
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={() => { setPreview(null); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="ml-2 text-xs text-gray-400 hover:text-red-500"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to any size</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="First Name *" value={form.firstName} onChange={v => set('firstName', v)} />
            <F label="Last Name *" value={form.lastName} onChange={v => set('lastName', v)} />
            <F label="Date of Birth" value={form.dateOfBirth} onChange={v => set('dateOfBirth', v)} type="date" />
            <Sel label="Gender" value={form.gender} onChange={v => set('gender', v)} options={['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']} />
            <F label="Admission Date" value={form.admissionDate} onChange={v => set('admissionDate', v)} type="date" />
            <Sel label="Placement" value={form.placement} onChange={v => set('placement', v)} options={['Emergency', 'Short Term', 'Long Term', 'Respite', 'Remand']} />
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Long Term Plan</label>
              <textarea value={form.longTermPlan} onChange={e => set('longTermPlan', e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] resize-none" placeholder="Long term plan..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Current Support Needs</label>
              <textarea value={form.currentSupportNeeds} onChange={e => set('currentSupportNeeds', e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] resize-none" placeholder="Current support needs..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Young Person'}
            </button>
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function F({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function YoungPeopleClient({ data }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const yps = (data?.youngPeople || []).filter((yp) =>
    `${yp.firstName} ${yp.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search young people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#16A34A] w-60"
          />
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
          <Plus size={14} /> Add Young Person
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-4">
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 text-center min-w-[80px]">
          <p className="text-lg font-bold text-[#166534]">{data?.youngPeople?.length || 0}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left px-3 py-2 font-semibold">Name</th>
              <th className="text-left px-3 py-2 font-semibold">Date of Birth</th>
              <th className="text-left px-3 py-2 font-semibold">Gender</th>
              <th className="text-left px-3 py-2 font-semibold">Admission Date</th>
              <th className="text-left px-3 py-2 font-semibold">Placement</th>
              <th className="text-left px-3 py-2 font-semibold">Long Term Plan</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {yps.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">
                  No young people found.
                </td>
              </tr>
            ) : (
              yps.map((yp, i) => (
                <tr
                  key={yp.id}
                  className={`border-t border-gray-100 hover:bg-green-50/60 cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  onClick={() => router.push(`/dashboard/young-people/${yp.id}`)}
                >
                  <td className="px-3 py-2 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {yp.photoUrl ? (
                        <img src={yp.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-green-100 flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 flex-shrink-0">
                          <User size={13} className="text-[#16A34A]" />
                        </div>
                      )}
                      {yp.firstName} {yp.lastName}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{fmtDate(yp.dateOfBirth)}</td>
                  <td className="px-3 py-2 text-gray-600">{yp.gender || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{fmtDate(yp.admissionDate)}</td>
                  <td className="px-3 py-2 text-gray-600">{yp.placement || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{truncate(yp.longTermPlan)}</td>
                  <td className="px-3 py-2 text-gray-300"><ChevronRight size={14} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); window.location.reload() }} />}
    </div>
  )
}
