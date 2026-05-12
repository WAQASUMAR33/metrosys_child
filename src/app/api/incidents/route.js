import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, type, description, severity, occurredAt, reportedBy } = await req.json()
  if (!title || !description || !occurredAt) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const incident = await prisma.incident.create({
    data: {
      homeId: parseInt(session.user.homeId),
      title,
      type: type || 'Other',
      description,
      severity: severity || 'Medium',
      occurredAt: new Date(occurredAt),
      reportedBy: reportedBy || null,
      status: 'Open',
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'Incident', entityId: incident.id, description: `Reported incident: ${title} (${type || 'Other'}, ${severity || 'Medium'})` })
  return NextResponse.json({ incident })
}
