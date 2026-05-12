'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const EVENT_COLORS = {
  SHIFT: 'bg-blue-100 text-blue-700 border-blue-200',
  YOUNG_PERSON_MEETING: 'bg-green-100 text-green-700 border-green-200',
  STAFF_MEETING: 'bg-green-100 text-green-700 border-green-200',
  APPOINTMENT: 'bg-orange-100 text-orange-700 border-orange-200',
  OTHER: 'bg-gray-100 text-gray-600 border-gray-200',
}

const EVENT_LABELS = {
  SHIFT: 'Shift',
  YOUNG_PERSON_MEETING: 'YP Meeting',
  STAFF_MEETING: 'Staff Meeting',
  APPOINTMENT: 'Appointment',
  OTHER: 'Other',
}

function getColor(type) {
  return EVENT_COLORS[type] || EVENT_COLORS.OTHER
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarClient({ data }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('OTHER')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [saving, setSaving] = useState(false)

  const events = data?.events || []

  function eventsForDay(day) {
    return events.filter((e) => {
      const d = new Date(e.startTime)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const blanks = firstDay === 0 ? 6 : firstDay - 1

  const monthName = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const selectedEvents = eventsForDay(selectedDay)

  async function handleAddEvent() {
    if (!newTitle || !newStart || !newEnd) return
    setSaving(true)
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        eventType: newType,
        startTime: newStart,
        endTime: newEnd,
        homeId: data?.homeId,
      }),
    })
    setSaving(false)
    setShowForm(false)
    setNewTitle(''); setNewStart(''); setNewEnd('')
    window.location.reload()
  }

  return (
    <div className="p-4 flex gap-4" style={{ minHeight: 'calc(100vh - 52px)' }}>
      {/* Calendar grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
            <h2 className="font-semibold text-[#166534] text-base w-44 text-center">{monthName}</h2>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
            <Plus size={13} /> Add Event
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
          {Array.from({ length: blanks }).map((_, i) => (
            <div key={`b${i}`} className="border-r border-b border-gray-200 min-h-[80px] bg-gray-50/50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = eventsForDay(day)
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = day === selectedDay
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`border-r border-b border-gray-200 min-h-[80px] p-1 cursor-pointer transition-colors ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#15803D] text-white' : 'text-gray-700'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} className={`text-[10px] px-1 py-0.5 rounded truncate border ${getColor(e.eventType)}`}>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side panel — selected day */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
            <p className="text-xs font-semibold text-[#166534]">
              {new Date(year, month, selectedDay).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="bg-white min-h-[200px] max-h-[60vh] overflow-y-auto">
            {selectedEvents.length === 0 ? (
              <p className="text-center text-gray-400 text-xs mt-8">No events</p>
            ) : (
              selectedEvents.map((e) => (
                <div key={e.id} className="px-3 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-800">{e.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{fmtTime(e.startTime)} – {fmtTime(e.endTime)}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border mt-1 inline-block ${getColor(e.eventType)}`}>
                    {EVENT_LABELS[e.eventType] || e.eventType}
                  </span>
                  {e.description && <p className="text-[11px] text-gray-500 mt-1">{e.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-[#166534] mb-2">Event Types</p>
          {Object.entries(EVENT_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full border ${getColor(key)}`} />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add event modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Add Calendar Event</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="Event title" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
                  {Object.entries(EVENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start</label>
                  <input type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End</label>
                  <input type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAddEvent} disabled={saving || !newTitle || !newStart || !newEnd}
                  className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Event'}
                </button>
                <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
