'use client'

import { useState } from 'react'
import { Search, FileText, ChevronRight, Plus } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(iso) {
  if (!iso) return false
  return new Date(iso) < new Date()
}

function CategoryBadge({ category }) {
  const colors = [
    'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700', 'bg-gray-100 text-gray-600',
  ]
  const hash = (category || 'Other').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[hash % colors.length]}`}>{category || 'General'}</span>
}

export default function PoliciesClient({ data }) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: '', version: '', reviewDate: '', content: '' })
  const [saving, setSaving] = useState(false)

  const categories = [...new Set((data?.policies || []).map(p => p.category).filter(Boolean))]

  const policies = (data?.policies || []).filter((p) => {
    const match = `${p.title} ${p.category || ''}`.toLowerCase().includes(search.toLowerCase())
    const catMatch = filterCat === 'All' || p.category === filterCat
    return match && catMatch
  })

  async function handleAdd() {
    if (!form.title || !form.content) return
    setSaving(true)
    await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', category: '', version: '', reviewDate: '', content: '' })
    window.location.reload()
  }

  return (
    <div className="p-4 flex gap-4" style={{ minHeight: 'calc(100vh - 52px)' }}>
      {/* List panel */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#16A34A]" />
          </div>
          <button onClick={() => setShowForm(true)} className="flex-shrink-0 bg-[#166534] text-white text-xs px-2 py-1.5 rounded hover:bg-[#14532D]">
            <Plus size={12} />
          </button>
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded text-xs py-1.5 px-2 focus:outline-none w-full">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
            <span className="text-xs font-semibold text-[#166534]">Policies & Procedures ({policies.length})</span>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {policies.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8">No policies found.</p>
            ) : policies.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-green-50 transition-colors ${selected?.id === p.id ? 'bg-green-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <FileText size={11} className="text-[#16A34A] flex-shrink-0" />
                      <p className="text-xs font-medium text-gray-800 truncate">{p.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.category && <CategoryBadge category={p.category} />}
                      {p.version && <span className="text-[10px] text-gray-400">v{p.version}</span>}
                    </div>
                    {p.reviewDate && (
                      <p className={`text-[10px] mt-0.5 ${isOverdue(p.reviewDate) ? 'text-red-500' : 'text-gray-400'}`}>
                        Review: {fmtDate(p.reviewDate)}{isOverdue(p.reviewDate) ? ' ⚠ Overdue' : ''}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={12} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
        {selected ? (
          <>
            <div className="bg-[#F0FDF4] px-5 py-3 border-b border-[#BBF7D0]">
              <h2 className="font-semibold text-[#166534]">{selected.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                {selected.category && <CategoryBadge category={selected.category} />}
                {selected.version && <span className="text-xs text-gray-500">Version {selected.version}</span>}
                {selected.reviewDate && (
                  <span className={`text-xs ${isOverdue(selected.reviewDate) ? 'text-red-500' : 'text-gray-500'}`}>
                    Review date: {fmtDate(selected.reviewDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <FileText size={48} className="mb-3" />
            <p className="text-sm">Select a policy to view</p>
          </div>
        )}
      </div>

      {/* Add policy modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Add Policy / Procedure</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="Policy title" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="e.g. Safeguarding" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Version</label>
                <input type="text" value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="e.g. 1.0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Review Date</label>
                <input type="date" value={form.reviewDate} onChange={(e) => setForm(f => ({ ...f, reviewDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Content *</label>
                <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} rows={10}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] resize-none" placeholder="Full policy text..." />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving || !form.title || !form.content}
                className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Policy'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
