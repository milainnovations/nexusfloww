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
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { StatCard } from '../components/common/StatCard'
import { Modal } from '../components/common/Modal'
import { Drawer } from '../components/common/Drawer'
import { Badge } from '../components/common/Badge'
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
import { Upload } from 'lucide-react'
import type { Student } from '../data/mockData'

export const CampusDeskPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    students,
    timetableSlots,
    exams,
    invoices,
    enrolledStudentsCount,
    facultyCount,
    totalFeesOutstanding,
    totalFeesCollected,
    attendanceWatchCount,
    lowAttendanceStudents,
    activeClassesCount,
    addStudent,
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
  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [classGrade, setClassGrade] = useState('Class 8-A')
  const [section] = useState('A')
  const [phone] = useState('+91 98765 00000')
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [busRoute, setBusRoute] = useState('Bus Route 04 (North City)')

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

  // Student specific data for Rahul Sharma
  const currentStudent = students.find((s) => s.rollNumber === 'SCH-8A-01') || students[0]
  const studentInvoices = invoices.filter((i) => i.studentRoll === currentStudent?.rollNumber)
  const pendingStudentInvoice = studentInvoices.find((i) => i.status === 'Pending' || i.status === 'Overdue')

  // Teacher specific schedule
  const teacherSchedule = timetableSlots.filter(
    (tt) => tt.day === 'Monday' && tt.teacher.includes('Vikram Singh')
  )

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addStudent({
      name,
      rollNumber: rollNumber || `SCH-${classGrade.replace('Class ', '').replace('-', '')}-${String(students.length + 1).padStart(2, '0')}`,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@demo.com`,
      classGrade,
      section,
      academicYear: '2024–2025',
      phone: phone || '+91 98765 00000',
      busRoute,
      guardianName: guardianName || 'Parent / Guardian',
      guardianRelation: 'Parent',
      guardianPhone: guardianPhone || '+91 98765 00000',
      address: 'Bengaluru Campus',
      dues: 0,
      dateOfBirth: '15 Aug 2011',
      bloodGroup: 'B+',
      remarks: 'Newly admitted student for academic session 2024–2025.',
    })
    setShowEnrolModal(false)
    setName('')
    setRollNumber('')
    setEmail('')
  }

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
                Class Teacher of <strong>Class 8-A</strong> • Senior Mathematics & Computer Applications Faculty.
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
            subtext="Class 8-A, Class 9-B, Class 10-A"
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
            label="Class 8-A Strength"
            value="5 Students"
            subtext="Avg Attendance: 81.4%"
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
                {isParent ? 'Parent Portal: Rahul Sharma' : 'Welcome back, Rahul Sharma'}
              </h1>
              <p className="text-sm text-[#50685e] leading-relaxed">
                <strong>Class 8-A</strong> • Roll No: <strong>SCH-8A-01</strong> • Class Teacher:{' '}
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
            value="Route 04"
            subtext="Driver: Ramesh (+91 98450)"
            icon={Bus}
            iconColor="green"
          />
        </div>

        {/* Visual Insights: Subject Proficiency Map & Monthly Attendance Trend */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubjectRadarChart title={isParent ? "Rahul's Subject Proficiency Map vs Class Average" : "My Subject Proficiency Radar Map"} />
          <AttendanceTrendAreaChart title={isParent ? "Rahul's Attendance Consistency Record" : "My Attendance Trajectory"} />
        </div>

        <StudentTermProgressLineChart title={isParent ? "Rahul's Multi-Term Score Progression & Growth" : "My Multi-Term Score Growth & Class Comparison"} />

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
                <span className="font-semibold text-[#14241e]">Rahul Sharma (Class 8-A)</span>
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
      <Modal
        isOpen={showEnrolModal}
        onClose={() => setShowEnrolModal(false)}
        title="Enrol New Student"
        subtitle="Add a pupil to the official Greenwood School academic register."
      >
        <form onSubmit={handleEnrolSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Full Student Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan Dixit"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Class</label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Class 6-A</option>
                <option>Class 6-B</option>
                <option>Class 7-A</option>
                <option>Class 8-A</option>
                <option>Class 9-A</option>
                <option>Class 10-A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Bus Transport</label>
              <select
                value={busRoute}
                onChange={(e) => setBusRoute(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Bus Route 04 (North City)</option>
                <option>Bus Route 02 (Indiranagar)</option>
                <option>Bus Route 06 (Whitefield)</option>
                <option>Day Scholar (Own Transport)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Name</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent's Name"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Phone</label>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowEnrolModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Confirm Admission
            </button>
          </div>
        </form>
      </Modal>

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
