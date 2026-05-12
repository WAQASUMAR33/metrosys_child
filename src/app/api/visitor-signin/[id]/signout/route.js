import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const record = await prisma.visitorSignIn.update({
    where: { id: parseInt(params.id) },
    data: { signOutTime: new Date() },
  })

  await logAction({ session, action: 'SIGN_OUT', entity: 'VisitorSignIn', entityId: params.id, description: `Visitor signed out: ${record.visitorName}` })
  return NextResponse.json({ record })
}
