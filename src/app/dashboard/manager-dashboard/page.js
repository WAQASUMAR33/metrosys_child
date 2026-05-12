import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ManagerClient from './ManagerClient'

async function getData(homeId) {
  if (!homeId) return { incidents: [], staff: [], youngPeople: [], tasks: [] }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [incidents, staff, youngPeople, tasks, shiftRecords] = await Promise.all([
    prisma.incident.findMany({
      where: { homeId, status: 'Open' },
      orderBy: [{ severity: 'desc' }, { occurredAt: 'desc' }],
    }),
    prisma.staff.findMany({
      where: { homeId, active: true },
      include: { trainingRecords: { where: { expiresAt: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } } },
    }),
    prisma.youngPerson.findMany({
      where: { homeId },
      orderBy: { firstName: 'asc' },
    }),
    prisma.document.findMany({
      where: { homeId, type: 'TASK', completedAt: null },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),
    prisma.shiftRecord.findMany({
      where: { homeId, clockIn: { gte: weekAgo } },
      orderBy: { clockIn: 'desc' },
      take: 20,
    }),
  ])

  return {
    incidents: incidents.map(i => ({
      id: i.id, title: i.title, type: i.type, severity: i.severity,
      occurredAt: i.occurredAt.toISOString(), reportedBy: i.reportedBy, status: i.status,
    })),
    staff: staff.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      role: s.role,
      dbsExpiry: s.dbsExpiry?.toISOString() || null,
      trainingAlerts: s.trainingRecords.length,
    })),
    youngPeople: youngPeople.map(y => ({
      id: y.id,
      name: `${y.firstName} ${y.lastName}`,
      placement: y.placement,
    })),
    tasks: tasks.map(t => ({
      id: t.id, title: t.title, dueDate: t.dueDate?.toISOString() || null,
    })),
    shiftRecords: shiftRecords.map(r => ({
      id: r.id, staffName: r.staffName, shiftType: r.shiftType,
      clockIn: r.clockIn.toISOString(), clockOut: r.clockOut?.toISOString() || null,
    })),
  }
}

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId))
  return <ManagerClient data={data} userRole={session?.user?.role} />
}
