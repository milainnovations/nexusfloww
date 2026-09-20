import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  UserPlus,
  CalendarDays,
  ChevronRight,
  BookOpen,
  Award,
  Clock,
  Bus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Library,
  BookMarked,
  RotateCcw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { StatCard } from '../components/common/StatCard'
import { Modal } from '../components/common/Modal'
import { Drawer } from '../components/common/Drawer'
import { Badge } from '../components/common/Badge'
import { EnrolStudentModal } from '../components/common/EnrolStudentModal'
import {
  AcademicPerformanceBarChart,
  FeeCollectionDonutChart,
  AttendanceTrendAreaChart,
  SubjectRadarChart,
  GradeDistributionBarChart,
  StudentAttendanceVsPerformanceChart,
  TeacherClassStatusDonutChart,
  StudentTermProgressLineChart,
  TransportUtilizationBarChart,
} from '../components/analytics/AnalyticsCharts'
import {
  ExpenseCategoryBarChart,
  BudgetUtilisationDonutChart,
  FeeRecoveryTrendAreaChart,
  AdmissionsStatusDonutChart,
} from '../components/analytics/AnalyticsCharts'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Upload } from 'lucide-react'
import type { Student } from '../data/mockData'

/* ============================================================
   ATTENDANCE GENDER DASHBOARD — inline component
   Used only on the Principal / Super Admin desk
============================================================ */
const COLORS = {
  boysPresent: '#0e4b38',
  boysAbsent: '#d1e8de',
  girlsPresent: '#1d6b50',
  girlsAbsent: '#fde68a',
  classPresent: '#0e4b38',
  classAbsent: '#e2ece6',
}

function buildPieData(
  subset: Student[],
  label: string
): { name: string; value: number; color: string }[] {
  if (subset.length === 0) return []
  const totalPresent = subset.reduce((a, s) => a + s.classesPresent, 0)
  const totalClasses = subset.reduce((a, s) => a + s.totalClasses, 0)
  const totalAbsent = totalClasses - totalPresent
  const pct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0
  return [
    { name: `${label} Present (${pct}%)`, value: totalPresent, color: label === 'Boys' ? COLORS.boysPresent : COLORS.girlsPresent },
    { name: `${label} Absent`, value: Math.max(totalAbsent, 0), color: label === 'Boys' ? COLORS.boysAbsent : COLORS.girlsAbsent },
  ]
}

import type { PieLabelRenderProps } from 'recharts'

const CUSTOM_LABEL = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if (
    cx === undefined || cy === undefined || midAngle === undefined ||
    innerRadius === undefined || outerRadius === undefined || percent === undefined ||
    percent < 0.05
  ) return null
  const RADIAN = Math.PI / 180
  const radius = (Number(innerRadius) + Number(outerRadius)) * 0.5
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN)
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
      {`${(Number(percent) * 100).toFixed(0)}%`}
    </text>
  )
}

interface AttendanceGenderDashboardProps {
  students: Student[]
}

