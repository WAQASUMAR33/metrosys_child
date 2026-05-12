import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import MessagesClient from './MessagesClient'

async function getData(userId, homeId, companyId) {
  userId = parseInt(userId)
  companyId = parseInt(companyId)

  const [received, sent, users] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
    prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: { receiver: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
    prisma.user.findMany({
      where: { companyId, active: true, id: { not: userId } },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: { firstName: 'asc' },
    }),
  ])

  const fmt = (m) => ({
    id: m.id,
    subject: m.subject,
    body: m.body,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  })

  return {
    received: received.map((m) => ({
      ...fmt(m),
      senderId: m.sender.id,
      senderName: `${m.sender.firstName || ''} ${m.sender.lastName || ''}`.trim(),
      senderRole: m.sender.role,
    })),
    sent: sent.map((m) => ({
      ...fmt(m),
      receiverId: m.receiver.id,
      receiverName: `${m.receiver.firstName || ''} ${m.receiver.lastName || ''}`.trim(),
    })),
    users: users.map((u) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      role: u.role,
    })),
  }
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(
    parseInt(session?.user?.id),
    parseInt(session?.user?.homeId),
    parseInt(session?.user?.companyId)
  )
  return <MessagesClient data={data} currentUserId={session?.user?.id} />
}
