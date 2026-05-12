'use client'

import { Settings, Mail, Plus, ArrowUpDown } from 'lucide-react'

// ─── Stat Card Icons ────────────────────────────────────────────────
function YoungPeopleIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <circle cx="10" cy="10" r="6" fill="#4ADE80" />
      <circle cx="20" cy="8" r="7" fill="#16A34A" />
      <circle cx="30" cy="10" r="6" fill="#4ADE80" />
      <ellipse cx="10" cy="28" rx="8" ry="6" fill="#4ADE80" />
      <ellipse cx="20" cy="30" rx="10" ry="7" fill="#16A34A" />
      <ellipse cx="30" cy="28" rx="8" ry="6" fill="#4ADE80" />
    </svg>
  )
}

function MarsIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <rect x="6" y="12" width="28" height="12" rx="6" fill="#38BDF8" />
      <rect x="8" y="14" width="12" height="8" rx="4" fill="#0EA5E9" />
      <circle cx="28" cy="18" r="4" fill="#7DD3FC" />
    </svg>
  )
}

function NoOutcomesIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" fill="#15803D" />
      <line x1="10" y1="10" x2="26" y2="26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="26" y1="10" x2="10" y2="26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function MissingFromHomeIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <path d="M20 4L4 18H9V32H17V24H23V32H31V18H36L20 4Z" fill="#F97316" />
    </svg>
  )
}

function IncidentsIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <circle cx="20" cy="20" r="14" fill="#EF4444" />
      <rect x="18" y="10" width="4" height="12" rx="2" fill="white" />
      <circle cx="20" cy="26" r="2.5" fill="white" />
    </svg>
  )
}

function AttendanceIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <path d="M6 18L13 26L26 10" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 18L23 26L36 10" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RequiredReadingsIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <path d="M8 6C8 6 14 4 20 6V30C14 28 8 30 8 30V6Z" fill="#D97706" />
      <path d="M32 6C32 6 26 4 20 6V30C26 28 32 30 32 30V6Z" fill="#F59E0B" />
      <line x1="20" y1="6" x2="20" y2="30" stroke="#92400E" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Panel Widget ────────────────────────────────────────────────────
function Panel({ title, subtitle, children, actions }) {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)' }}>
        <div>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">{actions}</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-40 max-h-48 bg-white">
        {children}
      </div>
    </div>
  )
}

function PanelRow({ children, highlight }) {
  return (
    <div className={`px-3 py-2 text-xs border-b border-gray-100 ${highlight ? 'text-orange-500' : 'text-gray-700'}`}>
      {children}
    </div>
  )
}

function EmptyPanel() {
  return <div className="flex-1" />
}

// ─── Format helpers ───────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function shiftLabel(iso) {
  if (!iso) return 'Morning'
  const h = new Date(iso).getHours()
  if (h < 8) return 'Night'
  if (h < 14) return 'Morning'
  if (h < 20) return 'Afternoon'
  return 'Evening'
}

