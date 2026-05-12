import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import HealthSafetyClient from './HealthSafetyClient'

async function getData(homeId, companyId) {
  const where = homeId ? { homeId } : { home: { companyId } }

  const incidents = await prisma.incident.findMany({
    where,
    include: { home: { select: { name: true } } },
    orderBy: { occurredAt: 'desc' },
  })

  return {
    incidents: incidents.map((inc) => ({
      id: inc.id,
      title: inc.title,
      type: inc.type,
      description: inc.description,
      severity: inc.severity,
      occurredAt: inc.occurredAt.toISOString(),
      reportedBy: inc.reportedBy,
      status: inc.status,
      signedOffBy: inc.signedOffBy,
      signedOffAt: inc.signedOffAt?.toISOString() || null,
      homeName: inc.home?.name || '',
    })),
  }
}

export default async function HealthSafetyPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <HealthSafetyClient data={data} userRole={session?.user?.role} userId={session?.user?.id} />
}
