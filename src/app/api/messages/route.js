import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverId, subject, body } = await req.json()
  if (!receiverId || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const message = await prisma.message.create({
    data: {
      senderId: parseInt(session.user.id),
      receiverId: parseInt(receiverId),
      subject: subject || null,
      body,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'Message', entityId: message.id, description: `Sent message: ${subject || '(no subject)'}` })
  return NextResponse.json({ message })
}
