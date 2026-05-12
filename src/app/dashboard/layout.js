import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import DashboardTopBar from '@/components/DashboardTopBar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f8' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-auto p-1">
          {children}
        </main>
      </div>
    </div>
  )
}
