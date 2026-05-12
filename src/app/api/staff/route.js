import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/audit'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = parseInt(session.user.companyId)
  const body = await req.json()
  const {
    firstName, lastName, role, contractType, hoursPerWeek,
    startDate, endDate, email, phone, dbsNumber, dbsExpiry,
    active, primaryHomeId, username, signingPin, lineManager,
    webAccess, hrAccessOnly,
  } = body

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 })
  }
  if (!primaryHomeId) {
    return NextResponse.json({ error: 'Primary home is required' }, { status: 400 })
  }

  // If username provided, create a linked user account
  let userId = null
  if (username && username.trim()) {
    const exists = await prisma.user.findUnique({ where: { username: username.trim() } })
    if (exists) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })

    const password = signingPin ? await bcrypt.hash(signingPin, 10) : await bcrypt.hash('changeme123', 10)
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password,
        role: hrAccessOnly ? 'STAFF_MEMBER' : 'STAFF_MEMBER',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email || null,
        companyId,
        homeId: parseInt(primaryHomeId),
        active: active !== false,
      },
    })
    userId = user.id
  }

  const staff = await prisma.staff.create({
    data: {
      homeId: parseInt(primaryHomeId),
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || null,
      contractType: contractType || null,
      hoursPerWeek: hoursPerWeek ? parseFloat(hoursPerWeek) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      email: email || null,
      phone: phone || null,
      dbsNumber: dbsNumber || null,
      dbsExpiry: dbsExpiry ? new Date(dbsExpiry) : null,
      active: active !== false,
    },
  })

  await logAction({ session, action: 'CREATE', entity: 'Staff', entityId: staff.id, description: `Added staff member: ${firstName} ${lastName}${role ? ' (' + role + ')' : ''}` })
  return NextResponse.json({ staff }, { status: 201 })
}
