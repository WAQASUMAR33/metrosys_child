import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    firstName, lastName, admissionDate, gender,
    dateOfBirth, photoUrl, longTermPlan, currentSupportNeeds, placement,
  } = await req.json()

  if (!firstName || !lastName) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const yp = await prisma.youngPerson.create({
    data: {
      homeId: parseInt(session.user.homeId),
      firstName,
      lastName,
      admissionDate: admissionDate ? new Date(admissionDate) : null,
      gender: gender || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      photoUrl: photoUrl || null,
      longTermPlan: longTermPlan || null,
      currentSupportNeeds: currentSupportNeeds || null,
      placement: placement || null,
      updatedBy: session.user.name || session.user.username || null,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'YoungPerson', entityId: yp.id, description: `Added young person: ${firstName} ${lastName}` })
  return NextResponse.json({ yp })
}
