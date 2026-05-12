import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const record = await prisma.shiftRecord.update({
    where: { id: parseInt(params.id) },
    data: { clockOut: new Date() },
  })

  await logAction({ session, action: 'CLOCK_OUT', entity: 'ShiftRecord', entityId: params.id, description: `Staff clock-out: ${record.staffName}` })
  return NextResponse.json({ record })
}
