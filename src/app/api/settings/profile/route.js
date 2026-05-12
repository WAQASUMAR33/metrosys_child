import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { firstName, lastName, email, phone } = await req.json()

  const user = await prisma.user.update({
    where: { id: parseInt(session.user.id) },
    data: {
      firstName: firstName || null,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
    },
  })

  await logAction({ session, action: 'UPDATE', entity: 'User', entityId: session.user.id, description: `Updated profile: ${user.firstName || ''} ${user.lastName || ''}`.trim() })
  return NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName } })
}
