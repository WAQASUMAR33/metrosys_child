import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const plan = await prisma.placementPlan.update({
    where: { id: parseInt(params.planId) },
    data: {
      standard: body.standard ?? undefined,
      detail: body.detail ?? undefined,
      details: body.details ?? undefined,
      requiredActions: body.requiredActions ?? undefined,
      linkedTarget: body.linkedTarget ?? undefined,
      sort: body.sort !== undefined ? parseInt(body.sort) : undefined,
      reviewDate: body.reviewDate ? new Date(body.reviewDate) : undefined,
      status: body.status ?? undefined,
      keyworkerSigned: body.keyworkerSigned ?? undefined,
      signedAt: body.signedAt ? new Date(body.signedAt) : undefined,
      updatedBy: session.user.name || session.user.username || null,
    },
  })
  const desc = body.signedAt
    ? `Signed placement plan #${params.planId} (keyworker: ${body.keyworkerSigned})`
    : `Updated placement plan #${params.planId}`
  await logAction({ session, action: body.signedAt ? 'SIGN' : 'UPDATE', entity: 'PlacementPlan', entityId: params.planId, description: desc })
  return NextResponse.json({ plan })
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.placementPlan.delete({ where: { id: parseInt(params.planId) } })
  await logAction({ session, action: 'DELETE', entity: 'PlacementPlan', entityId: params.planId, description: `Deleted placement plan #${params.planId}` })
  return NextResponse.json({ ok: true })
}
