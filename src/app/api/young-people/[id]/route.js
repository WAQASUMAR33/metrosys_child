import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  const yp = await prisma.youngPerson.findUnique({
    where: { id },
    include: {
      home: { select: { name: true } },
      documents: { orderBy: { createdAt: 'desc' } },
      medications: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!yp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ yp })
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  const body = await req.json()

  const allowed = ['firstName', 'lastName', 'admissionDate', 'gender', 'dateOfBirth',
    'photoUrl', 'longTermPlan', 'currentSupportNeeds', 'placement']

  const data = {}
  for (const key of allowed) {
    if (key in body) {
      if ((key === 'admissionDate' || key === 'dateOfBirth') && body[key]) {
        data[key] = new Date(body[key])
      } else {
        data[key] = body[key] || null
      }
    }
  }
  data.updatedBy = session.user.name || session.user.username || null

  const yp = await prisma.youngPerson.update({ where: { id }, data })
  await logAction({ session, action: 'UPDATE', entity: 'YoungPerson', entityId: id, description: `Updated young person: ${yp.firstName} ${yp.lastName}` })
  return NextResponse.json({ yp })
}
