import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AuditLogClient from './AuditLogClient'

export default async function AuditLogPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return <AuditLogClient />
}
