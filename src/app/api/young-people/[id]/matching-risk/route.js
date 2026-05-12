import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const record = await prisma.matchingRiskAssessment.findUnique({
    where: { youngPersonId: parseInt(params.id) },
  })
  return NextResponse.json({ record })
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const ypId = parseInt(params.id)
  const userName = [`${session.user.firstName || ''}`, `${session.user.lastName || ''}`].join(' ').trim() || session.user.username

  const dateFields = [
    'referralFormDate', 'discussionNotesDate', 'homeRiskDate', 'otherDate',
    'parentsDate', 'commissioningDate', 'socialWorkerDate', 'youngPersonDate',
    'ypAtHomeDate', 'teamManagerDate', 'serviceManagerDate', 'conversationsDate',
  ]

  const data = { updatedBy: userName }
  const textFields = [
    'longTermPlan', 'currentSupportNeeds', 'strengthsOfPlacement', 'potentialHome',
    'placingAuthority', 'referralFormNotes', 'referralFormDocUrl',
    'discussionNotes', 'discussionNotesDocUrl', 'homeRiskNotes', 'homeRiskDocUrl',
    'otherNotes', 'otherDocUrl', 'parentsNotes', 'parentsDocUrl',
    'commissioningNotes', 'commissioningDocUrl', 'socialWorkerNotes', 'socialWorkerDocUrl',
    'youngPersonNotes', 'youngPersonDocUrl', 'ypAtHomeNotes', 'ypAtHomeDocUrl',
    'teamManagerNotes', 'teamManagerDocUrl', 'serviceManagerNotes', 'serviceManagerDocUrl',
    'conversationsNotes', 'conversationsDocUrl', 'matchPdfUrl',
    'summary', 'reasonsForDecision', 'currentStatus',
  ]

  for (const f of textFields) {
    if (f in body) data[f] = body[f] ?? null
  }
  for (const f of dateFields) {
    if (f in body) data[f] = body[f] ? new Date(body[f]) : null
  }

  const record = await prisma.matchingRiskAssessment.upsert({
    where: { youngPersonId: ypId },
    create: { youngPersonId: ypId, ...data },
    update: data,
  })

  await logAction({ session, action: 'UPDATE', entity: 'MatchingRiskAssessment', entityId: ypId, description: `Updated matching & risk assessment for young person #${ypId}` })
  return NextResponse.json({ record })
}
