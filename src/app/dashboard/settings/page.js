import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

async function getData(userId, companyId) {
  const [user, company] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, username: true } }),
    prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, encryptionPin: true } }),
  ])
  return { user, company }
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.id), parseInt(session?.user?.companyId))
  return <SettingsClient data={data} />
}
