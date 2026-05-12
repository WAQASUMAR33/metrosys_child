import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import YoungPersonProfile from './YoungPersonProfile'

async function getYoungPerson(id) {
  const yp = await prisma.youngPerson.findUnique({
    where: { id: parseInt(id) },
    include: {
      home: { select: { name: true } },
      documents: { orderBy: { createdAt: 'desc' } },
      medications: { orderBy: { createdAt: 'desc' } },
    },
  })
  return yp
}

export default async function YoungPersonPage({ params }) {
  const session = await getServerSession(authOptions)
  const yp = await getYoungPerson(params.id)
  if (!yp) notFound()

  const data = {
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
    documents: yp.documents.map(d => ({
      id: d.id,
      title: d.title,
      type: d.type,
      completedAt: d.completedAt?.toISOString() || null,
      dueDate: d.dueDate?.toISOString() || null,
      isCoreDoc: d.isCoreDoc,
    })),
    medications: yp.medications.map(m => ({
      id: m.id,
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
      prescribedBy: m.prescribedBy,
      active: m.active,
      startDate: m.startDate?.toISOString() || null,
    })),
  }

  return <YoungPersonProfile yp={data} session={session?.user} />
}
