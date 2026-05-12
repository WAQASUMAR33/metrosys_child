import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await prisma.placementPlan.findMany({
    where: { youngPersonId: parseInt(params.id) },
    orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ plans })
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const plan = await prisma.placementPlan.create({
    data: {
      youngPersonId: parseInt(params.id),
      standard: body.standard || null,
      detail: body.detail || null,
      details: body.details || null,
      requiredActions: body.requiredActions || null,
      linkedTarget: body.linkedTarget || null,
      sort: body.sort ? parseInt(body.sort) : 1,
      reviewDate: body.reviewDate ? new Date(body.reviewDate) : null,
      status: body.status || 'Pending',
      keyworkerSigned: body.keyworkerSigned || null,
      createdBy: session.user.name || session.user.username || null,
      updatedBy: session.user.name || session.user.username || null,
    },
  })
  await logAction({ session, action: 'CREATE', entity: 'PlacementPlan', entityId: plan.id, description: `Created placement plan (${body.standard || 'No standard'}) for young person #${params.id}` })
  return NextResponse.json({ plan })
}
