'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Search, Bell, LogOut, ChevronDown, Home } from 'lucide-react'
import { useState } from 'react'

const PAGE_TITLES = {
  '/dashboard/home': 'Home',
  '/dashboard/director-dashboard': 'Director Dashboard',
  '/dashboard/operations-dashboard': 'Operations Dashboard',
  '/dashboard/manager-dashboard': 'Manager Dashboard',
  '/dashboard/young-people': 'Young People',
  '/dashboard/messages': 'Messages',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/staff': 'Staff',
  '/dashboard/analysis-reports': 'Analysis & Reports',
  '/dashboard/contacts': 'Contacts',
  '/dashboard/hr': 'HR',
  '/dashboard/finance': 'Finance',
  '/dashboard/health-safety': 'Health & Safety',
  '/dashboard/visitor-signin': 'Visitor Sign In',
  '/dashboard/mentor-help': 'Help Centre',
  '/dashboard/policies': 'Policies & Procedures',
  '/dashboard/settings': 'Settings',
}

function roleLabel(role) {
  return role?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'User'
}

export default function DashboardTopBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showHomeMenu, setShowHomeMenu] = useState(false)

  const title = PAGE_TITLES[pathname] || 'Dashboard'
  const initials = [session?.user?.firstName, session?.user?.lastName]
    .filter(Boolean)
    .map(n => n[0])
    .join('') || session?.user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <header
      className="h-14 flex items-center px-5 gap-4 flex-shrink-0 z-20"
      style={{
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-gray-800 truncate">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg w-40 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
          />
        </div>

        {/* Home selector */}
        <div className="relative">
          <button
            onClick={() => setShowHomeMenu(!showHomeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <Home size={12} className="text-green-600" />
            <span className="max-w-[90px] truncate">{session?.user?.homeName || 'Training Home'}</span>
            <ChevronDown size={10} className="text-gray-400" />
          </button>
          {showHomeMenu && (
            <div
              className="absolute right-0 top-9 bg-white rounded-xl border border-gray-100 z-50 min-w-44 py-1.5"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            >
              <div className="text-xs text-gray-700 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg mx-1 font-medium">
                {session?.user?.homeName || 'Training Home'}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}
            >
              {initials}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-xs font-semibold text-gray-800 leading-none truncate max-w-[80px]">
                {session?.user?.firstName || session?.user?.name || 'User'}
              </p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                {roleLabel(session?.user?.role)}
              </p>
            </div>
            <ChevronDown size={11} className="text-gray-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-10 bg-white rounded-xl border border-gray-100 z-50 min-w-44 py-1.5"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-800">
                  {[session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(' ') || session?.user?.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{roleLabel(session?.user?.role)}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
