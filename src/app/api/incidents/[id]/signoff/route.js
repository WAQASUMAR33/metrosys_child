import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  const userName = [`${session.user.firstName || ''}`, `${session.user.lastName || ''}`].join(' ').trim() || session.user.username

  const incident = await prisma.incident.update({
    where: { id },
    data: { status: 'Closed', signedOffBy: userName, signedOffAt: new Date() },
  })

  await logAction({ session, action: 'SIGN', entity: 'Incident', entityId: id, description: `Signed off incident: ${incident.title}` })
  return NextResponse.json({ incident })
}
