'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, BarChart2, Activity, Briefcase, Users, MessageSquare,
  Calendar, UserCog, TrendingUp, BookOpen, UserCircle, DollarSign,
  Shield, LogIn, HelpCircle, FileText, Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard/home', icon: Home },
  { label: 'Director Dashboard', href: '/dashboard/director-dashboard', icon: BarChart2 },
  { label: 'Operations', href: '/dashboard/operations-dashboard', icon: Activity },
  { label: 'Manager Dashboard', href: '/dashboard/manager-dashboard', icon: Briefcase },
  { label: 'Young People', href: '/dashboard/young-people', icon: Users },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { label: 'Staff', href: '/dashboard/staff', icon: UserCog },
  { label: 'Analysis & Reports', href: '/dashboard/analysis-reports', icon: TrendingUp },
  { label: 'Contacts', href: '/dashboard/contacts', icon: BookOpen },
  { label: 'HR', href: '/dashboard/hr', icon: UserCircle },
  { label: 'Finance', href: '/dashboard/finance', icon: DollarSign },
  { label: 'Health & Safety', href: '/dashboard/health-safety', icon: Shield },
  { label: 'Visitor Sign In', href: '/dashboard/visitor-signin', icon: LogIn },
  { label: 'Help', href: '/dashboard/mentor-help', icon: HelpCircle },
  { label: 'Policies', href: '/dashboard/policies', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-[210px] flex flex-col flex-shrink-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d2218 0%, #0f2d1e 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 2px 8px rgba(22,163,74,0.4)' }}
        >
          <span className="text-white font-black text-xs leading-none">RS</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Round Sys</p>
          <p className="text-[10px] leading-tight truncate" style={{ color: 'rgba(74,222,128,0.6)' }}>
            Children&apos;s Services
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 mx-2 my-0.5 rounded-lg text-[12.5px] font-medium transition-all duration-150"
              style={
                isActive
                  ? { background: 'rgba(74,222,128,0.13)', color: '#4ade80' }
                  : { color: 'rgba(200,210,200,0.7)' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.color = 'rgba(200,210,200,0.7)'
                }
              }}
            >
              <Icon
                size={14}
                style={{ flexShrink: 0, color: isActive ? '#4ade80' : 'rgba(150,170,150,0.8)' }}
              />
              <span className="leading-none truncate">{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#4ade80' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/10">
        <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Round Sys v2.0
        </p>
      </div>
    </aside>
  )
}
