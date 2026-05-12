'use client'

import { useState } from 'react'
import { Mail, Send, Plus, Search, ChevronRight } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function roleLabel(role) {
  return role?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || ''
}

export default function MessagesClient({ data, currentUserId }) {
  const [tab, setTab] = useState('inbox')
  const [selected, setSelected] = useState(null)
  const [composing, setComposing] = useState(false)
  const [search, setSearch] = useState('')
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const inbox = (data?.received || []).filter(
    (m) => `${m.senderName} ${m.subject || ''}`.toLowerCase().includes(search.toLowerCase())
  )
  const sentBox = (data?.sent || []).filter(
    (m) => `${m.receiverName} ${m.subject || ''}`.toLowerCase().includes(search.toLowerCase())
  )
  const list = tab === 'inbox' ? inbox : sentBox

  async function handleSend() {
    if (!to || !body) return
    setSending(true)
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: parseInt(to), subject, body }),
    })
    setSending(false)
    setSent(true)
    setComposing(false)
    setTo(''); setSubject(''); setBody('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 52px)' }}>
      {/* Left panel */}
      <div className="w-72 border-r border-gray-200 flex flex-col">
        {/* Compose btn */}
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={() => { setComposing(true); setSelected(null) }}
            className="w-full flex items-center justify-center gap-2 bg-[#166534] text-white text-sm py-2 rounded hover:bg-[#14532D]"
          >
            <Plus size={14} /> Compose
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[['inbox', 'Inbox'], ['sent', 'Sent']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelected(null) }}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === key ? 'text-[#166534] border-b-2 border-[#166534]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
              {key === 'inbox' && data?.received?.filter(m => !m.read).length > 0 && (
                <span className="ml-1 bg-[#15803D] text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {data.received.filter(m => !m.read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#16A34A]"
            />
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-center text-gray-400 text-xs mt-8">No messages</p>
          ) : (
            list.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); setComposing(false) }}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-green-50 transition-colors ${selected?.id === m.id ? 'bg-green-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium ${!m.read && tab === 'inbox' ? 'text-[#166534]' : 'text-gray-700'}`}>
                    {tab === 'inbox' ? m.senderName : m.receiverName}
                  </span>
                  <span className="text-[10px] text-gray-400">{fmtDate(m.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{m.subject || '(no subject)'}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{m.body}</p>
                {!m.read && tab === 'inbox' && (
                  <span className="w-1.5 h-1.5 bg-[#15803D] rounded-full inline-block ml-auto" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {composing ? (
          <div className="p-5 flex flex-col gap-3 max-w-2xl">
            <h3 className="font-semibold text-[#166534] text-sm mb-1">New Message</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-200 rounded text-sm px-3 py-2 focus:outline-none focus:border-[#16A34A]"
              >
                <option value="">Select recipient...</option>
                {(data?.users || []).map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {roleLabel(u.role)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-200 rounded text-sm px-3 py-2 focus:outline-none focus:border-[#16A34A]"
                placeholder="Subject (optional)"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full border border-gray-200 rounded text-sm px-3 py-2 focus:outline-none focus:border-[#16A34A] resize-none"
                placeholder="Write your message..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSend}
                disabled={sending || !to || !body}
                className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <Send size={13} /> {sending ? 'Sending...' : 'Send'}
              </button>
              <button onClick={() => setComposing(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
                Cancel
              </button>
            </div>
            {sent && <p className="text-green-600 text-xs">Message sent successfully.</p>}
          </div>
        ) : selected ? (
          <div className="p-5 max-w-2xl">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-semibold text-gray-800 text-base mb-1">{selected.subject || '(no subject)'}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>From: <span className="text-gray-700 font-medium">{selected.senderName || 'You'}</span></span>
                <span>{new Date(selected.createdAt).toLocaleString('en-GB')}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <Mail size={48} className="mb-3" />
            <p className="text-sm">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  )
}
