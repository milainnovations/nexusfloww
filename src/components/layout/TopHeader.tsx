import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  LogOut,
  ChevronDown,
  Building2,
  Shield,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserProfile } from '../../context/AuthContext'

interface TopHeaderProps {
  onToggleSidebar: () => void
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, switchRole, activeInstitution, institutions, setInstitution } = useAuth()

  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showTenantMenu, setShowTenantMenu] = useState(false)

  // Map path to title
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/students')) return user?.role === 'Teacher' ? 'My Class Students' : 'Student Registry'
    if (path.includes('/faculty')) return 'Teachers & Staff'
    if (path.includes('/courses')) return 'Subjects & Curriculum'
    if (path.includes('/attendance')) return user?.role === 'Student' || user?.role === 'Parent' ? 'My Attendance Record' : 'Class Attendance'
    if (path.includes('/exams-grades')) return user?.role === 'Student' || user?.role === 'Parent' ? 'Progress Reports & Grades' : 'Exams & Progress Reports'
    if (path.includes('/timetable')) return 'School Timetable'
    if (path.includes('/fees')) return user?.role === 'Student' || user?.role === 'Parent' ? 'My School Fees & Receipts' : 'Fee Collection & Dues'
    if (path.includes('/hostel')) return 'Transport & Boarding'
    if (path.includes('/library')) return 'School Library'
    if (path.includes('/reports')) return 'Managerial Analytics'
    if (path.includes('/users-roles')) return 'User Roles & Access'
    if (path.includes('/settings')) return 'School Settings'
    
    if (user?.role === 'Principal') return 'Principal Desk'
    if (user?.role === 'Teacher') return 'Teacher Desk'
    if (user?.role === 'Student') return 'Student Desk'
    if (user?.role === 'Parent') return 'Parent Desk'
    return 'School Desk'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roles: { role: UserProfile['role']; label: string; desc: string }[] = [
    { role: 'Super Admin', label: 'Super Admin', desc: 'Central governance & full access' },
    { role: 'Principal', label: 'Principal', desc: 'Managerial oversight of school' },
    { role: 'Teacher', label: 'Teacher', desc: 'Assigned classes, subjects & exams' },
    { role: 'Student', label: 'Student', desc: 'Attendance, progress card & timetable' },
    { role: 'Parent', label: 'Parent', desc: 'Child progress, fees & notices' },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e5ebe7] bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: School Tenant & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-[#5e726b] hover:bg-[#f0f5f2] lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#7e948c] uppercase">
            <span>{user?.campusCode || 'GWIS'}</span>
            <span>/</span>
            <div className="relative">
              <button
                onClick={() => setShowTenantMenu(!showTenantMenu)}
                className="flex items-center gap-1 hover:text-[#0e4b38] transition-colors"
              >
                <span>{activeInstitution.split('(')[0]}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showTenantMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-[#e2ece6] bg-white p-2 shadow-bluke-dropdown z-50">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#82968e] uppercase tracking-wider">
                    Select School Campus
                  </div>
                  {institutions.map((inst) => (
                    <button
                      key={inst}
                      onClick={() => {
                        setInstitution(inst)
                        setShowTenantMenu(false)
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                        activeInstitution === inst
                          ? 'bg-[#f4f8f5] text-[#0e4b38] font-semibold'
                          : 'text-[#485c54] hover:bg-[#f7faf8]'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5 text-[#71877e]" />
                      <span className="truncate">{inst}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="font-editorial text-lg font-medium text-[#14241e] leading-tight">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right: Role Switcher, Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-full border border-[#d6e3dc] bg-[#f7faf8] px-3 py-1.5 text-xs font-medium text-[#0e4b38] hover:bg-[#ebf4ef] transition-colors shadow-2xs"
          >
            <Shield className="h-3.5 w-3.5 text-[#0e4b38]" />
            <span className="font-semibold">Role: {user?.role || 'Principal'}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-[#e2ece6] bg-white p-2 shadow-bluke-dropdown z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#82968e] uppercase tracking-wider flex items-center justify-between">
                <span>Switch Active Role</span>
                <span className="text-[9px] font-normal text-[#10b981] flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Live Simulator
                </span>
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role)
                    setShowRoleMenu(false)
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                    user?.role === r.role
                      ? 'bg-[#0e4b38] text-white font-medium'
                      : 'text-[#384c44] hover:bg-[#f3f7f4]'
                  }`}
                >
                  <UserCheck className={`h-4 w-4 mt-0.5 shrink-0 ${user?.role === r.role ? 'text-white' : 'text-[#71877e]'}`} />
                  <div>
                    <div className="font-semibold leading-tight">{r.label}</div>
                    <div className={`text-[10.5px] mt-0.5 ${user?.role === r.role ? 'text-emerald-100' : 'text-[#71877e]'}`}>
                      {r.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#e5ebe7]">
          <div className="hidden text-right md:block">
            <div className="text-xs font-semibold text-[#14241e] leading-tight">
              {user?.name || 'Dr. Anita Sharma'}
            </div>
            <div className="text-[11px] text-[#71877e]">
              {user?.role} {user?.assignedClass ? `• ${user.assignedClass}` : ''}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-xs font-bold text-[#14532d] shadow-2xs">
            {user?.avatarText || 'AS'}
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-2 text-[#71877e] hover:bg-[#fef2f2] hover:text-[#b91c1c] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