// ─── Main Component ───────────────────────────────────────────────────
export default function HomeClient({ data }) {
  const d = data || {
    youngPeopleCount: 0,
    incidentsThisWeek: 0,
    messages: [],
    calendarEvents: [],
    shiftPlans: [],
    youngPeopleMeetings: [],
    staffMeetings: [],
    tasks: [],
  }

  const STAT_CARDS = [
    {
      label: 'Young People',
      value: d.youngPeopleCount,
      icon: <YoungPeopleIcon />,
      highlight: false,
    },
    {
      label: "Today's MARS",
      value: 0,
      icon: <MarsIcon />,
      highlight: false,
    },
    {
      label: 'No Outcomes',
      value: 12,
      icon: <NoOutcomesIcon />,
      highlight: true,
    },
    {
      label: 'Missing from Home',
      value: 0,
      icon: <MissingFromHomeIcon />,
      highlight: false,
    },
    {
      label: 'Incidents this week',
      value: d.incidentsThisWeek,
      icon: <IncidentsIcon />,
      highlight: false,
    },
    {
      label: 'Attendance',
      value: '?%',
      icon: <AttendanceIcon />,
      highlight: false,
    },
    {
      label: 'Required Readings',
      value: 0,
      icon: <RequiredReadingsIcon />,
      highlight: false,
    },
  ]

  // Demo shift data matching screenshot
  const demoShifts = [
    { date: '04 Oct 2024', shift: 'Morning' },
    { date: '25 Jun 2024', shift: 'Whole Day' },
    { date: '25 Jun 2024', shift: 'Morning' },
    { date: '11 Jun 2024', shift: 'Afternoon' },
    { date: '20 May 2024', shift: 'Morning' },
  ]

  const demoYPMeetings = [
    { date: '25 Jun 2024', time: '17:52', title: '', highlight: false },
    { date: '19 Dec 2023', time: '12:55', title: 'Weekly Meeting', highlight: true },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Stat cards row */}
      <div className="flex gap-3 flex-wrap">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="flex flex-col items-center justify-between rounded-xl px-4 py-3 min-w-[110px] flex-1 bg-white"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="mb-1">{card.icon}</div>
            <span className="text-xs text-gray-600 text-center leading-tight">{card.label}</span>
            <span
              className={`text-lg font-bold mt-1 ${
                card.highlight
                  ? 'bg-[#15803D] text-white rounded px-3 py-0.5 min-w-[36px] text-center'
                  : 'text-gray-800'
              }`}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* First row of panels */}
      <div className="grid grid-cols-3 gap-3">
        {/* Messages */}
        <Panel
          title="Messages"
          subtitle="from staff to this home"
          actions={
            <>
              <Mail size={16} className="text-[#166534]" />
              <button className="ml-1 text-gray-400 hover:text-gray-600">
                <Settings size={14} />
              </button>
            </>
          }
        >
          {d.messages.length === 0 ? (
            <EmptyPanel />
          ) : (
            d.messages.map((m) => (
              <PanelRow key={m.id}>
                <span className="font-medium">{m.senderName}</span>
                {m.subject && <span className="text-gray-500 ml-2">{m.subject}</span>}
              </PanelRow>
            ))
          )}
        </Panel>

        {/* Calendar Events */}
        <Panel
          title="Calendar Events"
          subtitle="Next 7 days"
          actions={
            <button className="text-gray-400 hover:text-gray-600">
              <Settings size={14} />
            </button>
          }
        >
          {d.calendarEvents.length === 0 ? (
            <EmptyPanel />
          ) : (
            d.calendarEvents.map((e) => (
              <PanelRow key={e.id}>
                <span className="font-medium">{fmtDate(e.startTime)}</span>
                <span className="ml-2 text-gray-500">{e.title}</span>
              </PanelRow>
            ))
          )}
        </Panel>

        {/* Shift Plan */}
        <Panel
          title="Shift Plan"
          actions={
            <>
              <button className="text-gray-400 hover:text-gray-600 mr-1">
                <ArrowUpDown size={14} />
              </button>
              <button className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Plus size={12} className="text-white" />
              </button>
            </>
          }
        >
          {demoShifts.map((s, i) => (
            <PanelRow key={i}>
              <div className="flex justify-between">
                <span>{s.date}</span>
                <span className="text-gray-500">{s.shift}</span>
              </div>
            </PanelRow>
          ))}
        </Panel>
      </div>

      {/* Second row of panels */}
      <div className="grid grid-cols-3 gap-3">
        {/* Young People Meetings */}
        <Panel
          title="Young People Meetings"
          actions={
            <button className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Plus size={12} className="text-white" />
            </button>
          }
        >
          {demoYPMeetings.map((m, i) => (
            <PanelRow key={i} highlight={m.highlight}>
              <div className="flex gap-3">
                <span className={m.highlight ? 'text-orange-500' : ''}>{m.date}</span>
                <span>{m.time}</span>
                {m.title && <span className="text-gray-600">{m.title}</span>}
              </div>
            </PanelRow>
          ))}
          <EmptyPanel />
        </Panel>

        {/* Staff Meetings */}
        <Panel
          title="Staff Meetings"
          actions={null}
        >
          {d.staffMeetings.length === 0 ? (
            <EmptyPanel />
          ) : (
            d.staffMeetings.map((m) => (
              <PanelRow key={m.id}>
                <div className="flex gap-3">
                  <span>{fmtDate(m.startTime)}</span>
                  <span>{fmtTime(m.startTime)}</span>
                  <span className="text-gray-500">{m.title}</span>
                </div>
              </PanelRow>
            ))
          )}
        </Panel>

        {/* Tasks */}
        <Panel
          title="Tasks"
          actions={
            <button className="text-xs text-[#166534] border border-[#166534] rounded px-2 py-0.5 hover:bg-green-50">
              Show incomplete
            </button>
          }
        >
          {d.tasks.length === 0 ? (
            <EmptyPanel />
          ) : (
            d.tasks.map((t) => (
              <PanelRow key={t.id}>
                <div className="flex gap-2">
                  <span className={t.completed ? 'line-through text-gray-400' : ''}>{t.title}</span>
                  {t.dueDate && (
                    <span className="text-gray-400">{fmtDate(t.dueDate)}</span>
                  )}
                </div>
              </PanelRow>
            ))
          )}
        </Panel>
      </div>
    </div>
  )
}
