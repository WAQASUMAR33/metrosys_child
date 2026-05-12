import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, role, organisation, email, phone, type, notes, homeId, companyId } = await req.json()
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

  const contact = await prisma.contact.create({
    data: {
      name,
      role: role || null,
      organisation: organisation || null,
      email: email || null,
      phone: phone || null,
      type: type || 'Other',
      notes: notes || null,
      companyId: parseInt(companyId || session.user.companyId),
      homeId: homeId ? parseInt(homeId) : null,
    },
  })

  return NextResponse.json({ contact })
}
