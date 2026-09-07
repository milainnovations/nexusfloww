import React, { useState } from 'react'
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { StatCard } from '../components/common/StatCard'
import { Badge } from '../components/common/Badge'
import { AttendanceTrendAreaChart } from '../components/analytics/AnalyticsCharts'

export const AttendancePage: React.FC = () => {
  const { user } = useAuth()
  const { students, markAttendanceBulk } = useErpData()

  const role = user?.role || 'Principal'
  const isStudentOrParent = role === 'Student' || role === 'Parent'
  const isTeacher = role === 'Teacher'

  const [selectedClass, setSelectedClass] = useState('Class 8-A')
  const [selectedSubject, setSelectedSubject] = useState('Mathematics')
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1 (08:30–09:15)')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  )

  // Attendance state map for the current class
  const classStudents = students.filter((s) => s.classGrade === selectedClass)
  const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>(() => {
    const map: Record<string, 'Present' | 'Absent' | 'Late'> = {}
    classStudents.forEach((s) => {
      map[s.rollNumber] = s.attendancePct >= 75 ? 'Present' : 'Absent'
    })
    return map
  })

  const [saveSuccess, setSaveSuccess] = useState(false)

  // Student specific data (Rahul Sharma)
  const studentRecord = students.find((s) => s.rollNumber === 'SCH-8A-01') || students[0]

  const handleToggle = (rollNumber: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceState((prev) => ({ ...prev, [rollNumber]: status }))
  }

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {}
    classStudents.forEach((s) => {
      updated[s.rollNumber] = 'Present'
    })
    setAttendanceState(updated)
  }

  const handleSaveAttendance = () => {
    const presentRolls = Object.entries(attendanceState)
      .filter(([_, status]) => status === 'Present' || status === 'Late')
      .map(([roll]) => roll)

    markAttendanceBulk(selectedClass, presentRolls)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  /* -------------------------------------------------------------
     STUDENT / PARENT ATTENDANCE RECORD VIEW
  ------------------------------------------------------------- */
  if (isStudentOrParent) {
    return (
      <div className="space-y-6 pb-12">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            STUDENT ATTENDANCE RECORD
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            My Attendance Record
          </h1>
          <p className="text-sm text-[#50685e]">
            Official attendance log for {studentRecord.name} ({studentRecord.classGrade} • Roll #{studentRecord.rollNumber}).
          </p>
        </div>

        {/* Attendance Score Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Overall Attendance Score"
            value={`${studentRecord.attendancePct}%`}
            subtext={`${studentRecord.classesPresent} of ${studentRecord.totalClasses} total periods attended`}
            icon={CalendarCheck}
            iconColor={studentRecord.attendancePct < 75 ? 'amber' : 'green'}
          />
          <StatCard
            label="Total Working Days"
            value="66 Days"
            subtext="Academic Session 2024–25"
            icon={Calendar}
            iconColor="green"
          />
          <StatCard
            label="Attendance Standing"
            value={studentRecord.attendancePct < 75 ? 'Warning (Low)' : 'Eligible for Exams'}
            subtext="Minimum 75% required by Board"
            icon={AlertTriangle}
            iconColor={studentRecord.attendancePct < 75 ? 'amber' : 'green'}
          />
        </div>

        {/* Subject-Wise Attendance Ledger */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
            <h3 className="font-editorial text-xl font-medium text-[#14241e]">
              Subject-Wise Attendance Breakdown
            </h3>
            <span className="text-xs text-[#71877e]">Session Term 1</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4">
              <div className="text-xs font-semibold text-[#71877e]">Mathematics</div>
              <div className="text-lg font-bold text-[#0e4b38] mt-1">90.5%</div>
              <div className="text-[11px] text-[#82968e]">19/21 periods present</div>
            </div>

            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4">
              <div className="text-xs font-semibold text-[#71877e]">General Science & Lab</div>
              <div className="text-lg font-bold text-[#0e4b38] mt-1">85.0%</div>
              <div className="text-[11px] text-[#82968e]">17/20 periods present</div>
            </div>

            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4">
              <div className="text-xs font-semibold text-[#71877e]">English Literature</div>
              <div className="text-lg font-bold text-[#b91c1c] mt-1">70.0%</div>
              <div className="text-[11px] text-[#82968e]">14/20 periods present (Low)</div>
            </div>

            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4">
              <div className="text-xs font-semibold text-[#71877e]">Social Studies</div>
              <div className="text-lg font-bold text-[#b91c1c] mt-1">73.3%</div>
              <div className="text-[11px] text-[#82968e]">11/15 periods present</div>
            </div>
          </div>
        </div>

        {/* Recent Absence Log */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
          <h3 className="font-editorial text-xl font-medium text-[#14241e]">
            Recent Absence & Leave History
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-[#edf3ef] p-3.5 bg-[#fcfdfc]">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fee2e2] text-[#b91c1c] font-bold">
                  <X className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold text-[#14241e]">02 Sep 2024 (Monday)</div>
                  <div className="text-[#71877e]">Reason: Medical Leave • Approved by Class Teacher</div>
                </div>
              </div>
              <Badge variant="neutral" size="sm">Excused</Badge>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#edf3ef] p-3.5 bg-[#fcfdfc]">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fef3c7] text-[#92400e] font-bold">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold text-[#14241e]">28 Aug 2024 (Wednesday)</div>
                  <div className="text-[#71877e]">Late Entry — Bus Delay (Route 04)</div>
                </div>
              </div>
              <Badge variant="amber" size="sm">Late Arrival</Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------------------------------------
     TEACHER & PRINCIPAL ATTENDANCE MARKING DESK
  ------------------------------------------------------------- */
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD ATTENDANCE DESK
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            Class Attendance Register
          </h1>
          <p className="text-sm text-[#50685e]">
            {isTeacher
              ? 'Mark and submit period attendance for your assigned class periods.'
              : 'Institutional daily attendance overview, period logs, and low-attendance alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllPresent}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#c5d8cd] bg-white px-4 py-2 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save & Submit Register</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-[#e8f6ed] border border-[#bbf7d0] p-4 text-xs font-semibold text-[#166534] animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-[#16a34a]" />
          <span>Attendance register for {selectedClass} ({selectedSubject}) has been submitted and synced with official school records.</span>
        </div>
      )}

      {/* Attendance Trend Chart */}
      <AttendanceTrendAreaChart title="Monthly Institutional Attendance Consistency & Benchmark" />

      {/* Selector Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:grid-cols-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#71877e] uppercase mb-1">
            Class & Section
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs font-medium text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
          >
            <option>Class 8-A</option>
            <option>Class 6-B</option>
            <option>Class 7-A</option>
            <option>Class 10-A</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#71877e] uppercase mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs font-medium text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
          >
            <option>Mathematics</option>
            <option>General Science</option>
            <option>English Literature</option>
            <option>Social Studies</option>
            <option>Computer Applications</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#71877e] uppercase mb-1">
            Period Slot
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs font-medium text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
          >
            <option>Period 1 (08:30–09:15)</option>
            <option>Period 2 (09:15–10:00)</option>
            <option>Period 3 (10:15–11:00)</option>
            <option>Period 4 (11:00–11:45)</option>
            <option>Period 5 (12:30–01:15)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#71877e] uppercase mb-1">
            Register Date
          </label>
          <input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs font-medium text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm">
        <div className="flex items-center justify-between border-b border-[#edf3ef] p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#14241e]">Class Roll:</span>
            <span className="rounded-full bg-[#e8f6ed] px-2.5 py-0.5 text-xs font-semibold text-[#0e4b38]">
              {classStudents.length} students enrolled in {selectedClass}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#71877e]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Present: {Object.values(attendanceState).filter(s => s === 'Present').length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Absent: {Object.values(attendanceState).filter(s => s === 'Absent').length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3 px-6">ROLL NUMBER</th>
                <th className="py-3 px-6">STUDENT NAME</th>
                <th className="py-3 px-6">GUARDIAN CONTACT</th>
                <th className="py-3 px-6">OVERALL ATTENDANCE</th>
                <th className="py-3 px-6 text-center">ATTENDANCE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef] text-xs">
              {classStudents.map((student) => {
                const currentStatus = attendanceState[student.rollNumber] || 'Present'

                return (
                  <tr key={student.id} className="hover:bg-[#f7faf8] transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#14241e]">
                      {student.rollNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#14241e]">{student.name}</div>
                      <div className="text-[11px] text-[#71877e]">{student.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[#14241e]">{student.guardianName}</div>
                      <div className="text-[11px] text-[#71877e]">{student.guardianPhone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-semibold ${
                          student.attendancePct < 75 ? 'text-[#b91c1c]' : 'text-[#0e4b38]'
                        }`}
                      >
                        {student.attendancePct}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggle(student.rollNumber, 'Present')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            currentStatus === 'Present'
                              ? 'bg-[#0e4b38] text-white shadow-2xs'
                              : 'bg-[#f0f5f2] text-[#485c54] hover:bg-[#e1ece5]'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(student.rollNumber, 'Late')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            currentStatus === 'Late'
                              ? 'bg-[#d97706] text-white shadow-2xs'
                              : 'bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]'
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(student.rollNumber, 'Absent')}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            currentStatus === 'Absent'
                              ? 'bg-[#b91c1c] text-white shadow-2xs'
                              : 'bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca]'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
