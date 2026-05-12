import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import HomeClient from './HomeClient'

async function getHomeData(homeId) {
  if (!homeId) return null

  const [youngPeople, calendarEvents, shiftPlans, youngPeopleMeetings, staffMeetings, tasks] =
    await Promise.all([
      prisma.youngPerson.findMany({
        where: { homeId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.calendarEvent.findMany({
        where: {
          homeId,
          startTime: { gte: new Date() },
          endTime: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { startTime: 'asc' },
        take: 20,
      }),
      prisma.calendarEvent.findMany({
        where: { homeId, eventType: 'SHIFT' },
        orderBy: { startTime: 'desc' },
        take: 20,
      }),
      prisma.calendarEvent.findMany({
        where: { homeId, eventType: 'YOUNG_PERSON_MEETING' },
        orderBy: { startTime: 'desc' },
        take: 20,
      }),
      prisma.calendarEvent.findMany({
        where: { homeId, eventType: 'STAFF_MEETING' },
        orderBy: { startTime: 'desc' },
        take: 20,
      }),
      prisma.document.findMany({
        where: { homeId, type: 'TASK' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const incidentsThisWeek = await prisma.incident.count({
    where: { homeId, occurredAt: { gte: weekAgo } },
  })

  const messages = await prisma.message.findMany({
    where: { receiver: { homeId } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { sender: { select: { firstName: true, lastName: true } } },
  })

  return {
    youngPeopleCount: youngPeople.length,
    incidentsThisWeek,
    messages: messages.map((m) => ({
      id: m.id,
      subject: m.subject,
      senderName: `${m.sender.firstName || ''} ${m.sender.lastName || ''}`.trim(),
      createdAt: m.createdAt.toISOString(),
      read: m.read,
    })),
    calendarEvents: calendarEvents.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
    })),
    shiftPlans: shiftPlans.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime.toISOString(),
    })),
    youngPeopleMeetings: youngPeopleMeetings.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime.toISOString(),
    })),
    staffMeetings: staffMeetings.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime.toISOString(),
    })),
    tasks: tasks.map((d) => ({
      id: d.id,
      title: d.title,
      dueDate: d.dueDate?.toISOString() || null,
      completed: !!d.completedAt,
    })),
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const data = await getHomeData(parseInt(session?.user?.homeId))

  return <HomeClient data={data} />
}
