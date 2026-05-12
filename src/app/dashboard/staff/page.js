import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import StaffClient from './StaffClient'

async function getData(homeId, companyId) {
  const where = homeId ? { homeId } : { home: { companyId } }

  const [staff, shiftRecords, homes] = await Promise.all([
    prisma.staff.findMany({
      where,
      include: { home: { select: { name: true } } },
      orderBy: { firstName: 'asc' },
    }),
    prisma.shiftRecord.findMany({
      where: homeId ? { homeId } : { home: { companyId } },
      orderBy: { clockIn: 'desc' },
      take: 50,
    }),
    prisma.home.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  return {
    staff: staff.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      contractType: s.contractType,
      hoursPerWeek: s.hoursPerWeek,
      startDate: s.startDate?.toISOString() || null,
      endDate: s.endDate?.toISOString() || null,
      active: s.active,
      homeName: s.home?.name || '',
      email: s.email,
      phone: s.phone,
      dbsNumber: s.dbsNumber,
      dbsExpiry: s.dbsExpiry?.toISOString() || null,
      dbsStatus: s.dbsStatus,
    })),
    shiftRecords: shiftRecords.map((r) => ({
      id: r.id,
      staffName: r.staffName,
      clockIn: r.clockIn.toISOString(),
      clockOut: r.clockOut?.toISOString() || null,
      shiftType: r.shiftType,
    })),
    homes: homes.map(h => ({ id: h.id, name: h.name })),
  }
}

export default async function StaffPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <StaffClient data={data} />
}
