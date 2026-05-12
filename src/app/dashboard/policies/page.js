import { prisma } from '@/lib/prisma'
import PoliciesClient from './PoliciesClient'

async function getData() {
  const policies = await prisma.policy.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  })

  return {
    policies: policies.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      version: p.version,
      reviewDate: p.reviewDate?.toISOString() || null,
      content: p.content,
      createdAt: p.createdAt.toISOString(),
    })),
  }
}

export default async function PoliciesPage() {
  const data = await getData()
  return <PoliciesClient data={data} />
}
