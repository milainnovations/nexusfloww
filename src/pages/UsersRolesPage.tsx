import React, { useState } from 'react'
import {
  Shield,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { Badge } from '../components/common/Badge'

export const UsersRolesPage: React.FC = () => {
  const { user, switchRole } = useAuth()
  const { usersList } = useErpData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const permissionsMatrix = [
    {
      module: 'Executive School Desk & Global Analytics',
      admin: true,
      principal: true,
      teacher: false,
      studentParent: false,
    },
    {
      module: 'Admissions & Student Registration (Add/Delete)',
      admin: true,
      principal: true,
      teacher: false,
      studentParent: false,
    },
    {
      module: 'Teacher & Staff Appointment & Class Assignment',
      admin: true,
      principal: true,
      teacher: false,
      studentParent: false,
    },
    {
      module: 'Daily Class Attendance Marking & Submissions',
      admin: true,
      principal: true,
      teacher: true,
      studentParent: false,
    },
    {
      module: 'Assessment Scheduling, Marks Entry & Auto-Grading',
      admin: true,
      principal: true,
      teacher: true,
      studentParent: false,
    },
    {
      module: 'Official Progress Report Card View & Print',
      admin: true,
      principal: true,
      teacher: true,
      studentParent: true,
    },
    {
      module: 'School Fee Invoicing, Collections & Dues Tracker',
      admin: true,
      principal: true,
      teacher: false,
      studentParent: false,
    },
    {
      module: 'Online School Fee Payment & Official Receipt Generator',
      admin: true,
      principal: true,
      teacher: false,
      studentParent: true,
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD ACCESS CONTROL & GOVERNANCE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            User Roles & Permissions
          </h1>
          <p className="text-sm text-[#50685e]">
            Operational role definitions for Super Admin, Principal, Teachers, Students, and Parents with instant profile simulator.
          </p>
        </div>
      </div>

      {/* User Profiles Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm">
        <div className="flex items-center justify-between border-b border-[#edf3ef] p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#14241e]">Configured System Personas:</span>
            <span className="rounded-full bg-[#e8f6ed] px-2.5 py-0.5 text-xs font-semibold text-[#0e4b38]">
              {filteredUsers.length} live accounts
            </span>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or role..."
              className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3.5 px-6">USER & EMAIL</th>
                <th className="py-3.5 px-6">ROLE IDENTITY</th>
                <th className="py-3.5 px-6">DESIGNATION / CONTEXT</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">SIMULATE LOGIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef]">
              {filteredUsers.map((u) => {
                const isCurrentActive = user?.role === u.role

                return (
                  <tr key={u.id} className="hover:bg-[#f7faf8] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#14241e]">{u.name}</div>
                      <div className="text-[11px] text-[#71877e]">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#eaf4ee] px-2.5 py-1 text-xs font-bold text-[#0e4b38]">
                        <Shield className="h-3.5 w-3.5" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#50685e]">{u.designation}</td>
                    <td className="py-4 px-6">
                      <Badge variant={u.status === 'Active' ? 'green' : 'neutral'} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => switchRole(u.role)}
                        className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          isCurrentActive
                            ? 'bg-[#0e4b38] text-white shadow-2xs font-bold'
                            : 'border border-[#c5d8cd] text-[#0e4b38] hover:bg-[#eef5f1]'
                        }`}
                      >
                        {isCurrentActive ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Active Now</span>
                          </>
                        ) : (
                          <>
                            <span>Switch to Role</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GOVERNANCE MATRIX
          </span>
          <h3 className="font-editorial text-xl font-medium text-[#14241e]">
            Role-Based Access Control (RBAC)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3 px-4">MODULE CAPABILITY</th>
                <th className="py-3 px-4 text-center">SUPER ADMIN</th>
                <th className="py-3 px-4 text-center">PRINCIPAL</th>
                <th className="py-3 px-4 text-center">TEACHER</th>
                <th className="py-3 px-4 text-center">STUDENT / PARENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef]">
              {permissionsMatrix.map((item) => (
                <tr key={item.module} className="hover:bg-[#fafcfb]">
                  <td className="py-3 px-4 font-medium text-[#14241e]">{item.module}</td>
                  <td className="py-3 px-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a] mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-[#9ca3af] mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.principal ? (
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a] mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-[#9ca3af] mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.teacher ? (
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a] mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-[#9ca3af] mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.studentParent ? (
                      <CheckCircle2 className="h-4 w-4 text-[#16a34a] mx-auto" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-[#9ca3af] mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
