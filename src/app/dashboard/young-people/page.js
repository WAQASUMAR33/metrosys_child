import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import YoungPeopleClient from './YoungPeopleClient'

async function getData(homeId, companyId) {
  const where = homeId ? { homeId } : { home: { companyId } }

  const youngPeople = await prisma.youngPerson.findMany({
    where,
    include: {
      home: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    youngPeople: youngPeople.map((yp) => ({
      id: yp.id,
      firstName: yp.firstName,
      lastName: yp.lastName,
      admissionDate: yp.admissionDate?.toISOString() || null,
      gender: yp.gender,
      dateOfBirth: yp.dateOfBirth?.toISOString() || null,
      photoUrl: yp.photoUrl,
      longTermPlan: yp.longTermPlan,
      currentSupportNeeds: yp.currentSupportNeeds,
      placement: yp.placement,
      createdAt: yp.createdAt?.toISOString() || null,
      updatedAt: yp.updatedAt?.toISOString() || null,
      updatedBy: yp.updatedBy,
      homeName: yp.home?.name || '',
    })),
  }
}

export default async function YoungPeoplePage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <YoungPeopleClient data={data} session={session?.user} />
}
