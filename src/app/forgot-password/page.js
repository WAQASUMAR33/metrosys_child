'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #0d2218 0%, #0f2d1e 50%, #0d3320 100%)' }}
    >
      {/* Decorative */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(74,222,128,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(22,163,74,0.08) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: '0 4px 14px rgba(22,163,74,0.45)',
            }}
          >
            <span className="text-white font-black text-sm">RS</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Round Sys</p>
            <p className="text-green-400/60 text-xs">Children&apos;s Services</p>
          </div>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.2)' }}
        >
          {submitted ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(22,163,74,0.1)' }}
              >
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                If that username exists in our system, a password reset link has been sent to the associated email address.
              </p>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot password?</h2>
                <p className="text-sm text-gray-500">
                  Enter your username or email and we&apos;ll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your username or email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
                  style={{
                    background: 'linear-gradient(135deg, #166534, #16a34a)',
                    boxShadow: '0 4px 14px rgba(22,101,52,0.35)',
                  }}
                >
                  Send Reset Link
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors pt-1"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
