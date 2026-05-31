import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/audit'

const TIER_MAP = {
  'Director': 0, 'Operations Manager': 0, 'Super User': 0,
  'Registered Manager': 2, 'Home Manager': 2, 'Deputy Manager': 2,
  'Senior Support Worker': 5, 'Support Worker': 5,
  'Team Leader': 5, 'IRO': 5, 'Other': 5,
}

function tierFromRole(role) {
  return TIER_MAP[role] ?? 5
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = parseInt(session.user.companyId)
  const body = await req.json()
  const {
    firstName, lastName, role, contractType, hoursPerWeek,
    startDate, endDate, email, phone, dbsNumber, dbsExpiry,
    active, primaryHomeId, username, signingPin,
    lineManagerId, webAccess, hrAccessOnly, tier,
  } = body

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 })
  }
  if (!primaryHomeId) {
    return NextResponse.json({ error: 'Primary home is required' }, { status: 400 })
  }

  // Derive role enum from position + access flags
  function resolveUserRole() {
    if (hrAccessOnly) return 'STAFF_MEMBER'
    if (['Director'].includes(role)) return 'DIRECTOR'
    if (['Operations Manager'].includes(role)) return 'OPERATIONS'
    if (['Registered Manager', 'Home Manager', 'Deputy Manager'].includes(role)) return 'MANAGER'
    return 'STAFF_MEMBER'
  }

  let userId = null
  if (username?.trim()) {
    const exists = await prisma.user.findUnique({ where: { username: username.trim() } })
    if (exists) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })

    const hashed = signingPin
      ? await bcrypt.hash(signingPin, 10)
      : await bcrypt.hash('changeme123', 10)

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashed,
        role: resolveUserRole(),
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

  const computedTier = tier !== undefined ? parseInt(tier) : tierFromRole(role)

  const staff = await prisma.staff.create({
    data: {
      homeId: parseInt(primaryHomeId),
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || null,
      tier: computedTier,
      webAccess: webAccess !== false,
      hrAccessOnly: hrAccessOnly === true,
      lineManagerId: lineManagerId ? parseInt(lineManagerId) : null,
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

  await logAction({
    session,
    action: 'CREATE',
    entity: 'Staff',
    entityId: staff.id,
    description: `Added staff member: ${firstName} ${lastName}${role ? ' (' + role + ')' : ''}`,
  })

  return NextResponse.json({ staff }, { status: 201 })
}
