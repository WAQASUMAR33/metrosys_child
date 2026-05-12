import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import VisitorSignInClient from './VisitorSignInClient'

async function getData(homeId) {
  if (!homeId) return { visitors: [], staffShifts: [] }

  const [visitors, staffShifts] = await Promise.all([
    prisma.visitorSignIn.findMany({
      where: { homeId },
      orderBy: { signInTime: 'desc' },
      take: 100,
    }),
    prisma.shiftRecord.findMany({
      where: { homeId },
      orderBy: { clockIn: 'desc' },
      take: 50,
    }),
  ])

  return {
    visitors: visitors.map((v) => ({
      id: v.id,
      visitorName: v.visitorName,
      purpose: v.purpose,
      signInTime: v.signInTime.toISOString(),
      signOutTime: v.signOutTime?.toISOString() || null,
    })),
    staffShifts: staffShifts.map((s) => ({
      id: s.id,
      staffName: s.staffName,
      shiftType: s.shiftType,
      clockIn: s.clockIn.toISOString(),
      clockOut: s.clockOut?.toISOString() || null,
    })),
    homeId,
  }
}

export default async function VisitorSignInPage() {
  const session = await getServerSession(authOptions)
  const data = await getData(parseInt(session?.user?.homeId))
  return <VisitorSignInClient data={data} />
}
