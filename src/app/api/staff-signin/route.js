import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { staffName, shiftType, homeId } = await req.json()
  if (!staffName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const record = await prisma.shiftRecord.create({
    data: {
      homeId: parseInt(homeId || session.user.homeId),
      staffName,
      shiftType: shiftType || null,
      clockIn: new Date(),
    },
  })

  await logAction({ session, action: 'CLOCK_IN', entity: 'ShiftRecord', entityId: record.id, description: `Staff clock-in: ${staffName}${shiftType ? ' (' + shiftType + ')' : ''}` })
  return NextResponse.json({ record })
}
