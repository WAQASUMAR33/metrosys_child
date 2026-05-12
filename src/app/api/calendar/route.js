import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, eventType, startTime, endTime, description, homeId } = await req.json()
  if (!title || !startTime || !endTime) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const event = await prisma.calendarEvent.create({
    data: {
      homeId: parseInt(homeId || session.user.homeId),
      title,
      eventType: eventType || 'OTHER',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description: description || null,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'CalendarEvent', entityId: event.id, description: `Created calendar event: ${title}${eventType ? ' (' + eventType + ')' : ''}` })
  return NextResponse.json({ event })
}
