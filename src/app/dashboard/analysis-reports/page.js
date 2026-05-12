import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AnalysisClient from './AnalysisClient'

async function getData(homeId, companyId) {
  const homeWhere = homeId ? { homeId } : { home: { companyId } }
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return { label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 0) }
  }).reverse()

  const [incidentsByMonth, incidentsByType, youngPeople, staff, finances] = await Promise.all([
    Promise.all(months.map(m => prisma.incident.count({ where: { ...homeWhere, occurredAt: { gte: m.start, lte: m.end } } }))),
    prisma.incident.groupBy({ by: ['type'], where: homeWhere, _count: { id: true } }),
    prisma.youngPerson.findMany({ where: homeId ? { homeId } : { home: { companyId } }, select: { admissionDate: true } }),
    prisma.staff.findMany({ where: homeId ? { homeId } : { home: { companyId } }, select: { active: true, startDate: true, endDate: true } }),
    prisma.finance.findMany({ where: homeWhere, select: { spentAmount: true, budgetAmount: true, period: true, category: true } }),
  ])

  const activeYP = youngPeople.length
  const activeStaff = staff.filter(s => s.active).length
  const totalSpend = finances.reduce((a, f) => a + (f.spentAmount || 0), 0)
  const totalBudget = finances.reduce((a, f) => a + (f.budgetAmount || 0), 0)

  const spendByCategory = {}
  for (const f of finances) {
    const cat = f.category || 'Other'
    spendByCategory[cat] = (spendByCategory[cat] || 0) + (f.spentAmount || 0)
  }

  return {
    months: months.map((m, i) => ({ label: m.label, incidents: incidentsByMonth[i] })),
    incidentsByType: incidentsByType.map(r => ({ type: r.type, count: r._count.id })).sort((a, b) => b.count - a.count),
    summary: {
      totalIncidents: incidentsByMonth.reduce((a, b) => a + b, 0),
      activeYP,
      activeStaff,
      totalSpend,
      totalBudget,
    },
    spendByCategory: Object.entries(spendByCategory).map(([cat, total]) => ({ cat, total })).sort((a, b) => b.total - a.total),
  }
}

export default async function AnalysisReportsPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <AnalysisClient data={data} />
}
