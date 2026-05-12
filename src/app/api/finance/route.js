import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { period, category, spentAmount, notes } = await req.json()
  if (!period || spentAmount == null) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const home = await prisma.home.findFirst({ where: { id: parseInt(session.user.homeId) } })

  const record = await prisma.finance.create({
    data: {
      homeId: parseInt(session.user.homeId),
      period,
      budgetAmount: home?.budgetAmount || 0,
      spentAmount: parseFloat(spentAmount),
      category: category || null,
      notes: notes || null,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'Finance', entityId: record.id, description: `Added finance record: ${category || 'General'} — £${spentAmount} for ${period}` })
  return NextResponse.json({ record })
}
