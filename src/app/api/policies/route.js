import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, category, version, reviewDate, content } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const policy = await prisma.policy.create({
    data: {
      title,
      category: category || null,
      version: version || null,
      reviewDate: reviewDate ? new Date(reviewDate) : null,
      content,
      active: true,
    },
  })

  return NextResponse.json({ policy })
}
