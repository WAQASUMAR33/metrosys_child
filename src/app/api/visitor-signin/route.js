import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { visitorName, purpose, homeId } = await req.json()
  if (!visitorName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const record = await prisma.visitorSignIn.create({
    data: {
      homeId: parseInt(homeId || session.user.homeId),
      visitorName,
      purpose: purpose || null,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'VisitorSignIn', entityId: record.id, description: `Visitor signed in: ${visitorName}${purpose ? ' — ' + purpose : ''}` })
  return NextResponse.json({ record })
}
