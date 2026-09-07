import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Calendar,
  CreditCard,
  Bus,
  Library,
  BarChart3,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useErpData } from '../../context/ErpDataContext'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation()
  const { user } = useAuth()
  const { attendanceWatchCount } = useErpData()

  const role = user?.role || 'Principal'

  // Build role-tailored navSections
  const getNavSections = () => {
    // 1. TEACHER VIEW
    if (role === 'Teacher') {
      return [
        {
          title: 'MY DESK',
          items: [
            {
              name: 'Teacher desk',
              path: '/app/desk',
              icon: LayoutDashboard,
            },
          ],
        },
        {
          title: 'CLASS WORKSPACE',
          items: [
            {
              name: 'My students (8-A)',
              path: '/app/students',
              icon: Users,
            },
            {
              name: 'Subjects & syllabus',
              path: '/app/courses',
              icon: BookOpen,
            },
            {
              name: 'Mark attendance',
              path: '/app/attendance',
              icon: CalendarCheck,
              badge: 'Daily',
            },
            {
              name: 'Conduct exams & marks',
              path: '/app/exams-grades',
              icon: Award,
            },
            {
              name: 'My teaching timetable',
              path: '/app/timetable',
              icon: Calendar,
            },
          ],
        },
        {
          title: 'RESOURCES',
          items: [
            {
              name: 'School library',
              path: '/app/library',
              icon: Library,
            },
            {
              name: 'Colleagues directory',
              path: '/app/faculty',
              icon: GraduationCap,
            },
          ],
        },
      ]
    }

    // 2. STUDENT & PARENT VIEW
    if (role === 'Student' || role === 'Parent') {
      const isParent = role === 'Parent'
      return [
        {
          title: isParent ? 'PARENT DESK' : 'STUDENT PORTAL',
          items: [
            {
              name: isParent ? 'Child overview' : 'My student desk',
              path: '/app/desk',
              icon: LayoutDashboard,
            },
          ],
        },
        {
          title: 'ACADEMICS',
          items: [
            {
              name: 'Progress report card',
              path: '/app/exams-grades',
              icon: Award,
              badge: 'Term 1',
            },
            {
              name: 'Attendance register',
              path: '/app/attendance',
              icon: CalendarCheck,
            },
            {
              name: 'Class timetable',
              path: '/app/timetable',
              icon: Calendar,
            },
            {
              name: 'Curriculum & subjects',
              path: '/app/courses',
              icon: BookOpen,
            },
          ],
        },
        {
          title: 'STUDENT SERVICES',
          items: [
            {
              name: 'School fees & receipts',
              path: '/app/fees',
              icon: CreditCard,
            },
            {
              name: 'Bus route & transport',
              path: '/app/hostel',
              icon: Bus,
            },
            {
              name: 'Library books',
              path: '/app/library',
              icon: Library,
            },
            {
              name: 'Class teachers',
              path: '/app/faculty',
              icon: GraduationCap,
            },
          ],
        },
      ]
    }

    // 3. LIBRARY ADMIN VIEW
    if (role === 'Library Admin') {
      return [
        {
          title: 'LIBRARY DESK',
          items: [
            {
              name: 'Library desk',
              path: '/app/desk',
              icon: LayoutDashboard,
            },
          ],
        },
        {
          title: 'LIBRARY OPERATIONS',
          items: [
            {
              name: 'Book catalog & ledger',
              path: '/app/library',
              icon: Library,
            },
          ],
        },
        {
          title: 'ACADEMIC DIRECTORIES',
          items: [
            {
              name: 'Students register',
              path: '/app/students',
              icon: Users,
            },
            {
              name: 'Teachers & staff',
              path: '/app/faculty',
              icon: GraduationCap,
            },
          ],
        },
      ]
    }

    // 4. PRINCIPAL & SUPER ADMIN VIEW (Managerial Oversight)
    return [
      {
        title: 'OVERVIEW',
        items: [
          {
            name: role === 'Principal' ? 'Principal desk' : 'School desk',
            path: '/app/desk',
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: 'ACADEMICS & ROSTER',
        items: [
          {
            name: 'Students register',
            path: '/app/students',
            icon: Users,
          },
          {
            name: 'Teachers & staff',
            path: '/app/faculty',
            icon: GraduationCap,
          },
          {
            name: 'Classes & curriculum',
            path: '/app/courses',
            icon: BookOpen,
          },
          {
            name: 'Attendance watch',
            path: '/app/attendance',
            icon: CalendarCheck,
            badge: attendanceWatchCount > 0 ? `${attendanceWatchCount} alert` : undefined,
          },
          {
            name: 'Exams & report cards',
            path: '/app/exams-grades',
            icon: Award,
          },
          {
            name: 'Master timetable',
            path: '/app/timetable',
            icon: Calendar,
          },
        ],
      },
      {
        title: 'ADMIN & OPERATIONS',
        items: [
          {
            name: 'Fee collections & dues',
            path: '/app/fees',
            icon: CreditCard,
          },
          {
            name: 'Transport & boarding',
            path: '/app/hostel',
            icon: Bus,
          },
          {
            name: 'Library repo',
            path: '/app/library',
            icon: Library,
          },
          {
            name: 'Managerial analytics',
            path: '/app/reports',
            icon: BarChart3,
          },
        ],
      },
      {
        title: 'GOVERNANCE',
        items: [
          {
            name: 'Staff roles & access',
            path: '/app/users-roles',
            icon: ShieldCheck,
          },
          {
            name: 'School settings',
            path: '/app/settings',
            icon: Settings,
          },
        ],
      },
    ]
  }

  const navSections = getNavSections()

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#e5ebe7] bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-[#f0f4f1]">
          <NavLink to="/app/desk" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0e4b38] text-white font-serif font-bold text-lg shadow-sm">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-lg font-semibold tracking-tight text-[#0f241c] leading-none">
                Greenwood
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-[#71877e] uppercase mt-0.5">
                SCHOOL OFFICE
              </span>
            </div>
          </NavLink>
        </div>

        {/* Role Identity Badge */}
        <div className="px-4 py-2.5 bg-[#f6faf7] border-b border-[#e5ebe7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-bold text-[#0e4b38] uppercase tracking-wider">
              {role === 'Principal' ? 'Principal Desk' : role}
            </span>
          </div>
          <span className="text-[10px] text-[#71877e] font-mono">
            {role === 'Student' || role === 'Parent' ? 'Class 8-A' : 'Session 24–25'}
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#82968e]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === '/app/desk' && location.pathname === '/app')

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-[13.5px] font-medium transition-all ${
                        isActive
                          ? 'bg-[#0e4b38] text-white font-semibold shadow-xs'
                          : 'text-[#485c54] hover:bg-[#f3f7f4] hover:text-[#0e4b38]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-white' : 'text-[#71877e] group-hover:text-[#0e4b38]'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#fef3c7] text-[#92400e]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Release / System Footer */}
        <div className="border-t border-[#f0f4f1] p-4 bg-[#fbfdfc]">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-[#71877e]">
              <p className="font-medium text-[#485c54]">Greenwood School ERP</p>
              <p className="text-[10px] text-[#95a8a0]">CBSE Affiliation #83042</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" title="System Online" />
          </div>
        </div>
      </aside>
    </>
  )
}
