import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  LogOut,
  ChevronDown,
  Building2,
  Shield,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ChangePasswordModal } from '../common/ChangePasswordModal'

interface TopHeaderProps {
  onToggleSidebar: () => void
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, activeInstitution, institutions, setInstitution, switchRole } = useAuth()

  const [showTenantMenu, setShowTenantMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

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
    if (user?.role === 'Library Admin') return 'Library Admin Desk'
    if (user?.role === 'Student') return 'Student Desk'
    if (user?.role === 'Parent') return 'Parent Desk'
    return 'School Desk'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }



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
        {/* Interactive Role Identity Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-full border border-[#d6e3dc] bg-[#f7faf8] px-3 py-1.5 text-xs font-medium text-[#0e4b38] shadow-2xs hover:bg-[#eaf4ee] hover:border-[#0e4b38] transition-all"
            title="Click to switch demo role (Live RBAC)"
          >
            <Shield className="h-3.5 w-3.5 text-[#0e4b38]" />
            <span className="font-semibold">Role: {user?.role || 'Principal'}</span>
            <span className="rounded bg-[#e2ece6] px-1.5 py-0.5 text-[9px] font-bold text-[#0e4b38] uppercase">
              Switch ▾
            </span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-[#d6e3dc] bg-white p-2 shadow-bluke-dropdown z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-[#82968e] uppercase tracking-wider">
                Switch Role Persona (Test Data Isolation)
              </div>
              {[
                { role: 'Student' as const, name: 'Rahul Sharma (Class 8-A)', sub: 'Student Profile (SCH-8A-01)' },
                { role: 'Parent' as const, name: 'Mr. Suresh Sharma', sub: 'Parent of Rahul Sharma' },
                { role: 'Teacher' as const, name: 'Prof. Vikram Singh', sub: 'Mathematics Faculty & Class 8-A Teacher' },
                { role: 'Library Admin' as const, name: 'Mrs. Meenakshi Sundaram', sub: 'Central Library Head' },
                { role: 'Administration' as const, name: 'Mrs. Priya Desai', sub: 'Accounts & Administration Office' },
                { role: 'Principal' as const, name: 'Dr. Anita Sharma', sub: 'Executive Principal & Academic Head' },
                { role: 'Super Admin' as const, name: 'Dr. Rajesh Kumar', sub: 'Managing Director & System Admin' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchRole(item.role)
                    setShowRoleMenu(false)
                  }}
                  className={`flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    user?.role === item.role
                      ? 'bg-[#f4f8f5] text-[#0e4b38] font-semibold'
                      : 'text-[#485c54] hover:bg-[#f7faf8]'
                  }`}
                >
                  <div className="font-medium flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e2ece6] text-[#0e4b38] font-bold">
                      {item.role}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#71877e]">{item.sub}</div>
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
            onClick={() => setShowPasswordModal(true)}
            title="Change Account Password"
            className="rounded-lg p-2 text-[#71877e] hover:bg-[#eef5f1] hover:text-[#0e4b38] transition-colors"
          >
            <KeyRound className="h-4 w-4" />
          </button>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-2 text-[#71877e] hover:bg-[#fef2f2] hover:text-[#b91c1c] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal || !!user?.mustChangePassword}
        onClose={() => setShowPasswordModal(false)}
        isForced={!!user?.mustChangePassword}
      />
    </header>
  )
}
