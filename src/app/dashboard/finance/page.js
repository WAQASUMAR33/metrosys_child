import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import FinanceClient from './FinanceClient'

async function getData(homeId, companyId) {
  const where = homeId ? { homeId } : { home: { companyId } }

  const [records, homes] = await Promise.all([
    prisma.finance.findMany({
      where,
      include: { home: { select: { name: true, budgetAmount: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    homeId
      ? prisma.home.findMany({ where: { id: homeId }, select: { id: true, name: true, budgetAmount: true } })
      : prisma.home.findMany({ where: { companyId }, select: { id: true, name: true, budgetAmount: true } }),
  ])

  return {
    records: records.map((r) => ({
      id: r.id,
      homeId: r.homeId,
      homeName: r.home?.name || '',
      budgetAmount: r.home?.budgetAmount || 0,
      period: r.period,
      category: r.category,
      spentAmount: r.spentAmount,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
    })),
    homes: homes.map((h) => ({
      id: h.id,
      name: h.name,
      budgetAmount: h.budgetAmount,
    })),
  }
}

export default async function FinancePage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <FinanceClient data={data} />
}
