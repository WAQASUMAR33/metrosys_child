import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OperationsClient from './OperationsClient'

async function getData(companyId) {
  if (!companyId) return { homes: [] }

  const homes = await prisma.home.findMany({
    where: { companyId },
    include: {
      youngPeople: { select: { id: true, status: true } },
      beds: { select: { id: true, status: true, emptyDays: true } },
      staff: { select: { id: true, active: true } },
      incidents: {
        where: { occurredAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { id: true, status: true, severity: true },
      },
      finance: { select: { spentAmount: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      area: { select: { name: true } },
      region: { select: { name: true } },
    },
  })

  return {
    homes: homes.map((h) => {
      const activeYP = h.youngPeople.filter(y => y.status === 'Active').length
      const registeredBeds = h.beds.filter(b => b.status === 'REGISTERED' || b.status === 'OCCUPIED').length
      const vacantBeds = h.beds.filter(b => b.status === 'VACANT').length
      const longestEmpty = h.beds.filter(b => b.status === 'VACANT').reduce((max, b) => Math.max(max, b.emptyDays || 0), 0)
      const openIncidents = h.incidents.filter(i => i.status === 'Open').length
      const criticalIncidents = h.incidents.filter(i => i.severity === 'Critical').length
      const latestSpend = h.finance[0]?.spentAmount || 0
      const withinBudget = h.budgetAmount > 0 ? latestSpend <= h.budgetAmount : null

      return {
        id: h.id,
        name: h.name,
        area: h.area?.name || '',
        region: h.region?.name || '',
        registrationStatus: h.registrationStatus,
        rating: h.rating,
        lastInspectionDate: h.lastInspectionDate?.toISOString() || null,
        mothballed: h.mothballed,
        activeYP,
        registeredBeds,
        vacantBeds,
        longestEmpty,
        activeStaff: h.staff.filter(s => s.active).length,
        totalStaff: h.staff.length,
        openIncidents,
        criticalIncidents,
        withinBudget,
        budget: h.budgetAmount,
        latestSpend,
      }
    }),
  }
}

export default async function OperationsDashboardPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.companyId))
  return <OperationsClient data={data} />
}
