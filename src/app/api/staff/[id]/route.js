import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/audit'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staffId = parseInt(params.id)
  if (isNaN(staffId)) return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 })

  const body = await req.json()
  const allowedFields = ['webAccess', 'active', 'hrAccessOnly', 'role', 'tier', 'email', 'phone', 'contractType', 'hoursPerWeek', 'lineManagerId']

  const updateData = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field]
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const staff = await prisma.staff.update({
    where: { id: staffId },
    data: updateData,
  })

  // Sync webAccess/active to linked user account if present
  if (staff.userId && (updateData.webAccess !== undefined || updateData.active !== undefined)) {
    const userUpdate = {}
    if (updateData.active !== undefined) userUpdate.active = updateData.active
    // webAccess=false disables web login; active=false disables the account entirely
    if (updateData.webAccess !== undefined) userUpdate.active = updateData.webAccess
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: staff.userId }, data: userUpdate })
    }
  }

  await logAction({
    session,
    action: 'UPDATE',
    entity: 'Staff',
    entityId: staff.id,
    description: `Updated staff ${staff.firstName} ${staff.lastName}: ${Object.keys(updateData).join(', ')}`,
  })

  return NextResponse.json({ staff })
}
