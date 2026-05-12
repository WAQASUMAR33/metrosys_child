import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CalendarClient from './CalendarClient'

async function getData(homeId) {
  if (!homeId) return { events: [] }

  const events = await prisma.calendarEvent.findMany({
    where: { homeId },
    orderBy: { startTime: 'asc' },
  })

  return {
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      eventType: e.eventType,
    })),
    homeId,
  }
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId))
  return <CalendarClient data={data} />
}
