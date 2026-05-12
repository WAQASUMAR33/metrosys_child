import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const checks = await prisma.roomCheck.findMany({
    where: { youngPersonId: parseInt(params.id) },
    orderBy: { dateOfEvent: 'desc' },
    select: {
      id: true, reason: true, dateOfEvent: true, startTime: true, endTime: true,
      locked: true, status: true, signedBy: true, createdAt: true, createdBy: true,
    },
  })
  return NextResponse.json({ checks })
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const ypId = parseInt(params.id)
  const userName = [`${session.user.firstName || ''}`, `${session.user.lastName || ''}`].join(' ').trim() || session.user.username

  const check = await prisma.roomCheck.create({
    data: {
      youngPersonId: ypId,
      homeId: parseInt(session.user.homeId),
      reason: body.reason || null,
      dateOfEvent: body.dateOfEvent ? new Date(body.dateOfEvent) : null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      youngPersonAgreed: body.youngPersonAgreed || null,
      policeInvolved: body.policeInvolved || null,
      searchDetails: body.searchDetails || null,
      actionsAndOutcome: body.actionsAndOutcome || null,
      sanctionsOrConsequences: body.sanctionsOrConsequences || null,
      monitoring: body.monitoring || null,
      comments: body.comments || null,
      documents: body.documents || null,
      linkedEvents: body.linkedEvents || null,
      requiredReadings: body.requiredReadings || null,
      taskNote: body.taskNote || null,
      recordViews: JSON.stringify([{ viewer: userName, viewedAt: new Date().toISOString() }]),
      unlockHistory: JSON.stringify([]),
      createdBy: userName,
      updatedBy: userName,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'RoomCheck', entityId: check.id, description: `Created room check for young person #${ypId}` })
  return NextResponse.json({ check })
}
