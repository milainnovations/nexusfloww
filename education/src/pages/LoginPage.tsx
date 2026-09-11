import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { UserProfile } from '../context/AuthContext'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('principal@demo.com')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('Principal')

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, selectedRole)
    navigate('/app/desk')
  }

  const quickRoles: {
    role: UserProfile['role']
    name: string
    designation: string
    email: string
  }[] = [
    {
      role: 'Principal',
      name: 'Dr. Anita Sharma',
      designation: 'Principal & Managerial Desk',
      email: 'principal@demo.com',
    },
    {
      role: 'Teacher',
      name: 'Prof. Vikram Singh',
      designation: 'Mathematics Teacher & Class Teacher 8-A',
      email: 'teacher@demo.com',
    },
    {
      role: 'Student',
      name: 'Rahul Sharma',
      designation: 'Class 8-A • Roll #SCH-8A-01',
      email: 'student@demo.com',
    },
    {
      role: 'Parent',
      name: 'Mr. Suresh Sharma',
      designation: 'Parent of Rahul Sharma (Class 8-A)',
      email: 'parent@demo.com',
    },
    {
      role: 'Library Admin',
      name: 'Mrs. Meenakshi Sundaram',
      designation: 'Head Librarian & Learning Resource Administrator',
      email: 'library@demo.com',
    },
    {
      role: 'Administration',
      name: 'Mrs. Priya Desai',
      designation: 'Head of Administration & Accounts Department',
      email: 'admin.office@demo.com',
    },
    {
      role: 'Super Admin',
      name: 'Dr. Rajesh Kumar',
      designation: 'Managing Director & System Administrator',
      email: 'admin@demo.com',
    },
  ]

  const handleQuickLogin = (roleItem: (typeof quickRoles)[0]) => {
    setSelectedRole(roleItem.role)
    setEmail(roleItem.email)
    login(roleItem.email, roleItem.role)
    navigate('/app/desk')
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* LEFT PANEL: Deep Botanical Green */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden dot-grid-dark px-8 py-10 text-white sm:px-12 lg:w-1/2 lg:px-16 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#061d15] via-transparent to-[#125641]/20" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white font-serif font-bold text-xl">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-xl font-semibold tracking-tight text-white leading-none">
              Greenwood
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#a3c2b5] uppercase mt-0.5">
              SCHOOL OFFICE
            </span>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="relative z-10 my-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#a7d7c2] backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
            ONE ORDERLY SCHOOL WORKSPACE
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[50px] font-normal leading-[1.12] text-white tracking-tight">
            The day-to-day work of a school, made clear.
          </h1>

          <p className="text-base text-[#bfd8cc] leading-relaxed font-light sm:text-lg">
            Attendance, assessments, fee collections, bus transport, and progress report cards—customized
            operationally for the Principal, Teachers, Students, and Parents.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 border-t border-white/15 pt-6">
          <div className="grid grid-cols-3 gap-4 text-xs font-medium text-[#d1e5dc]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span>CBSE / ICSE Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span>Multi-Role RBAC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span>Live Attendance Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form + 1-Click Role Switcher */}
      <div className="flex flex-1 flex-col justify-center px-8 py-10 sm:px-14 lg:w-1/2 lg:px-20 bg-[#fafcfb]">
        <div className="mx-auto w-full max-w-md space-y-7">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
              CAMPUS ACCESS PORTAL
            </div>
            <h2 className="font-editorial text-3xl font-medium text-[#14241e]">
              Sign in to School Office
            </h2>
            <p className="text-xs text-[#50685e]">
              Select a demo role below for 1-click instant login or enter your registered email.
            </p>
          </div>

          {/* 1-Click Quick Role Switcher Buttons */}
          <div className="space-y-2">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#82968e] flex items-center justify-between">
              <span>Quick Demo Sign-In (1-Click)</span>
              <span className="text-[9px] text-[#10b981] flex items-center gap-1 font-semibold">
                <Sparkles className="h-3 w-3" /> Ready
              </span>
            </div>

            <div className="space-y-2">
              {quickRoles.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item)}
                  className="group flex w-full items-center justify-between rounded-xl border border-[#d6e3dc] bg-white p-3 text-left shadow-2xs hover:border-[#0e4b38] hover:bg-[#f4f8f5] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ee] text-[#0e4b38] font-bold text-xs group-hover:bg-[#0e4b38] group-hover:text-white transition-colors">
                      {item.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14241e] flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="rounded bg-[#e2ece6] px-1.5 py-0.5 text-[10px] font-semibold text-[#0e4b38]">
                          {item.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#71877e]">{item.designation}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-1 group-hover:text-[#0e4b38] transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#edf3ef]" />
            <span className="bg-[#fafcfb] px-3 text-[11px] font-medium text-[#8fa39b] uppercase">
              Or Custom Sign In
            </span>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 pr-10 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa39b] hover:text-[#14241e]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#0e4b38] py-3 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all flex items-center justify-center gap-2"
            >
              <span>Enter School Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