const AttendanceGenderDashboard: React.FC<AttendanceGenderDashboardProps> = ({ students }) => {
  const [selectedClass, setSelectedClass] = React.useState<string>('All Classes')

  const allClasses = ['All Classes', ...Array.from(new Set(students.map((s) => s.classGrade))).sort()]

  const filtered = selectedClass === 'All Classes'
    ? students
    : students.filter((s) => s.classGrade === selectedClass)

  const boys = filtered.filter((s) => s.gender === 'Male')
  const girls = filtered.filter((s) => s.gender === 'Female')

  // Chart 1: Boys + Girls combined donut (present vs absent split by gender)
  const combinedData = (() => {
    const boysPresent = boys.reduce((a, s) => a + s.classesPresent, 0)
    const girlsPresent = girls.reduce((a, s) => a + s.classesPresent, 0)
    const boysAbsent = boys.reduce((a, s) => a + (s.totalClasses - s.classesPresent), 0)
    const girlsAbsent = girls.reduce((a, s) => a + (s.totalClasses - s.classesPresent), 0)
    return [
      { name: 'Boys Present', value: boysPresent, color: '#0e4b38' },
      { name: 'Girls Present', value: girlsPresent, color: '#16a34a' },
      { name: 'Boys Absent', value: Math.max(boysAbsent, 0), color: '#c8dfd6' },
      { name: 'Girls Absent', value: Math.max(girlsAbsent, 0), color: '#fde68a' },
    ].filter((d) => d.value > 0)
  })()

  const totalCombinedClasses = filtered.reduce((a, s) => a + s.totalClasses, 0)
  const totalCombinedPresent = filtered.reduce((a, s) => a + s.classesPresent, 0)
  const overallPct = totalCombinedClasses > 0
    ? Math.round((totalCombinedPresent / totalCombinedClasses) * 100)
    : 0

  // Chart 2: Boys — overall + per class
  const boysClassData = (() => {
    if (selectedClass !== 'All Classes') return buildPieData(boys, 'Boys')
    const byClass = Array.from(new Set(boys.map((s) => s.classGrade))).sort()
    return byClass.map((cls, i) => {
      const group = boys.filter((s) => s.classGrade === cls)
      const present = group.reduce((a, s) => a + s.classesPresent, 0)
      const total = group.reduce((a, s) => a + s.totalClasses, 0)
      const shades = ['#0e4b38', '#145c47', '#1a7057', '#208568', '#279b7a']
      return { name: `${cls} (${total > 0 ? Math.round((present / total) * 100) : 0}%)`, value: present, color: shades[i % shades.length] }
    }).filter((d) => d.value > 0)
  })()

  const boysTotalPresent = boys.reduce((a, s) => a + s.classesPresent, 0)
  const boysTotalClasses = boys.reduce((a, s) => a + s.totalClasses, 0)
  const boysPct = boysTotalClasses > 0 ? Math.round((boysTotalPresent / boysTotalClasses) * 100) : 0

  // Chart 3: Girls — overall + per class
  const girlsClassData = (() => {
    if (selectedClass !== 'All Classes') return buildPieData(girls, 'Girls')
    const byClass = Array.from(new Set(girls.map((s) => s.classGrade))).sort()
    return byClass.map((cls, i) => {
      const group = girls.filter((s) => s.classGrade === cls)
      const present = group.reduce((a, s) => a + s.classesPresent, 0)
      const total = group.reduce((a, s) => a + s.totalClasses, 0)
      const shades = ['#7c3aed', '#6d28d9', '#5b21b6', '#9333ea', '#a855f7']
      return { name: `${cls} (${total > 0 ? Math.round((present / total) * 100) : 0}%)`, value: present, color: shades[i % shades.length] }
    }).filter((d) => d.value > 0)
  })()

  const girlsTotalPresent = girls.reduce((a, s) => a + s.classesPresent, 0)
  const girlsTotalClasses = girls.reduce((a, s) => a + s.totalClasses, 0)
  const girlsPct = girlsTotalClasses > 0 ? Math.round((girlsTotalPresent / girlsTotalClasses) * 100) : 0

  const tooltipStyle = {
    backgroundColor: '#fff', borderColor: '#c9dcd2',
    borderRadius: '12px', fontSize: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
  }

  return (
    <div className="space-y-5">
      {/* Header row with class filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            ATTENDANCE GENDER ANALYTICS
          </span>
          <h2 className="font-editorial text-2xl font-normal text-[#14241e]">
            Boys & Girls Attendance Breakdown
          </h2>
        </div>
        {/* Class dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-semibold text-[#50685e]">Filter by class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-xl border border-[#c9dcd2] bg-white px-3 py-2 text-xs font-medium text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden shadow-2xs"
          >
            {allClasses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 pie charts in a row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Chart 1 — Boys + Girls combined */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
          <div className="border-b border-[#edf3ef] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
              COMBINED VIEW
            </span>
            <h3 className="font-editorial text-base font-medium text-[#14241e]">
              {selectedClass === 'All Classes' ? 'All Classes — Boys & Girls' : `${selectedClass} — Boys & Girls`}
            </h3>
          </div>
          <div className="relative flex items-center justify-center" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={combinedData}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={78}
                  paddingAngle={3} dataKey="value"
                  labelLine={false}
                  label={CUSTOM_LABEL}
                >
                  {combinedData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: unknown) => [`${val} periods`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold uppercase text-[#7e948c]">Overall</span>
              <span className="font-editorial text-xl font-bold text-[#14241e]">{overallPct}%</span>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-1.5 pt-1">
            {combinedData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-[#14241e]">{item.name}</span>
                </div>
                <span className="font-bold text-[#14241e]">{item.value}</span>
              </div>
            ))}
          </div>
          {/* Summary row */}
          <div className="mt-2 flex justify-between rounded-xl bg-[#f4f8f5] px-3 py-2 text-[11px]">
            <span className="text-[#50685e]">Boys: <strong>{boys.length}</strong></span>
            <span className="text-[#50685e]">Girls: <strong>{girls.length}</strong></span>
            <span className="text-[#0e4b38] font-bold">Total: {filtered.length}</span>
          </div>
        </div>

        {/* Chart 2 — Boys */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
          <div className="border-b border-[#edf3ef] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
              BOYS ATTENDANCE
            </span>
            <h3 className="font-editorial text-base font-medium text-[#14241e]">
              {selectedClass === 'All Classes' ? 'Boys — Class-wise Breakdown' : `Boys — ${selectedClass}`}
            </h3>
          </div>
          {boys.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-[#82968e]">
              No male students in selection
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={boysClassData}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={78}
                      paddingAngle={3} dataKey="value"
                      labelLine={false}
                      label={CUSTOM_LABEL}
                    >
                      {boysClassData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: unknown) => [`${val} periods attended`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold uppercase text-[#7e948c]">Boys Avg</span>
                  <span className="font-editorial text-xl font-bold text-[#0e4b38]">{boysPct}%</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {boysClassData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-[#14241e] truncate max-w-[160px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#14241e] shrink-0 ml-2">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between rounded-xl bg-[#f4f8f5] px-3 py-2 text-[11px]">
                <span className="text-[#50685e]">{boys.length} male students</span>
                <span className={`font-bold ${boysPct < 75 ? 'text-[#b91c1c]' : 'text-[#0e4b38]'}`}>
                  {boysPct}% present
                </span>
              </div>
            </>
          )}
        </div>

        {/* Chart 3 — Girls */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
          <div className="border-b border-[#edf3ef] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
              GIRLS ATTENDANCE
            </span>
            <h3 className="font-editorial text-base font-medium text-[#14241e]">
              {selectedClass === 'All Classes' ? 'Girls — Class-wise Breakdown' : `Girls — ${selectedClass}`}
            </h3>
          </div>
          {girls.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-[#82968e]">
              No female students in selection
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={girlsClassData}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={78}
                      paddingAngle={3} dataKey="value"
                      labelLine={false}
                      label={CUSTOM_LABEL}
                    >
                      {girlsClassData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: unknown) => [`${val} periods attended`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold uppercase text-[#7e948c]">Girls Avg</span>
                  <span className="font-editorial text-xl font-bold text-[#7c3aed]">{girlsPct}%</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                {girlsClassData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-[#14241e] truncate max-w-[160px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#14241e] shrink-0 ml-2">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between rounded-xl bg-[#f4f8f5] px-3 py-2 text-[11px]">
                <span className="text-[#50685e]">{girls.length} female students</span>
                <span className={`font-bold ${girlsPct < 75 ? 'text-[#b91c1c]' : 'text-[#7c3aed]'}`}>
                  {girlsPct}% present
                </span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export const CampusDeskPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    students,
    timetableSlots,
    exams,
    invoices,
    libraryBooks,
    bookIssues,
    enrolledStudentsCount,
    facultyCount,
    totalFeesOutstanding,
    totalFeesCollected,
    attendanceWatchCount,
    lowAttendanceStudents,
    activeClassesCount,
    overdueCount,
    addInvoice,
    addExam,
    markInvoicePaid,
  } = useErpData()

  const role = user?.role || 'Principal'

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showEnrolModal, setShowEnrolModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false)

  // Enrol Form State
  // Handled by EnrolStudentModal component

  // Invoice Form State
  const [invStudentRoll, setInvStudentRoll] = useState(students[0]?.rollNumber || '')
  const [invAmount, setInvAmount] = useState('25000')
  const [invType, setInvType] = useState<
    'Term 1 Tuition Fee' | 'School Bus & Transport' | 'Annual Activity & Lab' | 'Uniform & Books Kit'
  >('Term 1 Tuition Fee')

  // Test Creation Form State (for Teacher)
  const [testName, setTestName] = useState('')
  const [testSubject, setTestSubject] = useState('Mathematics')
  const [testClass, setTestClass] = useState('Class 8-A')
  const [testDate, setTestDate] = useState('15 Oct 2024')
  const [testMarks, setTestMarks] = useState('50')

  // Formatting
  const formattedFees = `₹${totalFeesOutstanding.toLocaleString('en-IN')}`
  const formattedCollected = `₹${totalFeesCollected.toLocaleString('en-IN')}`

  const todayFormatted = new Date()
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase()

  // Resolve the logged-in student's record from the students list
  // Try matching by rollNumber first, then by email, then fall back to first student
  const currentStudent = (
    (user?.rollNumber ? students.find((s) => s.rollNumber === user.rollNumber) : null) ??
    (user?.email ? students.find((s) => s.email.toLowerCase() === user.email.toLowerCase()) : null) ??
    students[0]
  )
  const studentInvoices = invoices.filter((i) => i.studentRoll === currentStudent?.rollNumber)
  const pendingStudentInvoice = studentInvoices.find((i) => i.status === 'Pending' || i.status === 'Overdue')

  // Teacher specific schedule
  const teacherSchedule = timetableSlots.filter(
    (tt) => tt.day === 'Monday' && tt.teacher.includes('Vikram Singh')
  )

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    const st = students.find((s) => s.rollNumber === invStudentRoll)
    if (st) {
      addInvoice({
        studentRoll: st.rollNumber,
        studentName: st.name,
        classGrade: st.classGrade,
        amount: Number(invAmount),
        dueDate: '30 Sep 2024',
        status: 'Pending',
        feeType: invType,
      })
    }
    setShowInvoiceModal(false)
  }

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault()
    addExam({
      name: testName || `Class Test on ${testSubject}`,
      term: 'Unit Assessment',
      classGrade: testClass,
      subject: testSubject,
      date: testDate,
      maxMarks: Number(testMarks),
      conductedBy: user?.name || 'Prof. Vikram Singh',
      status: 'Scheduled',
      marksMap: {},
    })
    setShowTestModal(false)
    setTestName('')
  }

  const handlePayFeeSimulate = () => {
    if (pendingStudentInvoice) {
      markInvoicePaid(pendingStudentInvoice.id)
      setShowPaymentSuccessModal(true)
    }
  }

  /* -------------------------------------------------------------
     VIEW 1: TEACHER DASHBOARD
  ------------------------------------------------------------- */
  if (role === 'Teacher') {
    const teacherClass = user?.assignedClass || 'Class 8-A'
    const teacherClassStudents = students.filter((s) => s.classGrade === teacherClass)
    const teacherClassCount = teacherClassStudents.length > 0 ? teacherClassStudents.length : 5
    const teacherAvgAttendance = teacherClassStudents.length > 0
      ? (teacherClassStudents.reduce((acc, s) => acc + s.attendancePct, 0) / teacherClassStudents.length).toFixed(1)
      : '81.4'

    return (
      <div className="space-y-8 pb-12">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dfeae3] bg-[#f4f8f5] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b857a]">
                {todayFormatted} • ACADEMIC SESSION 2024–25
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#122b22] tracking-tight">
                Teacher Workspace: {user?.name || 'Prof. Vikram Singh'}
              </h1>
              <p className="text-sm text-[#50685e] leading-relaxed">
                Class Teacher of <strong>{teacherClass}</strong> • {user?.designation || 'Senior Mathematics & Computer Applications Faculty'}.
                Here is your teaching roster, scheduled periods, and assessment ledger.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/exams-grades')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0e4b38] bg-[#f0f7f3] px-4 py-2.5 text-xs font-semibold text-[#0e4b38] hover:bg-[#0e4b38] hover:text-white transition-all shrink-0 shadow-2xs"
              >
                <Upload className="h-4 w-4" />
                <span>+ Upload Class Marks (CSV)</span>
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-4 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
              >
                <Award className="h-4 w-4" />
                <span>+ Schedule Test / Exam</span>
              </button>
              <button
                onClick={() => navigate('/app/attendance')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d8cd] bg-white px-4 py-2.5 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all shrink-0"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Mark Attendance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Teacher KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Assigned Classes"
            value="3 Classes"
            subtext={`${teacherClass}, Class 9-B, Class 10-A`}
            icon={Users}
            iconColor="green"
          />
          <StatCard
            label="Subjects Teaching"
            value="2 Subjects"
            subtext="Mathematics & Computer Apps"
            icon={BookOpen}
            iconColor="green"
          />
          <StatCard
            label={`${teacherClass} Strength`}
            value={`${teacherClassCount} Students`}
            subtext={`Avg Attendance: ${teacherAvgAttendance}%`}
            icon={GraduationCap}
            iconColor="green"
          />
          <StatCard
            label="Exams / Tests"
            value={`${exams.length} Conducted`}
            subtext="1 Scheduled for next week"
            icon={Award}
            iconColor="amber"
          />
        </div>

        {/* Teacher Visual Analytics & Class Performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StudentAttendanceVsPerformanceChart title="Class 8-A Attendance vs Performance Correlation" />
          <TeacherClassStatusDonutChart title="Class 8-A Academic Standing Breakdown" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GradeDistributionBarChart title="Class 8-A Student Grade Distribution" />
          <AttendanceTrendAreaChart title="Class 8-A Attendance Trajectory (Term 1)" />
        </div>

        {/* Today's Teaching Schedule & Quick Class Action */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Schedule */}
          <div className="lg:col-span-2 space-y-4 rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                  TODAY'S TEACHING SCHEDULE
                </span>
                <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                  Monday Periods & Classrooms
                </h3>
              </div>
              <button
                onClick={() => navigate('/app/timetable')}
                className="text-xs font-semibold text-[#0e4b38] hover:underline flex items-center gap-1"
              >
                Full Week Timetable <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {teacherSchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 transition-all hover:border-[#cde0d5]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f6ed] text-[#0e4b38]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#14241e]">{slot.period}</div>
                      <div className="text-sm font-semibold text-[#0e4b38]">{slot.subjectName}</div>
                      <div className="text-[11px] text-[#71877e]">
                        {slot.classGrade} • {slot.room}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/app/attendance')}
                    className="rounded-lg bg-[#0e4b38] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#125641] transition-all"
                  >
                    Take Attendance
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Exams Conducted & Quick Marks Entry */}
          <div className="space-y-4 rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                  EXAMS & ASSESSMENTS
                </span>
                <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                  Active Gradebooks
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {exams.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-xl border border-[#edf3ef] p-3.5 hover:border-[#cde0d5] bg-[#fbfdfc] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14241e]">{ex.name}</span>
                    <Badge variant={ex.status === 'Evaluated' ? 'green' : 'amber'} size="sm">
                      {ex.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#71877e] mt-1">
                    {ex.classGrade} • {ex.subject} • Max Marks: {ex.maxMarks}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-[#82968e]">Date: {ex.date}</span>
                    <button
                      onClick={() => navigate('/app/exams-grades')}
                      className="text-xs font-semibold text-[#0e4b38] hover:underline"
                    >
                      Enter / Edit Marks →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Schedule Test */}
        <Modal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          title="Schedule New Test / Examination"
          subtitle="Set up an assessment for your assigned class and subject."
        >
          <form onSubmit={handleCreateTest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">
                Test / Exam Title
              </label>
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. Unit Test 3 — Linear Equations"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#14241e] mb-1">Class</label>
                <select
                  value={testClass}
                  onChange={(e) => setTestClass(e.target.value)}
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                >
                  <option>Class 8-A</option>
                  <option>Class 9-B</option>
                  <option>Class 10-A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14241e] mb-1">Subject</label>
                <select
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                >
                  <option>Mathematics</option>
                  <option>Computer Applications</option>
                  <option>General Science</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#14241e] mb-1">Exam Date</label>
                <input
                  type="text"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14241e] mb-1">Max Marks</label>
                <input
                  type="number"
                  value={testMarks}
                  onChange={(e) => setTestMarks(e.target.value)}
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
              >
                Create Assessment
              </button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }

  /* -------------------------------------------------------------
     VIEW 2: STUDENT & PARENT DASHBOARD
  ------------------------------------------------------------- */
  if (role === 'Student' || role === 'Parent') {
    const isParent = role === 'Parent'

    return (
      <div className="space-y-8 pb-12">
        {/* Student/Parent Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dfeae3] bg-[#f4f8f5] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b857a]">
                {todayFormatted} • GREENWOOD ACADEMIC PORTAL
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#122b22] tracking-tight">
                {isParent ? `Parent Portal: ${currentStudent?.name ?? 'Student'}` : `Welcome back, ${currentStudent?.name ?? user?.name ?? 'Student'}`}
              </h1>
              <p className="text-sm text-[#50685e] leading-relaxed">
                <strong>{currentStudent?.classGrade ?? 'N/A'}</strong> • Roll No: <strong>{currentStudent?.rollNumber ?? 'N/A'}</strong> • Class Teacher:{' '}
                <strong>Prof. Vikram Singh</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/exams-grades')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-4 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
              >
                <Award className="h-4 w-4" />
                <span>View Term Report Card</span>
              </button>
              <button
                onClick={() => navigate('/app/timetable')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d8cd] bg-white px-4 py-2.5 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all shrink-0"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Class Timetable</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Attendance Score"
            value={`${currentStudent.attendancePct}%`}
            subtext={`${currentStudent.classesPresent} of ${currentStudent.totalClasses} periods present`}
            icon={CalendarCheck}
            iconColor={currentStudent.attendancePct < 75 ? 'amber' : 'green'}
          />
          <StatCard
            label="Term 1 Percentage"
            value={`${currentStudent.termPercentage}%`}
            subtext={`Overall Grade: ${currentStudent.overallGrade} (Distinction)`}
            icon={Award}
            iconColor="green"
          />
          <StatCard
            label="School Fee Dues"
            value={pendingStudentInvoice ? `₹${pendingStudentInvoice.amount.toLocaleString('en-IN')}` : '₹0 Dues'}
            subtext={pendingStudentInvoice ? `Due: ${pendingStudentInvoice.dueDate}` : 'All fees settled'}
            icon={CreditCard}
            iconColor={pendingStudentInvoice ? 'amber' : 'green'}
          />
          <StatCard
            label="School Transport"
            value={currentStudent?.busRoute ? currentStudent.busRoute.replace(/Bus Route (\d+).*/, 'Route $1') : 'Day Scholar'}
            subtext={currentStudent?.busRoute || 'Private / Day Scholar'}
            icon={Bus}
            iconColor="green"
          />
        </div>

        {/* Visual Insights: Subject Proficiency Map & Monthly Attendance Trend */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubjectRadarChart title={isParent ? `${currentStudent?.name ?? 'Your ward'}'s Subject Proficiency Map vs Class Average` : "My Subject Proficiency Radar Map"} />
          <AttendanceTrendAreaChart title={isParent ? `${currentStudent?.name ?? 'Your ward'}'s Attendance Consistency Record` : "My Attendance Trajectory"} />
        </div>

        <StudentTermProgressLineChart title={isParent ? `${currentStudent?.name ?? 'Your ward'}'s Multi-Term Score Progression & Growth` : "My Multi-Term Score Growth & Class Comparison"} />

        {/* Academic Details & Fee Payment Card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Progress & Subject Performance */}
          <div className="lg:col-span-2 space-y-4 rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                  TERM 1 ACADEMIC SCORECARD
                </span>
                <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                  Subject-Wise Performance
                </h3>
              </div>
              <button
                onClick={() => navigate('/app/exams-grades')}
                className="text-xs font-semibold text-[#0e4b38] hover:underline flex items-center gap-1"
              >
                Print Official Report Card <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Mathematics */}
                <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71877e]">Mathematics</span>
                    <span className="text-xs font-bold text-[#0e4b38]">88 / 100 (A2)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                    <div className="h-full bg-[#0e4b38] rounded-full" style={{ width: '88%' }} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10.5px]">
                    <span className="text-[#82968e]">Teacher: Prof. Vikram Singh</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#16a34a]">
                      <TrendingUp className="h-3 w-3" /> +6.0% Improvement
                    </span>
                  </div>
                </div>

                {/* General Science */}
                <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71877e]">General Science</span>
                    <span className="text-xs font-bold text-[#0e4b38]">84 / 100 (A2)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                    <div className="h-full bg-[#0e4b38] rounded-full" style={{ width: '84%' }} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10.5px]">
                    <span className="text-[#82968e]">Teacher: Dr. Priya Patel</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#d97706]">
                      <TrendingDown className="h-3 w-3" /> -2.0% Digression
                    </span>
                  </div>
                </div>

                {/* English Literature */}
                <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71877e]">English Literature</span>
                    <span className="text-xs font-bold text-[#0e4b38]">92 / 100 (A1)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                    <div className="h-full bg-[#0e4b38] rounded-full" style={{ width: '92%' }} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10.5px]">
                    <span className="text-[#82968e]">Teacher: Mrs. Sunita Rao</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#16a34a]">
                      <TrendingUp className="h-3 w-3" /> +4.0% Improvement
                    </span>
                  </div>
                </div>

                {/* Social Studies */}
                <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#71877e]">Social Studies</span>
                    <span className="text-xs font-bold text-[#0e4b38]">78 / 100 (B1)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                    <div className="h-full bg-[#0e4b38] rounded-full" style={{ width: '78%' }} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10.5px]">
                    <span className="text-[#82968e]">Teacher: Mr. Arjun Verma</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#16a34a]">
                      <TrendingUp className="h-3 w-3" /> +6.0% Improvement
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks Box */}
              <div className="rounded-xl bg-[#f0f7f3] border border-[#d3e8dc] p-4">
                <div className="text-xs font-bold text-[#0e4b38]">Class Teacher's Term Remark:</div>
                <div className="text-xs text-[#2e473c] mt-1 italic">
                  "{currentStudent.remarks}"
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Fee Status & Online Pay */}
          <div className="space-y-4 rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                    FEES & CLEARANCE
                  </span>
                  <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                    School Fee Status
                  </h3>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {pendingStudentInvoice ? (
                  <div className="rounded-xl border border-[#fbd5d5] bg-[#fff8f8] p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#991b1b]">{pendingStudentInvoice.feeType}</span>
                      <span className="font-mono font-bold text-[#991b1b]">
                        ₹{pendingStudentInvoice.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7f1d1d] mt-1">
                      Due by: {pendingStudentInvoice.dueDate} • Invoice #{pendingStudentInvoice.invoiceNumber}
                    </div>

                    <button
                      onClick={handlePayFeeSimulate}
                      className="mt-4 w-full rounded-xl bg-[#0e4b38] py-2.5 text-xs font-bold text-white shadow-bluke-md hover:bg-[#125641] transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Pay Online via UPI / Card</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-[#16a34a] mx-auto mb-2" />
                    <div className="text-xs font-bold text-[#14532d]">All Term Fees Cleared</div>
                    <div className="text-[11px] text-[#166534] mt-1">
                      No pending dues for Academic Session 2024–25.
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="text-xs font-semibold text-[#14241e] mb-2">Issued Library Books:</div>
                  <div className="rounded-lg border border-[#edf3ef] bg-[#fafcfb] p-3 text-xs">
                    <div className="font-medium text-[#14241e]">Oxford Illustrated Science Encyclopedia</div>
                    <div className="text-[10px] text-[#71877e]">Return Due: 28 Sep 2024 • Shelf A-02</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/fees')}
              className="w-full text-center text-xs font-semibold text-[#0e4b38] hover:underline pt-2 border-t border-[#edf3ef]"
            >
              View Complete Fee Receipts & History →
            </button>
          </div>
        </div>

        {/* Modal: Payment Success */}
        <Modal
          isOpen={showPaymentSuccessModal}
          onClose={() => setShowPaymentSuccessModal(false)}
          title="Fee Payment Successful!"
          subtitle="Your payment receipt has been registered with the Greenwood School Accounts."
        >
          <div className="text-center py-4 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7] text-[#15803d] mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <div className="text-base font-bold text-[#14241e]">Payment of ₹25,000 Received</div>
              <div className="text-xs text-[#50685e] mt-1">
                Transaction Ref: <strong>TXN-GWIS-2024-{Date.now().toString().slice(-6)}</strong>
              </div>
            </div>

            <div className="rounded-xl bg-[#f8faf9] p-4 text-left text-xs space-y-1.5 border border-[#edf3ef]">
              <div className="flex justify-between">
                <span className="text-[#71877e]">Student:</span>
                <span className="font-semibold text-[#14241e]">{currentStudent?.name ?? user?.name ?? 'Student'} ({currentStudent?.classGrade ?? 'N/A'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71877e]">Fee Component:</span>
                <span className="font-semibold text-[#14241e]">Annual Activity & Lab</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71877e]">Date:</span>
                <span className="font-semibold text-[#14241e]">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentSuccessModal(false)}
              className="w-full rounded-xl bg-[#0e4b38] py-2.5 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Close & Download Receipt
            </button>
          </div>
        </Modal>
      </div>
    )
  }

  /* -------------------------------------------------------------
     VIEW 2.3: LIBRARY ADMIN DESK
  ------------------------------------------------------------- */
  if (role === 'Library Admin') {
    const totalTitles = libraryBooks.length
    const totalCopies = libraryBooks.reduce((acc, b) => acc + b.totalCopies, 0)
    const copiesAvailable = libraryBooks.reduce((acc, b) => acc + b.copiesAvailable, 0)
    const activeIssues = bookIssues.filter((i) => i.status === 'Issued')
    const overdueBooks = bookIssues.filter((i) => i.status === 'Overdue')

    return (
      <div className="space-y-8 pb-12">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dfeae3] bg-[#f4f8f5] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b857a]">
                {todayFormatted} • GREENWOOD LIBRARY ADMINISTRATION
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#122b22] tracking-tight">
                Library Desk: {user?.name || 'Mrs. Meenakshi Sundaram'}
              </h1>
              <p className="text-sm text-[#50685e] leading-relaxed">
                Book catalog management, issue & return ledger, overdue tracking, and student library records — your complete library workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/library')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
              >
                <Library className="h-4 w-4" />
                <span>Open Book Catalog</span>
              </button>
              <button
                onClick={() => navigate('/app/students')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d8cd] bg-white px-5 py-2.5 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all shrink-0"
              >
                <Users className="h-4 w-4" />
                <span>Students Register</span>
              </button>
            </div>
          </div>
        </div>

        {/* Library KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Book Titles"
            value={totalTitles}
            subtext={`${totalCopies} total copies in catalog`}
            icon={BookOpen}
            iconColor="green"
          />
          <StatCard
            label="Copies Available"
            value={copiesAvailable}
            subtext={`${totalCopies - copiesAvailable} currently issued`}
            icon={Library}
            iconColor="green"
          />
          <StatCard
            label="Active Issued Books"
            value={activeIssues.length}
            subtext="Books currently with students"
            icon={BookMarked}
            iconColor="green"
          />
          <StatCard
            label="Overdue Returns"
            value={overdueBooks.length}
            subtext="Books past their return date"
            icon={AlertTriangle}
            iconColor={overdueBooks.length > 0 ? 'amber' : 'green'}
          />
        </div>

        {/* Recent Issues & Overdue Books */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Issues */}
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">ISSUE LEDGER</span>
                <h3 className="font-editorial text-xl font-medium text-[#14241e]">Active Issued Books</h3>
              </div>
              <button
                onClick={() => navigate('/app/library')}
                className="text-xs font-semibold text-[#0e4b38] hover:underline flex items-center gap-1"
              >
                Full ledger <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {activeIssues.length === 0 ? (
                <div className="text-xs text-[#82968e] text-center py-4">No active issues at the moment.</div>
              ) : (
                activeIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-3.5">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#14241e] truncate max-w-[220px]">{issue.bookTitle}</div>
                      <div className="text-[11px] text-[#71877e]">
                        {issue.studentName} • {issue.classGrade}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-semibold text-[#0e4b38]">Due: {issue.dueDate}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue Books */}
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">OVERDUE ALERT</span>
                <h3 className="font-editorial text-xl font-medium text-[#14241e]">Overdue Returns</h3>
              </div>
              <button
                onClick={() => navigate('/app/library')}
                className="text-xs font-semibold text-[#0e4b38] hover:underline flex items-center gap-1"
              >
                Manage <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {overdueBooks.length === 0 ? (
                <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-[#16a34a] mx-auto mb-1" />
                  <div className="text-xs font-bold text-[#14532d]">No overdue books!</div>
                  <div className="text-[11px] text-[#166534]">All issued books are within return date.</div>
                </div>
              ) : (
                overdueBooks.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between rounded-xl border border-[#fbd5d5] bg-[#fff8f8] p-3.5">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#991b1b] truncate max-w-[220px]">{issue.bookTitle}</div>
                      <div className="text-[11px] text-[#7f1d1d]">
                        {issue.studentName} • {issue.classGrade}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-[#b91c1c]">
                        {issue.fineAmount > 0 ? `Fine: ₹${issue.fineAmount}` : `Due: ${issue.dueDate}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Book Catalog Quick View */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#edf3ef] p-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">BOOK CATALOG</span>
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">Library Inventory at a Glance</h3>
            </div>
            <button
              onClick={() => navigate('/app/library')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641] transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Manage Catalog</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                  <th className="py-3.5 px-5">TITLE</th>
                  <th className="py-3.5 px-5">AUTHOR</th>
                  <th className="py-3.5 px-5">CATEGORY</th>
                  <th className="py-3.5 px-5">SHELF</th>
                  <th className="py-3.5 px-5 text-center">AVAILABLE</th>
                  <th className="py-3.5 px-5 text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3ef]">
                {libraryBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#f7faf8] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#14241e] max-w-[220px] truncate">{book.title}</div>
                    </td>
                    <td className="py-3.5 px-5 text-[#50685e]">{book.author}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center rounded-lg bg-[#eaf4ee] px-2 py-0.5 text-[10px] font-semibold text-[#0e4b38]">
                        {book.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-[#71877e]">{book.shelfLocation}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`font-bold text-sm ${book.copiesAvailable === 0 ? 'text-[#b91c1c]' : 'text-[#0e4b38]'}`}>
                        {book.copiesAvailable}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-medium text-[#50685e]">{book.totalCopies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">SHORTCUTS</span>
            <h3 className="font-editorial text-xl font-medium text-[#14241e]">Quick library actions</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { label: 'Issue Book to Student', subtext: 'Record a new book loan', icon: BookMarked, path: '/app/library' },
              { label: 'Process Book Return', subtext: 'Mark a returned book & clear fine', icon: RotateCcw, path: '/app/library' },
              { label: 'Students Register', subtext: 'Look up student details for issuing', icon: Users, path: '/app/students' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group flex items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-4 text-left shadow-2xs transition-all hover:border-[#cde0d5] hover:bg-[#fafcfb]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f7f3] text-[#0e4b38]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14241e]">{action.label}</div>
                      <div className="text-[11px] text-[#71877e]">{action.subtext}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-1 transition-transform" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------------------------------------
     VIEW 2.5: ADMINISTRATION DASHBOARD
  ------------------------------------------------------------- */
  if (role === 'Administration') {
    const totalBudget = 8080000
    const totalSpent = 6608000
    const budgetUtilPct = Math.round((totalSpent / totalBudget) * 100)

    return (
      <div className="space-y-8 pb-12">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dfeae3] bg-[#f4f8f5] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b857a]">
                {todayFormatted} • GREENWOOD ADMINISTRATION OFFICE
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#122b22] tracking-tight">
                Administration Desk: {user?.name || 'Mrs. Priya Desai'}
              </h1>
              <p className="text-sm text-[#50685e] leading-relaxed">
                School accounts, fee collections, expense approvals, and admissions pipeline — your complete finance & admin workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/administration')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
              >
                <Briefcase className="h-4 w-4" />
                <span>Open Admin Panel</span>
              </button>
              <button
                onClick={() => navigate('/app/fees')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d8cd] bg-white px-5 py-2.5 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all shrink-0"
              >
                <CreditCard className="h-4 w-4" />
                <span>Fee Collections</span>
              </button>
            </div>
          </div>
        </div>

        {/* Administration KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Budget Utilisation"
            value={`${budgetUtilPct}%`}
            subtext={`₹${(totalSpent / 100000).toFixed(1)}L of ₹${(totalBudget / 100000).toFixed(1)}L annual budget`}
            icon={TrendingUp}
            iconColor={budgetUtilPct > 90 ? 'amber' : 'green'}
          />
          <StatCard
            label="Fee Revenue Collected"
            value={formattedCollected}
            subtext={`${overdueCount} pending/overdue invoices`}
            icon={CreditCard}
            iconColor="green"
          />
          <StatCard
            label="Outstanding Fee Dues"
            value={formattedFees}
            subtext={`${students.filter(s => s.dues > 0).length} students with pending dues`}
            icon={AlertTriangle}
            iconColor="amber"
          />
          <StatCard
            label="Enrolled Students"
            value={enrolledStudentsCount}
            subtext={`${activeClassesCount} active class sections`}
            icon={Users}
            iconColor="green"
          />
        </div>

        {/* Admin Visual Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExpenseCategoryBarChart title="Expenditure by Department vs Budget" />
          <BudgetUtilisationDonutChart title="Annual Budget Utilisation by Category" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FeeCollectionDonutChart title="Term Fee Recovery & Settlement Breakdown" />
          <AdmissionsStatusDonutChart title="Admissions Applications Pipeline" />
        </div>

        <FeeRecoveryTrendAreaChart title="Monthly Fee Collection & Outstanding Dues Trend" />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">QUICK ACTIONS</span>
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">Common admin tasks</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Log New Expense', subtext: 'Record a school expenditure for approval', icon: Briefcase, path: '/app/administration' },
                { label: 'Issue Fee Invoice', subtext: 'Raise a term fee bill against a student', icon: CreditCard, path: '/app/fees' },
                { label: 'New Admission Application', subtext: 'Register a new applicant to the pipeline', icon: Users, path: '/app/administration' },
                { label: 'View Managerial Reports', subtext: 'Academic & financial analytics dashboard', icon: TrendingUp, path: '/app/reports' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="group flex w-full items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-4 text-left shadow-2xs transition-all hover:border-[#cde0d5] hover:bg-[#fafcfb]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f7f3] text-[#0e4b38]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#14241e]">{action.label}</div>
                        <div className="text-[11px] text-[#71877e]">{action.subtext}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-1 transition-transform" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Students with Fee Dues */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">FEE ALERTS</span>
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">Dues to follow up</h3>
            </div>
            <div className="space-y-2.5">
              {students
                .filter((s) => s.dues > 0)
                .sort((a, b) => b.dues - a.dues)
                .slice(0, 5)
                .map((student) => (
                  <div
                    key={student.id}
                    onClick={() => navigate('/app/fees')}
                    className="flex items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-3.5 shadow-2xs cursor-pointer hover:border-[#cde0d5] hover:bg-[#fafcfb] transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#14241e]">{student.name}</div>
                      <div className="text-[11px] text-[#71877e]">{student.classGrade} • {student.rollNumber}</div>
                    </div>
                    <span className="rounded-lg border border-[#fbd5d5] bg-[#fef2f2] px-2.5 py-1 text-xs font-bold text-[#b91c1c]">
                      ₹{(student.dues / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              <button
                onClick={() => navigate('/app/administration')}
                className="w-full text-center text-xs font-semibold text-[#0e4b38] hover:underline py-2"
              >
                View full dues register →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------------------------------------
     VIEW 3: PRINCIPAL & SUPER ADMIN (MANAGERIAL DESK)
  ------------------------------------------------------------- */
  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO BANNER CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-[#dfeae3] bg-[#f4f8f5] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b857a]">
              {todayFormatted} • GREENWOOD SCHOOL MANAGEMENT
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#122b22] tracking-tight">
              {role === 'Principal' ? 'Principal Command Center' : 'School work, made clear.'}
            </h1>
            <p className="text-sm text-[#50685e] leading-relaxed">
              Dr. Anita Sharma, these are the live school records that need your attention—active classes,
              teacher allocations, fee collections, and student attendance watch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEnrolModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Enrol Student</span>
            </button>
            <button
              onClick={() => navigate('/app/reports')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d8cd] bg-white px-5 py-2.5 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all shrink-0"
            >
              <span>Managerial reports</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE REGISTER / School at a glance */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            LIVE SCHOOL REGISTER
          </span>
          <h2 className="font-editorial text-2xl font-normal text-[#14241e]">
            School at a glance
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Enrolled students"
            value={enrolledStudentsCount}
            subtext={`${activeClassesCount} Active Class Sections (6th–10th)`}
            icon={Users}
            iconColor="green"
          />
          <StatCard
            label="Teachers & staff"
            value={facultyCount}
            subtext="4 Active teaching faculties"
            icon={GraduationCap}
            iconColor="green"
          />
          <StatCard
            label="School fees outstanding"
            value={formattedFees}
            subtext={`₹${formattedCollected} collected this term`}
            icon={CreditCard}
            iconColor="green"
          />
          <StatCard
            label="Attendance watch"
            value={attendanceWatchCount}
            subtext="Students currently below 75%"
            icon={AlertTriangle}
            iconColor="amber"
          />
        </div>
      </div>

      {/* MANAGERIAL EXECUTIVE VISUAL ANALYTICS */}
      <div className="space-y-6">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            EXECUTIVE DASHBOARD ANALYTICS
          </span>
          <h2 className="font-editorial text-2xl font-normal text-[#14241e]">
            Academic Benchmarks & Financial Trajectory
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AcademicPerformanceBarChart title="Class Academic Performance & Pass Rate Comparison" />
          <FeeCollectionDonutChart title="Term 1 Fee Recovery & Collection Clearance" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AttendanceTrendAreaChart title="School-Wide Monthly Attendance Compliance & Stability" />
          <TransportUtilizationBarChart title="School Bus Fleet Seating Occupancy & Route Utilization" />
        </div>
      </div>

      {/* ATTENDANCE GENDER DASHBOARD */}
      <AttendanceGenderDashboard students={students} />

      {/* 3. EXCEPTIONS & SHORTCUTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Needs attention (Attendance Exceptions) */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                EXCEPTIONS
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                Needs attention
              </h3>
            </div>
            <button
              onClick={() => navigate('/app/attendance')}
              className="text-xs font-semibold text-[#0e4b38] hover:underline"
            >
              Review attendance
            </button>
          </div>

          <div className="space-y-2.5">
            {lowAttendanceStudents.slice(0, 5).map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="group flex items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-3.5 shadow-2xs transition-all hover:border-[#cde0d5] hover:bg-[#fafcfb] cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-[#14241e] group-hover:text-[#0e4b38] transition-colors">
                    {student.name}
                  </div>
                  <div className="text-xs text-[#71877e]">
                    {student.classGrade} • {student.rollNumber} • {student.classesPresent}/{student.totalClasses} classes present
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-lg border border-[#fbd5d5] bg-[#fef2f2] px-2.5 py-1 text-xs font-bold text-[#b91c1c]">
                    {student.attendancePct}%
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Shortcuts & Common desk work */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
              SHORTCUTS
            </span>
            <h3 className="font-editorial text-xl font-medium text-[#14241e]">
              Common desk work
            </h3>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/app/attendance')}
              className="group flex w-full items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-4 text-left shadow-2xs transition-all hover:border-[#cde0d5] hover:bg-[#fafcfb]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f7f3] text-[#0e4b38]">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#14241e]">Mark Class Attendance</div>
                  <div className="text-[11px] text-[#71877e]">Open today's period register</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowEnrolModal(true)}
              className="group flex w-full items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-4 text-left shadow-2xs transition-all hover:border-[#cde0d5] hover:bg-[#fafcfb]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f7f3] text-[#0e4b38]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#14241e]">Enrol Student</div>
                  <div className="text-[11px] text-[#71877e]">Class admission & guardian registration</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="group flex w-full items-center justify-between rounded-xl border border-[#e2ece6] bg-white p-4 text-left shadow-2xs transition-all hover:border-[#cde0d5] hover:bg-[#fafcfb]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f7f3] text-[#0e4b38]">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#14241e]">Issue Term Fee Invoice</div>
                  <div className="text-[11px] text-[#71877e]">Raise school fee bill & bus charges</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#8fa39b] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Enrol Student */}
      <EnrolStudentModal
        isOpen={showEnrolModal}
        onClose={() => setShowEnrolModal(false)}
      />

      {/* MODAL: Issue Invoice */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Issue Term Fee Bill"
        subtitle="Generate a verified fee debit against a student's school account."
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Select Student</label>
            <select
              value={invStudentRoll}
              onChange={(e) => setInvStudentRoll(e.target.value)}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              {students.map((st) => (
                <option key={st.id} value={st.rollNumber}>
                  {st.name} ({st.classGrade} • {st.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Fee Type</label>
              <select
                value={invType}
                onChange={(e) => setInvType(e.target.value as any)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option value="Term 1 Tuition Fee">Term 1 Tuition Fee</option>
                <option value="School Bus & Transport">School Bus & Transport</option>
                <option value="Annual Activity & Lab">Annual Activity & Lab</option>
                <option value="Uniform & Books Kit">Uniform & Books Kit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Amount (₹)</label>
              <input
                type="number"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowInvoiceModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* DRAWER: Student Record */}
      <Drawer
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile"
        subtitle={selectedStudent ? `${selectedStudent.name} (${selectedStudent.rollNumber})` : ''}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#f6faf7] p-4 border border-[#e2ece6] space-y-2">
              <div className="text-xs font-bold text-[#0e4b38] uppercase tracking-wider">
                {selectedStudent.classGrade} • Academic Session 2024–25
              </div>
              <div className="text-lg font-bold text-[#14241e]">{selectedStudent.name}</div>
              <div className="text-xs text-[#50685e]">
                Guardian: <strong>{selectedStudent.guardianName}</strong> ({selectedStudent.guardianPhone})
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#edf3ef] py-2">
                <span className="text-[#71877e]">Attendance:</span>
                <span className="font-bold text-[#b91c1c]">{selectedStudent.attendancePct}%</span>
              </div>
              <div className="flex justify-between border-b border-[#edf3ef] py-2">
                <span className="text-[#71877e]">Term Progress:</span>
                <span className="font-semibold text-[#14241e]">{selectedStudent.termPercentage}% (Grade {selectedStudent.overallGrade})</span>
              </div>
              <div className="flex justify-between border-b border-[#edf3ef] py-2">
                <span className="text-[#71877e]">Transport Route:</span>
                <span className="font-semibold text-[#14241e]">{selectedStudent.busRoute}</span>
              </div>
              <div className="flex justify-between border-b border-[#edf3ef] py-2">
                <span className="text-[#71877e]">Fee Status:</span>
                <span className="font-semibold text-[#14241e]">
                  {selectedStudent.dues > 0 ? `₹${selectedStudent.dues.toLocaleString('en-IN')} Pending` : 'Cleared'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedStudent(null)
                navigate('/app/exams-grades')
              }}
              className="w-full rounded-xl bg-[#0e4b38] py-2.5 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Open Official Report Card
            </button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
