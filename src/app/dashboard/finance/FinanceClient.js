'use client'

import { useState } from 'react'
import { DollarSign, AlertTriangle, Plus, TrendingUp } from 'lucide-react'

function fmtMoney(n) {
  return `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function BudgetBar({ spent, budget }) {
  if (!budget) return null
  const pct = Math.min((spent / budget) * 100, 100)
  const color = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-400' : 'bg-green-500'
  return (
    <div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{fmtMoney(spent)} spent</span>
        <span>{Math.round(pct)}% of {fmtMoney(budget)}</span>
      </div>
    </div>
  )
}

export default function FinanceClient({ data }) {
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const records = (data?.records || []).filter((r) =>
    `${r.homeName} ${r.category || ''} ${r.period}`.toLowerCase().includes(search.toLowerCase())
  )

  // Aggregate by home
  const homeMap = {}
  for (const r of data?.records || []) {
    if (!homeMap[r.homeId]) {
      homeMap[r.homeId] = { name: r.homeName, budget: r.budgetAmount, spent: 0 }
    }
    homeMap[r.homeId].spent += r.spentAmount || 0
  }
  const homeStats = Object.values(homeMap)

  const totalBudget = (data?.homes || []).reduce((a, h) => a + (h.budgetAmount || 0), 0)
  const totalSpent = (data?.records || []).reduce((a, r) => a + (r.spentAmount || 0), 0)
  const budgetAlerts = homeStats.filter((h) => h.budget && (h.spent / h.budget) >= 0.9)

  async function handleAdd() {
    if (!period || !amount) return
    setSaving(true)
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, category, spentAmount: parseFloat(amount), notes }),
    })
    setSaving(false)
    setShowForm(false)
    setPeriod(''); setCategory(''); setAmount(''); setNotes('')
    window.location.reload()
  }

  return (
    <div className="p-4">
      {/* Budget alerts */}
      {budgetAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-red-700">Budget Alert: </span>
            <span className="text-red-600">{budgetAlerts.map(h => h.name).join(', ')} {budgetAlerts.length === 1 ? 'is' : 'are'} at or near budget limit.</span>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Budget', value: fmtMoney(totalBudget), icon: <DollarSign size={18} className="text-[#16A34A]" /> },
          { label: 'Total Spent', value: fmtMoney(totalSpent), icon: <TrendingUp size={18} className="text-orange-500" /> },
          { label: 'Remaining', value: fmtMoney(totalBudget - totalSpent), icon: <DollarSign size={18} className="text-green-500" /> },
          { label: 'Budget Used', value: totalBudget ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '—', icon: <TrendingUp size={18} className={totalBudget && totalSpent / totalBudget >= 0.9 ? 'text-red-500' : 'text-blue-500'} /> },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">{c.label}</p>
              {c.icon}
            </div>
            <p className="text-lg font-bold text-gray-800">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 border-b border-gray-200">
          {[['overview', 'Budget Overview'], ['records', 'Expense Records']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'text-[#166534] border-[#166534]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'records' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #166534, #16a34a)", boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
            <Plus size={13} /> Add Expense
          </button>
        )}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          {homeStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No financial data yet.</p>
          ) : homeStats.map((h, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">{h.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${h.budget && h.spent / h.budget >= 0.9 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {h.budget ? (h.spent >= h.budget ? 'Over Budget' : 'Within Budget') : 'No Budget Set'}
                </span>
              </div>
              <BudgetBar spent={h.spent} budget={h.budget} />
            </div>
          ))}
        </div>
      )}

      {tab === 'records' && (
        <>
          <div className="mb-3">
            <input type="text" placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#16A34A] w-56" />
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-3 py-2 font-semibold">Home</th>
                  <th className="text-left px-3 py-2 font-semibold">Period</th>
                  <th className="text-left px-3 py-2 font-semibold">Category</th>
                  <th className="text-left px-3 py-2 font-semibold">Amount Spent</th>
                  <th className="text-left px-3 py-2 font-semibold">Budget</th>
                  <th className="text-left px-3 py-2 font-semibold">Date</th>
                  <th className="text-left px-3 py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">No expense records.</td></tr>
                ) : records.map((r, i) => (
                  <tr key={r.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-3 py-2 font-medium text-gray-800">{r.homeName}</td>
                    <td className="px-3 py-2 text-gray-600">{r.period}</td>
                    <td className="px-3 py-2 text-gray-500">{r.category || '—'}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{fmtMoney(r.spentAmount)}</td>
                    <td className="px-3 py-2 text-gray-500">{fmtMoney(r.budgetAmount)}</td>
                    <td className="px-3 py-2 text-gray-500">{fmtDate(r.createdAt)}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs max-w-[160px] truncate">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add expense modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#166534]">Add Expense Record</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Period (e.g. April 2026)</label>
                <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="e.g. April 2026" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]">
                  <option value="">Select category...</option>
                  {['Petty Cash', 'Staffing', 'Food & Supplies', 'Maintenance', 'Transport', 'Activities', 'Medical', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount Spent (£)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A] resize-none" placeholder="Optional notes..." />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} disabled={saving || !period || !amount}
                  className="flex-1 text-white text-sm py-2 rounded-lg hover:opacity-90 transition-all bg-gradient-to-br from-green-700 to-green-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Record'}
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
