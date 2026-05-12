import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import HRClient from './HRClient'

async function getData(homeId, companyId) {
  const where = homeId ? { homeId } : { home: { companyId } }

  const [staff, trainingRecords] = await Promise.all([
    prisma.staff.findMany({
      where,
      include: { home: { select: { name: true } } },
      orderBy: { firstName: 'asc' },
    }),
    prisma.trainingRecord.findMany({
      where: homeId ? { homeId } : { home: { companyId } },
      include: { staff: { select: { firstName: true, lastName: true } } },
      orderBy: { expiresAt: 'asc' },
    }),
  ])

  return {
    staff: staff.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      role: s.role,
      homeName: s.home?.name || '',
      active: s.active,
      dbsNumber: s.dbsNumber,
      dbsExpiry: s.dbsExpiry?.toISOString() || null,
      dbsStatus: s.dbsStatus,
      startDate: s.startDate?.toISOString() || null,
      contractType: s.contractType,
    })),
    trainingRecords: trainingRecords.map((t) => ({
      id: t.id,
      staffId: t.staffId,
      staffName: `${t.staff.firstName} ${t.staff.lastName}`,
      trainingName: t.trainingName,
      completedAt: t.completedAt?.toISOString() || null,
      expiresAt: t.expiresAt?.toISOString() || null,
      status: t.status,
    })),
  }
}

export default async function HRPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <HRClient data={data} />
}
