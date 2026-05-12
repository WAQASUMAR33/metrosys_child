'use client'

import { useState } from 'react'
import { Search, Plus, Phone, Mail, User } from 'lucide-react'

const CONTACT_TYPES = ['Social Worker', 'Local Authority', 'Healthcare', 'Education', 'Legal', 'Emergency', 'Supplier', 'Other']

function TypeBadge({ type }) {
  const map = {
    'Social Worker': 'bg-green-100 text-green-700',
    'Local Authority': 'bg-blue-100 text-blue-700',
    'Healthcare': 'bg-green-100 text-green-700',
    'Education': 'bg-yellow-100 text-yellow-700',
    'Legal': 'bg-gray-100 text-gray-700',
    'Emergency': 'bg-red-100 text-red-700',
    'Supplier': 'bg-orange-100 text-orange-700',
    'Other': 'bg-gray-100 text-gray-500',
  }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[type] || 'bg-gray-100 text-gray-500'}`}>{type || '—'}</span>
}

function DetailModal({ contact, onClose }) {
  if (!contact) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-3 flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
          <div>
            <h2 className="font-semibold text-[#166534]">{contact.name}</h2>
            <p className="text-xs text-[#16A34A]">{contact.role || ''}{contact.organisation ? ` — ${contact.organisation}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="flex items-center gap-2"><TypeBadge type={contact.type} /></div>
          {contact.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><a href={`mailto:${contact.email}`} className="text-[#0D9488] hover:underline">{contact.email}</a></div>}
          {contact.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><a href={`tel:${contact.phone}`} className="text-[#0D9488] hover:underline">{contact.phone}</a></div>}
          {contact.homeName && <div className="text-xs text-gray-500">Home: {contact.homeName}</div>}
          {contact.notes && <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">{contact.notes}</div>}
        </div>
      </div>
    </div>
  )
}

export default function ContactsClient({ data, companyId, homeId }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', organisation: '', email: '', phone: '', type: 'Other', notes: '' })
  const [saving, setSaving] = useState(false)

  const contacts = (data?.contacts || []).filter((c) => {
    const match = `${c.name} ${c.role || ''} ${c.organisation || ''}`.toLowerCase().includes(search.toLowerCase())
    const typeMatch = filterType === 'All' || c.type === filterType
    return match && typeMatch
  })

  async function handleAdd() {
    if (!form.name) return
    setSaving(true)
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, companyId, homeId }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', role: '', organisation: '', email: '', phone: '', type: 'Other', notes: '' })
    window.location.reload()
  }

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#16A34A] w-52" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded text-sm py-1.5 px-2 focus:outline-none">
            <option value="All">All Types</option>
            {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
          <Plus size={13} /> Add Contact
        </button>
      </div>

      {/* Grid */}
      {contacts.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">No contacts found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {contacts.map((c) => (
            <div key={c.id} onClick={() => setSelected(c)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:bg-green-50/60 cursor-pointer transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 flex-shrink-0">
                  <User size={15} className="text-[#16A34A]" />
                </div>
                <TypeBadge type={c.type} />
              </div>
              <p className="font-medium text-gray-800 text-sm">{c.name}</p>
              {c.role && <p className="text-xs text-gray-500 mt-0.5">{c.role}</p>}
              {c.organisation && <p className="text-xs text-gray-400">{c.organisation}</p>}
              <div className="mt-2 space-y-1">
                {c.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} /> {c.phone}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-[#0D9488]">
                    <Mail size={11} /> {c.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DetailModal contact={selected} onClose={() => setSelected(null)} />

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Add Contact</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Name *', key: 'name', placeholder: 'Full name' },
                { label: 'Role', key: 'role', placeholder: 'e.g. Social Worker' },
                { label: 'Organisation', key: 'organisation', placeholder: 'e.g. Council name' },
                { label: 'Phone', key: 'phone', placeholder: '+44...' },
                { label: 'Email', key: 'email', placeholder: 'email@example.com' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input type="text" value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
                  {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} disabled={saving || !form.name}
                className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Contact'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
