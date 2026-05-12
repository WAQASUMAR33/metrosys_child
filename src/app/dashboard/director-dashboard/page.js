import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DirectorDashboardClient from './DirectorDashboardClient'

async function getDirectorData(groupBy) {
  const homes = await prisma.home.findMany({
    include: {
      youngPeople: { where: { status: 'Active' } },
      beds: true,
      staff: { where: { active: true } },
      documents: { where: { isCoreDoc: true } },
      area: true,
      region: true,
      finance: true,
    },
  })

  return homes.map((home) => {
    const registeredBeds = home.beds.filter((b) => b.status !== 'MOTHBALLED').length
    const occupiedBeds = home.beds.filter((b) => b.status === 'OCCUPIED').length
    const vacantBeds = registeredBeds - occupiedBeds
    const longestEmptyBed = home.beds
      .filter((b) => b.status === 'VACANT')
      .reduce((max, b) => Math.max(max, b.emptyDays || 0), 0)

    const totalBudget = home.finance.reduce((sum, f) => sum + f.budgetAmount, 0)
    const totalSpent = home.finance.reduce((sum, f) => sum + f.spentAmount, 0)
    const withinBudget = totalBudget === 0 ? null : totalSpent <= totalBudget

    const coreDocsCount = home.documents.filter((d) => d.completedAt !== null).length

    return {
      id: home.id,
      name: home.name,
      area: home.area?.name || null,
      region: home.region?.name || null,
      numberOfYoungPeople: home.youngPeople.length,
      numberOfRegisteredBeds: registeredBeds,
      numberOfVacantBeds: vacantBeds,
      lengthBedEmpty: longestEmptyBed,
      staffTurnOver: null,
      youngPeopleTurnOver: null,
      mothballed: home.mothballed,
      registrationStatus: home.registrationStatus,
      avgYoungPeopleViews: null,
      allCoreDocuments: coreDocsCount,
      reg40s: home.reg40s,
      rating: home.rating,
      lastInspectionDate: home.lastInspectionDate
        ? home.lastInspectionDate.toISOString().split('T')[0]
        : null,
      timeOnSystem: null,
      withinBudget,
    }
  })
}

export default async function DirectorDashboardPage({ searchParams }) {
  const session = await getServerSession(authOptions)
  const params = await searchParams
  const groupBy = params?.groupBy || null
  const homes = await getDirectorData(groupBy)

  return <DirectorDashboardClient homes={homes} />
}
