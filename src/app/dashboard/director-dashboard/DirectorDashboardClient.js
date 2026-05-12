'use client'

import { useState } from 'react'
import { HelpCircle, ChevronRight } from 'lucide-react'

const COLUMNS = [
  { key: 'numberOfYoungPeople', label: 'Number of Young People', help: true },
  { key: 'numberOfRegisteredBeds', label: 'Number of Registered Beds', help: false },
  { key: 'numberOfVacantBeds', label: 'Number of Vacant Beds', help: false },
  { key: 'lengthBedEmpty', label: 'Length of Time the bed is Empty (Days)', help: true },
  { key: 'staffTurnOver', label: 'Staff Turn Over (Yearly)', help: true },
  { key: 'youngPeopleTurnOver', label: 'Young Peoples Turn Over (Yearly)', help: true },
  { key: 'mothballed', label: 'Mothballed', help: false },
  { key: 'registrationStatus', label: 'Registration Status', help: false },
  { key: 'avgYoungPeopleViews', label: 'Avg Young People Views (out of 100)', help: true },
  { key: 'allCoreDocuments', label: 'All Core Documents in place', help: true },
  { key: 'reg40s', label: 'Reg 40s', help: false },
  { key: 'rating', label: 'Rating', help: false },
  { key: 'lastInspectionDate', label: 'Last Inspection Date', help: false },
  { key: 'timeOnSystem', label: 'Amount of time spent on the system (Hrs)', help: true },
  { key: 'withinBudget', label: 'Currently Within Budget', help: false },
]

function CellValue({ colKey, value }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">?</span>
  }

  if (colKey === 'mothballed') {
    return value ? (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-white text-xs font-bold bg-orange-500 min-w-10">Yes</span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    )
  }

  if (colKey === 'withinBudget') {
    return value ? (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-white text-xs font-bold bg-green-500 min-w-10">Yes</span>
    ) : (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-white text-xs font-bold bg-red-500 min-w-10">No</span>
    )
  }

  if (colKey === 'allCoreDocuments') {
    return value > 0 ? (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-white text-xs font-bold bg-green-500 min-w-10">Yes</span>
    ) : (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-white text-xs font-bold bg-red-500 min-w-10">No</span>
    )
  }

  if (colKey === 'rating') {
    if (!value) return <span className="text-gray-400">—</span>
    const colorMap = {
      'Outstanding': 'bg-green-500',
      'Good': 'bg-green-500',
      'Requires Improvement': 'bg-orange-500',
      'Inadequate': 'bg-red-500',
    }
    const bg = colorMap[value] || 'bg-gray-400'
    return (
      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-white text-xs font-bold ${bg}`}>
        {value}
      </span>
    )
  }

  if (colKey === 'lastInspectionDate' && value) {
    const d = new Date(value)
    return <span>{d.toLocaleDateString('en-GB')}</span>
  }

  return <span>{value}</span>
}

export default function DirectorDashboardClient({ homes }) {
  const [groupBy, setGroupBy] = useState(null)

  return (
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-800">Director Dashboard</h2>
          <button className="w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold">?</button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Group by -</span>
          <button
            onClick={() => setGroupBy(groupBy === 'area' ? null : 'area')}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${groupBy === 'area' ? 'bg-gray-100 border-gray-400' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            Area <ChevronRight size={12} />
          </button>
          <span>or</span>
          <button
            onClick={() => setGroupBy(groupBy === 'region' ? null : 'region')}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${groupBy === 'region' ? 'bg-gray-100 border-gray-400' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            Region <ChevronRight size={12} />
          </button>
          <button
            onClick={() => setGroupBy(null)}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 text-xs"
          >
            Show All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-white border-b border-gray-200">
              <th className="text-left px-3 py-2 font-medium text-gray-600 min-w-32 sticky left-0 bg-white border-r border-gray-200" />
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-center px-2 py-2 font-medium text-gray-600 min-w-20 max-w-24 leading-tight">
                  <div className="flex flex-col items-center gap-1">
                    {col.help && (
                      <button className="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        ?
                      </button>
                    )}
                    <span className="text-center leading-tight">{col.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {homes.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="text-center py-8 text-gray-400">
                  No homes found
                </td>
              </tr>
            ) : (
              homes.map((home) => (
                <tr key={home.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-800 sticky left-0 bg-white border-r border-gray-200">
                    <div>{home.name}</div>
                    <div className="text-gray-400 text-xs">...</div>
                  </td>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-3 text-center text-gray-700">
                      <CellValue colKey={col.key} value={home[col.key]} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-end mt-1">
        <span className="text-gray-300 text-xs">▼</span>
      </div>
    </div>
  )
}
