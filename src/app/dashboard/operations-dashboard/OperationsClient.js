'use client'

import { useState } from 'react'
import { Search, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtMoney(n) {
  if (!n && n !== 0) return '—'
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`
}

function RatingBadge({ rating }) {
  if (!rating) return <span className="text-gray-400 text-xs">—</span>
  const map = {
    'Outstanding': 'bg-green-100 text-green-700',
    'Good': 'bg-green-100 text-green-700',
    'Requires Improvement': 'bg-orange-100 text-orange-700',
    'Inadequate': 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[rating] || 'bg-gray-100 text-gray-500'}`}>{rating}</span>
}

function BoolCell({ val }) {
  if (val === null || val === undefined) return <span className="text-gray-400 text-xs">—</span>
  return val
    ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={11} /> Yes</span>
    : <span className="flex items-center gap-1 text-red-600 text-xs"><AlertTriangle size={11} /> No</span>
}

export default function OperationsClient({ data }) {
  const [search, setSearch] = useState('')
  const [groupBy, setGroupBy] = useState('none')

  const homes = (data?.homes || []).filter((h) =>
    `${h.name} ${h.area} ${h.region}`.toLowerCase().includes(search.toLowerCase())
  )

  // Summary stats
  const totalYP = homes.reduce((a, h) => a + h.activeYP, 0)
  const totalVacant = homes.reduce((a, h) => a + h.vacantBeds, 0)
  const totalOpenInc = homes.reduce((a, h) => a + h.openIncidents, 0)
  const overBudget = homes.filter(h => h.withinBudget === false).length

  // Group
  let grouped = {}
  if (groupBy === 'area') {
    for (const h of homes) {
      const key = h.area || 'No Area'
      grouped[key] = grouped[key] || []
      grouped[key].push(h)
    }
  } else if (groupBy === 'region') {
    for (const h of homes) {
      const key = h.region || 'No Region'
      grouped[key] = grouped[key] || []
      grouped[key].push(h)
    }
  } else {
    grouped = { '': homes }
  }

  const renderTable = (list) => (
    <div className="border border-[#BBF7D0] rounded overflow-x-auto mb-4">
      <table className="text-xs whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            {['Home', 'Status', 'Rating', 'Active YP', 'Reg. Beds', 'Vacant', 'Longest Empty', 'Active Staff', 'Open Incidents', 'Critical', 'Within Budget', 'Last Inspection'].map(col => (
              <th key={col} className="text-left px-3 py-2 font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((h, i) => (
            <tr key={h.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
              <td className="px-3 py-2 font-medium text-gray-800 sticky left-0 bg-inherit">{h.name}</td>
              <td className="px-3 py-2 text-gray-500">{h.registrationStatus || '—'}</td>
              <td className="px-3 py-2"><RatingBadge rating={h.rating} /></td>
              <td className="px-3 py-2 text-center font-medium text-gray-800">{h.activeYP}</td>
              <td className="px-3 py-2 text-center text-gray-600">{h.registeredBeds}</td>
              <td className="px-3 py-2 text-center">
                <span className={h.vacantBeds > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}>{h.vacantBeds}</span>
              </td>
              <td className="px-3 py-2 text-center text-gray-500">{h.longestEmpty}d</td>
              <td className="px-3 py-2 text-center text-gray-600">{h.activeStaff}/{h.totalStaff}</td>
              <td className="px-3 py-2 text-center">
                <span className={h.openIncidents > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}>{h.openIncidents}</span>
              </td>
              <td className="px-3 py-2 text-center">
                <span className={h.criticalIncidents > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>{h.criticalIncidents}</span>
              </td>
              <td className="px-3 py-2"><BoolCell val={h.withinBudget} /></td>
              <td className="px-3 py-2 text-gray-500">{fmtDate(h.lastInspectionDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="p-4">
      {/* Summary KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Homes', value: homes.length, color: 'text-[#166534]' },
          { label: 'Active Young People', value: totalYP, color: 'text-gray-800' },
          { label: 'Vacant Beds', value: totalVacant, color: totalVacant > 0 ? 'text-orange-600' : 'text-green-600' },
          { label: 'Open Incidents', value: totalOpenInc, color: totalOpenInc > 0 ? 'text-red-600' : 'text-green-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {overBudget > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-500" />
          <span className="text-sm text-red-700">{overBudget} home{overBudget > 1 ? 's are' : ' is'} over budget.</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search homes..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#16A34A] w-52" />
        </div>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
          className="border border-gray-200 rounded text-sm py-1.5 px-2 focus:outline-none">
          <option value="none">No Grouping</option>
          <option value="area">Group by Area</option>
          <option value="region">Group by Region</option>
        </select>
        <span className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp size={12} /> {homes.length} homes</span>
      </div>

      {/* Table(s) */}
      {Object.entries(grouped).map(([group, list]) => (
        <div key={group}>
          {group && <h3 className="text-sm font-semibold text-[#166534] mb-2 mt-4">{group}</h3>}
          {renderTable(list)}
        </div>
      ))}
    </div>
  )
}
