import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ContactsClient from './ContactsClient'

async function getData(homeId, companyId) {
  const contacts = await prisma.contact.findMany({
    where: { companyId },
    include: { home: { select: { name: true } } },
    orderBy: { name: 'asc' },
  })

  return {
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      organisation: c.organisation,
      email: c.email,
      phone: c.phone,
      type: c.type,
      notes: c.notes,
      homeName: c.home?.name || null,
    })),
  }
}

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId), parseInt(session?.user?.companyId))
  return <ContactsClient data={data} companyId={parseInt(session?.user?.companyId)} homeId={parseInt(session?.user?.homeId)} />
}
