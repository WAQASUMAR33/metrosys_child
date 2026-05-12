'use client'

import { TrendingUp, Users, DollarSign, Shield } from 'lucide-react'

function fmtMoney(n) {
  return `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`
}

function BarChart({ data, valueKey, labelKey, color = 'bg-[#16A34A]' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0 truncate">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
            <div
              className={`h-5 rounded-full ${color} transition-all`}
              style={{ width: `${(d[valueKey] / max) * 100}%` }}
            />
            <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-medium text-gray-700">
              {d[valueKey]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MoneyBar({ data }) {
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-24 text-right flex-shrink-0 truncate">{d.cat}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
            <div className="h-5 rounded-full bg-[#15803D] transition-all" style={{ width: `${(d.total / max) * 100}%` }} />
            <span className="absolute right-2 top-0 h-5 flex items-center text-xs font-medium text-gray-700">{fmtMoney(d.total)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalysisClient({ data }) {
  const s = data?.summary || {}

  return (
    <div className="p-4 space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Incidents (6mo)', value: s.totalIncidents || 0, icon: <Shield size={18} className="text-red-400" /> },
          { label: 'Active Young People', value: s.activeYP || 0, icon: <Users size={18} className="text-[#16A34A]" /> },
          { label: 'Active Staff', value: s.activeStaff || 0, icon: <Users size={18} className="text-green-500" /> },
          { label: 'Total Spend', value: fmtMoney(s.totalSpend), icon: <DollarSign size={18} className="text-orange-500" /> },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">{c.label}</p>
              {c.icon}
            </div>
            <p className="text-xl font-bold text-gray-800">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Incidents per month */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50 flex items-center gap-2">
            <TrendingUp size={14} className="text-[#16A34A]" />
            <span className="font-semibold text-[#166534] text-sm">Incidents by Month</span>
          </div>
          <div className="p-4">
            {(data?.months || []).every(m => m.incidents === 0)
              ? <p className="text-center text-gray-400 text-xs py-4">No incident data.</p>
              : <BarChart data={data?.months || []} valueKey="incidents" labelKey="label" />
            }
          </div>
        </div>

        {/* Incidents by type */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50 flex items-center gap-2">
            <Shield size={14} className="text-[#16A34A]" />
            <span className="font-semibold text-[#166534] text-sm">Incidents by Type</span>
          </div>
          <div className="p-4">
            {(data?.incidentsByType || []).length === 0
              ? <p className="text-center text-gray-400 text-xs py-4">No incident data.</p>
              : <BarChart data={data?.incidentsByType || []} valueKey="count" labelKey="type" color="bg-orange-400" />
            }
          </div>
        </div>

        {/* Spend by category */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 col-span-2">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50 flex items-center gap-2">
            <DollarSign size={14} className="text-[#16A34A]" />
            <span className="font-semibold text-[#166534] text-sm">Spend by Category</span>
            {s.totalBudget > 0 && (
              <span className="ml-auto text-xs text-gray-500">Budget: {fmtMoney(s.totalBudget)} | Spent: {fmtMoney(s.totalSpend)} ({Math.round((s.totalSpend / s.totalBudget) * 100)}%)</span>
            )}
          </div>
          <div className="p-4">
            {(data?.spendByCategory || []).length === 0
              ? <p className="text-center text-gray-400 text-xs py-4">No finance data.</p>
              : <MoneyBar data={data?.spendByCategory || []} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}
