import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const check = await prisma.roomCheck.findUnique({ where: { id: parseInt(params.checkId) } })
  if (!check) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userName = [`${session.user.firstName || ''}`, `${session.user.lastName || ''}`].join(' ').trim() || session.user.username
  const views = JSON.parse(check.recordViews || '[]')
  views.push({ viewer: userName, viewedAt: new Date().toISOString() })
  await prisma.roomCheck.update({ where: { id: check.id }, data: { recordViews: JSON.stringify(views) } })

  return NextResponse.json({ check: { ...check, recordViews: JSON.stringify(views) } })
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = parseInt(params.checkId)
  const userName = [`${session.user.firstName || ''}`, `${session.user.lastName || ''}`].join(' ').trim() || session.user.username

  const data = { updatedBy: userName }
  const textFields = [
    'reason', 'startTime', 'endTime', 'youngPersonAgreed', 'policeInvolved',
    'searchDetails', 'actionsAndOutcome', 'sanctionsOrConsequences', 'monitoring',
    'comments', 'signedBy', 'documents', 'linkedEvents', 'requiredReadings',
    'taskNote', 'recordViews', 'unlockHistory', 'status',
  ]
  for (const f of textFields) { if (f in body) data[f] = body[f] ?? null }
  if ('dateOfEvent' in body) data.dateOfEvent = body.dateOfEvent ? new Date(body.dateOfEvent) : null
  if ('signedAt' in body) data.signedAt = body.signedAt ? new Date(body.signedAt) : null
  if ('locked' in body) data.locked = Boolean(body.locked)

  if (body.signedBy && !body._skipLockUpdate) {
    data.signedAt = new Date()
    const existing = await prisma.roomCheck.findUnique({ where: { id }, select: { unlockHistory: true } })
    const hist = JSON.parse(existing?.unlockHistory || '[]')
    hist.push({ action: 'Signed', by: userName, at: new Date().toISOString() })
    data.unlockHistory = JSON.stringify(hist)
  }

  const check = await prisma.roomCheck.update({ where: { id }, data })
  await logAction({ session, action: 'UPDATE', entity: 'RoomCheck', entityId: id, description: `Updated room check #${id}` })
  return NextResponse.json({ check })
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.roomCheck.delete({ where: { id: parseInt(params.checkId) } })
  await logAction({ session, action: 'DELETE', entity: 'RoomCheck', entityId: params.checkId, description: `Deleted room check #${params.checkId}` })
  return NextResponse.json({ ok: true })
}
