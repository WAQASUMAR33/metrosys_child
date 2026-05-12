'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { User, Eye, EyeOff, AlertCircle, ChevronRight, Lock, Shield, Users } from 'lucide-react'
import Link from 'next/link'

const ROLES = [
  {
    key: 'STAFF_MEMBER',
    label: 'Staff Member',
    desc: 'Care staff & support workers',
    icon: Users,
    color: '#16a34a',
  },
  {
    key: 'YOUNG_PERSON',
    label: 'Young Person',
    desc: 'Residents of the home',
    icon: User,
    color: '#0891b2',
  },
  {
    key: 'INSPECTOR',
    label: 'Inspector',
    desc: 'Ofsted & regulatory',
    icon: Shield,
    color: '#7c3aed',
  },
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('STAFF_MEMBER')
  const [encryptionPin, setEncryptionPin] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        username, password, encryptionPin, role: selectedRole, redirect: false,
      })
      if (result?.error) {
        setError(result.error === 'CredentialsSignin'
          ? 'Invalid credentials. Please check your details and try again.'
          : result.error)
      } else {
        window.location.href = '/dashboard/home'
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedRoleData = ROLES.find(r => r.key === selectedRole)

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f8' }}>
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex w-[420px] flex-shrink-0 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d2218 0%, #0f2d1e 40%, #0d3320 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }}
        />
        <div
          className="absolute bottom-32 -right-20 w-64 h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #16a34a, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }}
        />

        <div className="relative flex flex-col flex-1 p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                boxShadow: '0 4px 14px rgba(22,163,74,0.45)',
              }}
            >
              <span className="text-white font-black text-sm leading-none">RS</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Round Sys</p>
              <p className="text-green-400/60 text-xs leading-tight">Children&apos;s Services</p>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1">
            <h1 className="text-white font-bold text-3xl leading-tight mb-4">
              Care management,<br />
              <span style={{ color: '#4ade80' }}>simplified.</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-10">
              A comprehensive platform for residential care homes — incident management, compliance tracking, HR, and more.
            </p>

            {/* Feature list */}
            {[
              'Real-time incident logging & sign-off',
              'DBS & training compliance tracking',
              'Staff scheduling & visitor register',
              'Finance & budget management',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(74,222,128,0.15)' }}
                >
                  <ChevronRight size={10} style={{ color: '#4ade80' }} />
                </div>
                <span className="text-white/60 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Bottom tag */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/25 text-xs">
              Secure · UK-based · Role-based access control
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* Header */}
            <div className="mb-7">
              <div className="lg:hidden flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                >
                  <span className="text-white font-black text-xs">RS</span>
                </div>
                <span className="font-bold text-gray-800">Round Sys</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Sign in as
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((role) => {
                    const Icon = role.icon
                    const active = selectedRole === role.key
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setSelectedRole(role.key)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 text-center"
                        style={
                          active
                            ? {
                                borderColor: role.color,
                                background: `${role.color}0d`,
                              }
                            : {
                                borderColor: '#e5e7eb',
                                background: '#fafafa',
                              }
                        }
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: active ? `${role.color}18` : '#f3f4f6',
                          }}
                        >
                          <Icon size={15} style={{ color: active ? role.color : '#9ca3af' }} />
                        </div>
                        <span
                          className="text-[11px] font-semibold leading-tight"
                          style={{ color: active ? role.color : '#6b7280' }}
                        >
                          {role.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Encryption PIN */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Company Encryption PIN
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Enter company PIN"
                    value={encryptionPin}
                    onChange={(e) => setEncryptionPin(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? '#15803d'
                    : 'linear-gradient(135deg, #166534, #16a34a)',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(22,101,52,0.35)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Browser nav warning */}
          <div className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200/80 rounded-xl">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Do not use the browser back, forward, or refresh buttons. Only use the navigation within the app.
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Round Sys © {new Date().getFullYear()} · Secure platform for children&apos;s services
          </p>
        </div>
      </div>
    </div>
  )
}
