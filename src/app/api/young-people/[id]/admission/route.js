import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admission = await prisma.admission.findUnique({
    where: { youngPersonId: parseInt(params.id) },
  })
  return NextResponse.json({ admission })
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const ypId = parseInt(params.id)
  const userName = [`${session.user.firstName || ''}`, `${session.user.lastName || ''}`].join(' ').trim() || session.user.username

  const data = {
    visitsUndertaken:  body.visitsUndertaken  ?? undefined,
    consentByWhom:     body.consentByWhom     ?? undefined,
    youngPersonWishes: body.youngPersonWishes ?? undefined,
    itemsArrivedWith:  body.itemsArrivedWith  ?? undefined,
    planVisits:        body.planVisits        ?? undefined,
    planDocuments:     body.planDocuments     ?? undefined,
    bedroom:           body.bedroom           ?? undefined,
    fireProcedure:     body.fireProcedure     ?? undefined,
    planOther:         body.planOther         ?? undefined,
    updatedBy: userName,
  }

  const admission = await prisma.admission.upsert({
    where: { youngPersonId: ypId },
    create: { youngPersonId: ypId, ...data },
    update: data,
  })

  await logAction({ session, action: 'UPDATE', entity: 'Admission', entityId: ypId, description: `Updated admission record for young person #${ypId}` })
  return NextResponse.json({ admission })
}
