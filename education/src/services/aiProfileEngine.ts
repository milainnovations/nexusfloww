import type { UserProfile } from '../context/AuthContext'
import type {
  Student,
  Faculty,
  TimetableSlot,
  Course,
  Invoice,
  Exam,
  TransportRoute,
  HostelRoom,
  LibraryBook,
  BookIssueRecord,
  ExpenseRecord,
  BudgetAllocation,
  AdmissionRecord,
} from '../data/mockData'

export interface ErpDataSnapshot {
  students: Student[]
  facultyList: Faculty[]
  timetableSlots: TimetableSlot[]
  courses: Course[]
  exams: Exam[]
  invoices: Invoice[]
  busRoutes: TransportRoute[]
  hostelRooms: HostelRoom[]
  libraryBooks: LibraryBook[]
  bookIssues: BookIssueRecord[]
  expenses: ExpenseRecord[]
  budgetAllocations: BudgetAllocation[]
  admissions: AdmissionRecord[]
  enrolledStudentsCount: number
  facultyCount: number
  totalFeesOutstanding: number
  totalFeesCollected: number
  overdueCount: number
  attendanceWatchCount: number
  lowAttendanceStudents: Student[]
  activeClassesCount: number
}

export interface ChatResponse {
  content: string
  isSecurityViolation?: boolean
  violationReason?: string
  suggestedFollowUps?: string[]
  dataHighlights?: { label: string; value: string; color?: string }[]
}

/**
 * Validates whether a query attempts to access cross-profile unauthorized information.
 */
export function checkCrossProfileSecurity(
  query: string,
  user: UserProfile | null,
  data: ErpDataSnapshot
): { isAllowed: boolean; violationReason?: string; blockedTarget?: string } {
  if (!user) {
    return {
      isAllowed: false,
      violationReason: 'User is not authenticated. Please log in to access profile data.',
    }
  }

  const cleanQuery = query.toLowerCase().trim()

  // 1. Super Admin and Principal have school-wide administrative clearance
  if (user.role === 'Super Admin' || user.role === 'Principal') {
    return { isAllowed: true }
  }

  // 2. Student Role Security Firewall
  if (user.role === 'Student') {
    const studentRoll = (user.rollNumber || 'SCH-8A-01').toLowerCase()
    const studentName = (user.name || 'Rahul Sharma').toLowerCase()

    // Check if query targets other students by name or roll number
    for (const student of data.students) {
      const otherRoll = student.rollNumber.toLowerCase()
      const otherName = student.name.toLowerCase()
      const firstName = otherName.split(' ')[0]

      if (otherRoll !== studentRoll && !studentName.includes(firstName)) {
        // If user explicitly asks for another student's marks, attendance, fees, phone, or record
        if (
          cleanQuery.includes(otherRoll) ||
          cleanQuery.includes(otherName) ||
          (firstName.length > 3 && cleanQuery.includes(firstName))
        ) {
          return {
            isAllowed: false,
            blockedTarget: student.name,
            violationReason: `Cross-Profile Access Prohibited: You are logged in as Student (${user.name}). Accessing academic records, attendance, or personal data of other students (${student.name}) is strictly prohibited by school privacy policy.`,
          }
        }
      }
    }

    // Check if student is trying to access faculty salaries, teacher private files, admin budgets, or school expenses
    const prohibitedKeywords = [
      'salary',
      'salaries',
      'payroll',
      'teacher pay',
      'faculty salary',
      'budget allocation',
      'school expense',
      'expense record',
      'vendor payment',
      'all students list',
      'all students grades',
      'who has highest fees',
      'who has lowest marks',
      'other student',
      'classmate fees',
      'classmate marks',
      'admission review',
      'admissions list',
    ]

    for (const keyword of prohibitedKeywords) {
      if (cleanQuery.includes(keyword)) {
        return {
          isAllowed: false,
          blockedTarget: keyword,
          violationReason: `Access Denied: As a Student, your queries are restricted to your own personal profile (grades, attendance, fees, timetable, library books, and bus route). Institutional finances, staff payroll, and other students' records are restricted.`,
        }
      }
    }

    return { isAllowed: true }
  }

  // 3. Parent Role Security Firewall
  if (user.role === 'Parent') {
    const childRoll = (user.rollNumber || 'SCH-8A-01').toLowerCase()
    const childName = 'rahul'

    // Check if query targets other students
    for (const student of data.students) {
      const otherRoll = student.rollNumber.toLowerCase()
      const otherName = student.name.toLowerCase()
      const firstName = otherName.split(' ')[0]

      if (otherRoll !== childRoll && !otherName.includes(childName)) {
        if (
          cleanQuery.includes(otherRoll) ||
          cleanQuery.includes(otherName) ||
          (firstName.length > 3 && cleanQuery.includes(firstName))
        ) {
          return {
            isAllowed: false,
            blockedTarget: student.name,
            violationReason: `Cross-Profile Access Prohibited: You are logged in as Parent of Rahul Sharma. You may only view records for your enrolled ward. Accessing records for other students (${student.name}) is strictly prohibited.`,
          }
        }
      }
    }

    // Prohibited institutional finances / payroll
    if (
      cleanQuery.includes('salary') ||
      cleanQuery.includes('payroll') ||
      cleanQuery.includes('school budget') ||
      cleanQuery.includes('all students') ||
      cleanQuery.includes('admission applications')
    ) {
      return {
        isAllowed: false,
        violationReason: `Access Denied: As a Parent, your access is strictly confined to your child's academic progress, attendance, fee invoices, class timetable, and transport route.`,
      }
    }

    return { isAllowed: true }
  }

  // 4. Teacher Role Security Firewall
  if (user.role === 'Teacher') {
    const teacher =
      data.facultyList.find(
        (f) => f.email.toLowerCase() === user.email.toLowerCase() || f.name.toLowerCase() === user.name.toLowerCase()
      ) || data.facultyList[0]

    const assignedClasses = teacher?.assignedClasses.map((c) => c.toLowerCase()) || [
      'class 8-a',
      'class 9-b',
      'class 10-a',
    ]

    // Check if asking about students in non-assigned classes
    const nonAssignedClasses = ['class 6-a', 'class 6-b', 'class 7-a', 'class 7-b'].filter(
      (c) => !assignedClasses.includes(c)
    )

    for (const nac of nonAssignedClasses) {
      if (cleanQuery.includes(nac)) {
        if (
          cleanQuery.includes('student') ||
          cleanQuery.includes('marks') ||
          cleanQuery.includes('attendance') ||
          cleanQuery.includes('record')
        ) {
          return {
            isAllowed: false,
            blockedTarget: nac.toUpperCase(),
            violationReason: `Cross-Class Access Prohibited: You are assigned to teaching [${teacher.assignedClasses.join(
              ', '
            )}]. Accessing individual student records for ${nac.toUpperCase()} is restricted to the respective class teacher and Head of Department.`,
          }
        }
      }
    }

    // Check if teacher is asking for other teachers' salaries or school administrative budget expenses
    if (
      cleanQuery.includes('faculty salary') ||
      cleanQuery.includes('other teacher salary') ||
      cleanQuery.includes('payroll ledger') ||
      cleanQuery.includes('school expenses') ||
      cleanQuery.includes('budget allocations') ||
      cleanQuery.includes('bank transfer ledger')
    ) {
      return {
        isAllowed: false,
        violationReason: `Access Denied: Faculty access is scoped to academic curriculum, assigned class rosters, teaching timetables, and student grading. Administrative accounts and confidential payroll ledgers require Super Admin clearance.`,
      }
    }

    return { isAllowed: true }
  }

  // 5. Library Admin Role Security Firewall
  if (user.role === 'Library Admin') {
    if (
      cleanQuery.includes('exam marks') ||
      cleanQuery.includes('term percentage') ||
      cleanQuery.includes('tuition fee collection') ||
      cleanQuery.includes('faculty salary') ||
      cleanQuery.includes('school budget')
    ) {
      return {
        isAllowed: false,
        violationReason: `Access Denied: As Library Administrator, your clearance is restricted to Library Cataloging, Book Inventory, Circulation Ledgers, and Overdue Book Fines. Academic exams and administrative payroll are prohibited.`,
      }
    }
    return { isAllowed: true }
  }

  // 6. Administration Role Security Firewall
  if (user.role === 'Administration') {
    if (
      cleanQuery.includes('teacher confidential appraisal') ||
      cleanQuery.includes('confidential exam question paper')
    ) {
      return {
        isAllowed: false,
        violationReason: `Access Denied: Confidential academic appraisal notes are restricted to the Principal.`,
      }
    }
    return { isAllowed: true }
  }

  return { isAllowed: true }
}

/**
 * Profile-Scoped Response Generator
 */
export function generateProfileScopedAnswer(
  query: string,
  user: UserProfile | null,
  data: ErpDataSnapshot
): ChatResponse {
  if (!user) {
    return {
      content:
        '🔒 **Please log in** to access your profile data. Once logged in, this AI assistant will provide customized answers based strictly on your authenticated role and permissions.',
      isSecurityViolation: false,
    }
  }

  // Step 1: Security Firewall Check
  const securityCheck = checkCrossProfileSecurity(query, user, data)
  if (!securityCheck.isAllowed) {
    return {
      content: `### 🛡️ Access Restricted — Cross-Profile Policy Violation\n\n**${securityCheck.violationReason}**\n\n> 🔒 **Security Notice:** In compliance with the School Data Protection Policy and RBAC (Role-Based Access Control), profile isolation is strictly enforced. You can only query data authorized for **${user.name} (${user.role})**.\n\nHere are some questions you can ask within your profile authorization:`,
      isSecurityViolation: true,
      violationReason: securityCheck.violationReason,
      suggestedFollowUps: getRoleQuickSuggestions(user.role),
    }
  }

  const q = query.toLowerCase().trim()

  // Step 2: Route by User Role
  switch (user.role) {
    case 'Student':
      return handleStudentQueries(q, user, data)
    case 'Parent':
      return handleParentQueries(q, user, data)
    case 'Teacher':
      return handleTeacherQueries(q, user, data)
    case 'Library Admin':
      return handleLibraryQueries(q, user, data)
    case 'Administration':
      return handleAdminOfficeQueries(q, user, data)
    case 'Principal':
    case 'Super Admin':
      return handleSuperAdminQueries(q, user, data)
    default:
      return {
        content: `Hello ${user.name}! How can I help you today with your ${user.role} profile?`,
        suggestedFollowUps: getRoleQuickSuggestions(user.role),
      }
  }
}

/**
 * Student Query Handler (Strictly bound to user.rollNumber / Rahul Sharma)
 */
function handleStudentQueries(q: string, user: UserProfile, data: ErpDataSnapshot): ChatResponse {
  const roll = user.rollNumber || 'SCH-8A-01'
  const student = data.students.find((s) => s.rollNumber === roll) || data.students[0]
  const studentClass = student.classGrade

  // 1. Attendance Queries
  if (
    q.includes('attendance') ||
    q.includes('absent') ||
    q.includes('present') ||
    q.includes('classes attended')
  ) {
    const isLow = student.attendancePct < 75
    const neededClasses = isLow
      ? Math.ceil((0.75 * student.totalClasses - student.classesPresent) / 0.25)
      : 0

    return {
      content: `### 📊 Your Attendance Record (${student.academicYear})
**Student:** ${student.name} • **Roll No:** ${student.rollNumber} • **Class:** ${student.classGrade}

| Metric | Status |
| :--- | :--- |
| **Current Attendance** | **${student.attendancePct}%** ${isLow ? '⚠️ *(Below 75% Watch)*' : '✅ *(Good Standing)*'} |
| **Classes Present** | **${student.classesPresent}** out of **${student.totalClasses}** sessions |
| **Minimum Required** | 75.0% for Board Exam Eligibility |

${
  isLow
    ? `> ⚠️ **Attendance Alert:** Your attendance is currently at **${student.attendancePct}%**, which is below the mandatory **75%** threshold. You need to attend the next **${Math.max(
        1,
        neededClasses
      )} classes** consecutively to restore compliance.`
    : `> ✅ **Excellent!** Your attendance is in healthy standing.`
}`,
      dataHighlights: [
        { label: 'Attendance', value: `${student.attendancePct}%`, color: isLow ? '#dc2626' : '#16a34a' },
        { label: 'Classes Present', value: `${student.classesPresent}/${student.totalClasses}`, color: '#0e4b38' },
        {
          label: 'Academic Standing',
          value: isLow ? 'Needs Attention' : 'Compliant',
          color: isLow ? '#d97706' : '#16a34a',
        },
      ],
      suggestedFollowUps: ['Show my exam marks', 'What is my Monday timetable?', 'Check my fee dues'],
    }
  }

  // 2. Exam Marks, Grades & Academic Progress
  if (
    q.includes('mark') ||
    q.includes('grade') ||
    q.includes('exam') ||
    q.includes('score') ||
    q.includes('result') ||
    q.includes('percentage') ||
    q.includes('report card')
  ) {
    const studentExams = data.exams.filter((e) => e.classGrade === studentClass && e.marksMap[roll])
    let examTableRows = ''

    if (studentExams.length > 0) {
      examTableRows = studentExams
        .map((ex) => {
          const score = ex.marksMap[roll]
          return `| **${ex.subject}** | ${ex.name} | **${score.marks} / ${ex.maxMarks}** | \`${score.grade}\` | ${score.remarks} |`
        })
        .join('\n')
    } else {
      examTableRows = `| **Mathematics** | Term 1 Half-Yearly | **88 / 100** | \`A1\` | Excellent conceptual clarity |
| **Science** | Term 1 Half-Yearly | **82 / 100** | \`A2\` | Good in theory; focus on practicals |
| **English** | Term 1 Half-Yearly | **85 / 100** | \`A2\` | Fluent comprehension & writing |
| **Social Studies** | Term 1 Half-Yearly | **83 / 100** | \`A2\` | Strong historical chronology |`
    }

    return {
      content: `### 🎓 Academic Progress & Term 1 Report Card
**Student:** ${student.name} • **Class:** ${student.classGrade} • **Overall Grade:** \`${student.overallGrade}\` (**${student.termPercentage}%**)

| Subject | Assessment Term | Marks Obtained | Grade | Faculty Remarks |
| :--- | :--- | :--- | :--- | :--- |
${examTableRows}

**Teacher's Cumulative Observation:**
> "${student.remarks}"`,
      dataHighlights: [
        { label: 'Term 1 Percentage', value: `${student.termPercentage}%`, color: '#0e4b38' },
        { label: 'Overall Grade', value: student.overallGrade, color: '#16a34a' },
        { label: 'Academic Rank', value: 'Top 15%', color: '#2563eb' },
      ],
      suggestedFollowUps: ['What is my attendance?', 'Do I have any fee dues?', 'What is my bus route?'],
    }
  }

  // 3. Fees & Invoices
  if (
    q.includes('fee') ||
    q.includes('due') ||
    q.includes('invoice') ||
    q.includes('payment') ||
    q.includes('receipt') ||
    q.includes('pay')
  ) {
    const studentInvoices = data.invoices.filter((inv) => inv.studentRoll === roll)
    const pendingInvoices = studentInvoices.filter((inv) => inv.status !== 'Paid')
    const totalPending = pendingInvoices.reduce((sum, i) => sum + i.amount, 0)

    const invoiceRows = studentInvoices
      .map(
        (inv) =>
          `| **${inv.invoiceNumber}** | ${inv.feeType} | **₹${inv.amount.toLocaleString('en-IN')}** | ${inv.dueDate} | \`${inv.status.toUpperCase()}\` |`
      )
      .join('\n')

    return {
      content: `### 💳 Your School Fee Ledger & Invoices
**Student:** ${student.name} • **Roll No:** ${student.rollNumber}

| Invoice No. | Fee Category | Amount | Due Date | Status |
| :--- | :--- | :--- | :--- | :--- |
${
  invoiceRows ||
  `| **INV-2024-001** | Term 1 Tuition Fee | **₹25,000** | 15 Sep 2024 | \`PENDING\` |`
}

${
  totalPending > 0
    ? `> ⚠️ **Pending Balance Alert:** You have an outstanding balance of **₹${totalPending.toLocaleString(
        'en-IN'
      )}** due on **${pendingInvoices[0]?.dueDate || '15 Sep 2024'}**. Please contact the School Accounts Desk or complete payment online.`
    : `> ✅ **All Clear!** You have zero outstanding fee dues for this term.`
}`,
      dataHighlights: [
        {
          label: 'Outstanding Dues',
          value: `₹${totalPending.toLocaleString('en-IN')}`,
          color: totalPending > 0 ? '#dc2626' : '#16a34a',
        },
        {
          label: 'Pending Invoices',
          value: `${pendingInvoices.length}`,
          color: totalPending > 0 ? '#d97706' : '#16a34a',
        },
      ],
      suggestedFollowUps: ['Show my Monday timetable', 'Which library books are due?', 'Show my exam marks'],
    }
  }

  // 4. Timetable & Schedule
  if (
    q.includes('timetable') ||
    q.includes('schedule') ||
    q.includes('period') ||
    q.includes('class') ||
    q.includes('today') ||
    q.includes('monday') ||
    q.includes('tuesday') ||
    q.includes('wednesday') ||
    q.includes('thursday') ||
    q.includes('friday')
  ) {
    let targetDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' = 'Monday'
    if (q.includes('tuesday')) targetDay = 'Tuesday'
    else if (q.includes('wednesday')) targetDay = 'Wednesday'
    else if (q.includes('thursday')) targetDay = 'Thursday'
    else if (q.includes('friday')) targetDay = 'Friday'

    const daySlots = data.timetableSlots.filter((t) => t.classGrade === studentClass && t.day === targetDay)
    const slotsToUse = daySlots.length > 0 ? daySlots : data.timetableSlots.filter((t) => t.day === 'Monday')

    const tableRows = slotsToUse
      .map(
        (s) =>
          `| **${s.period.split(' ')[0] + ' ' + s.period.split(' ')[1]}** | ${s.time} | **${s.subjectName}** | ${s.room} | ${s.teacher} | \`${s.type}\` |`
      )
      .join('\n')

    return {
      content: `### 🗓️ Daily Timetable — ${targetDay} (${student.classGrade})
**Classroom:** Room 201 (Class 8-A) • **Class Teacher:** Prof. Vikram Singh

| Period | Time | Subject | Room / Lab | Faculty | Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
${tableRows}

> 💡 **Tip:** Laboratory sessions require regular safety aprons and practical observation manuals.`,
      suggestedFollowUps: ['What is my attendance?', 'Check my fee dues', 'Show my bus route'],
    }
  }

  // 5. Library Books & Fines
  if (
    q.includes('library') ||
    q.includes('book') ||
    q.includes('fine') ||
    q.includes('isbn') ||
    q.includes('borrow')
  ) {
    const studentIssues = data.bookIssues.filter((b) => b.studentRoll === roll)
    const overdueIssues = studentIssues.filter((b) => b.status === 'Overdue')
    const totalFine = studentIssues.reduce((sum, b) => sum + (b.fineAmount || 0), 0)

    const issueRows = studentIssues
      .map(
        (b) =>
          `| **${b.bookTitle}** | ${b.issueDate} | ${b.dueDate} | \`${b.status}\` | ${
            b.fineAmount ? `₹${b.fineAmount}` : '₹0'
          } | ${b.remarks || '—'} |`
      )
      .join('\n')

    return {
      content: `### 📚 Your Library Circulation Ledger
**Student:** ${student.name} • **Roll No:** ${student.rollNumber}

| Book Title | Issued On | Due Date | Status | Fine | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- |
${
  issueRows ||
  `| **Oxford Illustrated Science Encyclopedia** | 15 Aug 2024 | 29 Aug 2024 | \`OVERDUE\` | ₹50 | Return delayed by 9 days |`
}

${
  overdueIssues.length > 0
    ? `> ⚠️ **Overdue Book Notice:** You have **${overdueIssues.length} book(s)** overdue with a generated fine of **₹${totalFine}**. Please return them to the Central Library Shelf A-02.`
    : `> ✅ **No Overdue Books:** Your library account has zero outstanding fines.`
}`,
      dataHighlights: [
        { label: 'Books Borrowed', value: `${studentIssues.length}`, color: '#0e4b38' },
        { label: 'Overdue Fines', value: `₹${totalFine}`, color: totalFine > 0 ? '#dc2626' : '#16a34a' },
      ],
      suggestedFollowUps: ['What is my bus route?', 'Show my exam marks', 'What is my Monday timetable?'],
    }
  }

  // 6. Transport & Bus Route
  if (
    q.includes('bus') ||
    q.includes('transport') ||
    q.includes('route') ||
    q.includes('driver') ||
    q.includes('stop')
  ) {
    const route =
      data.busRoutes.find(
        (r) => r.routeNumber.includes('04') || r.stops.some((s) => s.toLowerCase().includes('green meadows'))
      ) || data.busRoutes[0]

    return {
      content: `### 🚌 Your Assigned School Bus Route
**Student:** ${student.name} • **Assigned Route:** ${student.busRoute || 'Bus Route 04 (North City)'}

| Route Details | Information |
| :--- | :--- |
| **Bus Route Name** | **${route.routeNumber}** |
| **Vehicle Registration** | \`${route.busNumber}\` (GPS Live Enabled) |
| **Driver Name** | **${route.driverName}** (${route.driverPhone}) |
| **Bus Attendant** | **${route.attendantName}** |
| **Route Stops** | ${route.stops.join(' ➔ ')} |
| **Status Today** | \`${route.status}\` |

> 📍 **Designated Pickup Point:** Green Meadows Gate 2 (Pickup: 07:40 AM | Drop: 03:45 PM)`,
      suggestedFollowUps: ['What is my attendance?', 'Show my exam marks', 'Check my fee dues'],
    }
  }

  // Default Student Welcome/Summary
  return {
    content: `### 🎓 Student Profile Overview — ${student.name}
**Roll No:** \`${student.rollNumber}\` • **Class:** ${student.classGrade} (${student.section}) • **Academic Year:** ${student.academicYear}

Here is your quick profile summary:
- 📊 **Attendance:** **${student.attendancePct}%** (${student.classesPresent}/${student.totalClasses} classes attended)
- 🏆 **Term 1 Grade:** \`${student.overallGrade}\` (**${student.termPercentage}%**)
- 💳 **Fee Balance:** **₹${student.dues.toLocaleString('en-IN')}** pending
- 🚌 **Transport:** ${student.busRoute}
- 📚 **Library:** 1 Book Overdue (*Oxford Science Encyclopedia* - Fine ₹50)

How can I help you today? You can ask about your grades, daily timetable, bus route, or fees.`,
    suggestedFollowUps: [
      'What is my attendance percentage?',
      'Show my Term 1 report card & marks',
      'What is my Monday timetable?',
      'Do I have any pending fee dues?',
    ],
  }
}

/**
 * Parent Query Handler (Strictly bound to child Rahul Sharma)
 */
function handleParentQueries(q: string, user: UserProfile, data: ErpDataSnapshot): ChatResponse {
  const childRoll = user.rollNumber || 'SCH-8A-01'
  const student = data.students.find((s) => s.rollNumber === childRoll) || data.students[0]

  if (q.includes('attendance') || q.includes('absent') || q.includes('classes')) {
    const isLow = student.attendancePct < 75
    return {
      content: `### 👨‍👩‍👧 Parent Desk: Attendance for ${student.name}
**Ward:** ${student.name} • **Class:** ${student.classGrade} • **Roll No:** ${student.rollNumber}

- **Current Attendance:** **${student.attendancePct}%**
- **Classes Present:** ${student.classesPresent} out of ${student.totalClasses} sessions
- **Board Criteria:** Minimum 75.0% required.

${
  isLow
    ? `> ⚠️ **Parent Advisory:** Rahul's attendance is at **${student.attendancePct}%** (below 75%). Please ensure regular school attendance in the coming weeks.`
    : `> ✅ Rahul's attendance is regular and in good standing.`
}`,
      suggestedFollowUps: [
        'Show Rahul\'s exam marks & report card',
        'Are there any pending fee invoices for Rahul?',
        'What bus route does Rahul take?',
      ],
    }
  }

  if (
    q.includes('fee') ||
    q.includes('due') ||
    q.includes('invoice') ||
    q.includes('payment') ||
    q.includes('pay')
  ) {
    const studentInvoices = data.invoices.filter((inv) => inv.studentRoll === childRoll)
    const totalPending = studentInvoices
      .filter((i) => i.status !== 'Paid')
      .reduce((sum, i) => sum + i.amount, 0)

    return {
      content: `### 💳 Parent Desk: Fee Statement for ${student.name}
**Total Outstanding Dues:** **₹${totalPending.toLocaleString('en-IN')}**

| Invoice No. | Category | Amount | Due Date | Status |
| :--- | :--- | :--- | :--- | :--- |
${studentInvoices
  .map(
    (i) =>
      `| **${i.invoiceNumber}** | ${i.feeType} | **₹${i.amount.toLocaleString('en-IN')}** | ${i.dueDate} | \`${i.status}\` |`
  )
  .join('\n')}

> 📌 **Payment Instructions:** Online netbanking, UPI, and school accounts counter are open Monday to Saturday (08:30 AM to 02:30 PM).`,
      suggestedFollowUps: [
        'Show Rahul\'s exam marks & report card',
        'What is Rahul\'s attendance percentage?',
        'Who is Rahul\'s class teacher?',
      ],
    }
  }

  if (
    q.includes('mark') ||
    q.includes('grade') ||
    q.includes('exam') ||
    q.includes('report') ||
    q.includes('progress')
  ) {
    return {
      content: `### 📜 Progress Report Card — ${student.name} (${student.classGrade})
**Overall Grade:** \`${student.overallGrade}\` (**${student.termPercentage}%**) • **Class Teacher:** Prof. Vikram Singh

| Subject | Assessment Term | Marks | Grade | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| **Mathematics** | Term 1 Half-Yearly | **88 / 100** | \`A1\` | Excellent analytical capability |
| **Science** | Term 1 Half-Yearly | **82 / 100** | \`A2\` | Good in theory; improve in practicals |
| **English Literature** | Term 1 Half-Yearly | **85 / 100** | \`A2\` | Active participation in reading |
| **Social Studies** | Term 1 Half-Yearly | **83 / 100** | \`A2\` | Good grasp of geography & civics |

**Class Teacher's Remark:**
> "${student.remarks}"`,
      suggestedFollowUps: [
        'Are there any pending fee invoices for Rahul?',
        'What is Rahul\'s attendance percentage?',
        'What bus route does Rahul take?',
      ],
    }
  }

  return {
    content: `### 👨‍👩‍👦 Welcome to Parent Desk, ${user.name}!
You are viewing authenticated records for your enrolled ward: **${student.name}** (Class 8-A, Roll: \`${student.rollNumber}\`).

- 📊 **Attendance:** **${student.attendancePct}%** (${student.classesPresent}/${student.totalClasses} classes)
- 🏆 **Term 1 Result:** Grade \`${student.overallGrade}\` (**${student.termPercentage}%**)
- 💳 **Pending Fees:** **₹${student.dues.toLocaleString('en-IN')}**
- 🚌 **Bus Route:** ${student.busRoute}
- 👨‍🏫 **Class Teacher:** Prof. Vikram Singh (Mathematics)

How can I assist you with your child's academic records today?`,
    suggestedFollowUps: [
      'What is Rahul\'s attendance percentage?',
      'Show Rahul\'s exam marks & report card',
      'Are there any pending fee invoices for Rahul?',
      'What bus route does Rahul take?',
    ],
  }
}

/**
 * Teacher Query Handler (Scoped to assigned classes 8-A, 9-B, 10-A and subject Mathematics)
 */
function handleTeacherQueries(q: string, user: UserProfile, data: ErpDataSnapshot): ChatResponse {
  const teacher =
    data.facultyList.find(
      (f) => f.email.toLowerCase() === user.email.toLowerCase() || f.name.toLowerCase() === user.name.toLowerCase()
    ) || data.facultyList[0]

  // 1. Schedule & Timetable Queries
  if (
    q.includes('timetable') ||
    q.includes('schedule') ||
    q.includes('teach') ||
    q.includes('class today') ||
    q.includes('monday') ||
    q.includes('period')
  ) {
    const teachingSlots = data.timetableSlots.filter(
      (s) =>
        s.teacher.toLowerCase().includes('vikram') ||
        s.teacher.toLowerCase().includes(teacher.name.toLowerCase())
    )

    const tableRows = teachingSlots
      .map(
        (s) =>
          `| **${s.day}** | ${s.period.split(' ')[0] + ' ' + s.period.split(' ')[1]} | ${s.time} | **${s.classGrade}** | ${s.subjectName} | ${s.room} |`
      )
      .join('\n')

    return {
      content: `### 🗓️ Teaching Timetable — ${teacher.name}
**Department:** ${teacher.department} • **Designation:** ${teacher.designation}

| Day | Period | Time | Class / Section | Subject | Room / Lab |
| :--- | :--- | :--- | :--- | :--- | :--- |
${
  tableRows ||
  `| Monday | Period 1 | 08:30–09:15 | **Class 8-A** | Mathematics | Room 201 |
| Monday | Period 5 | 12:30–01:15 | **Class 8-A** | Computer Apps | Computer Lab 01 |`
}

> 🏫 **Total Weekly Teaching Load:** 18 Periods across [${teacher.assignedClasses.join(', ')}].`,
      suggestedFollowUps: [
        'Show low attendance students in Class 8-A',
        'What is the syllabus progress in Mathematics?',
        'List all students in Class 8-A',
      ],
    }
  }

  // 2. Class 8-A Roster & Low Attendance Watch
  if (
    q.includes('attendance') ||
    q.includes('low attendance') ||
    q.includes('watch') ||
    q.includes('student') ||
    q.includes('roster') ||
    q.includes('8-a')
  ) {
    const classStudents = data.students.filter((s) => s.classGrade === 'Class 8-A')
    const lowAtt = classStudents.filter((s) => s.attendancePct < 75)

    return {
      content: `### 📋 Class 8-A Roster & Attendance Watchlist
**Class Teacher:** ${teacher.name} • **Total Strength:** ${classStudents.length} Students

#### ⚠️ Students Below 75% Attendance Threshold:
| Roll No. | Student Name | Attendance % | Sessions Present | Status / Notice |
| :--- | :--- | :--- | :--- | :--- |
${lowAtt
  .map(
    (s) =>
      `| **${s.rollNumber}** | ${s.name} | **${s.attendancePct}%** | ${s.classesPresent} / ${s.totalClasses} | \`NOTICE ISSUED\` |`
  )
  .join('\n')}

#### 🌟 Class 8-A Complete Roster Summary:
${classStudents
  .map(
    (s) =>
      `- **${s.rollNumber}** — ${s.name} | Att: **${s.attendancePct}%** | Grade: \`${s.overallGrade}\` (${s.termPercentage}%)`
  )
  .join('\n')}`,
      dataHighlights: [
        { label: 'Class 8-A Strength', value: `${classStudents.length} Students`, color: '#0e4b38' },
        { label: 'Low Attendance Watch', value: `${lowAtt.length} Students`, color: '#dc2626' },
        { label: 'Class Avg Attendance', value: '76.1%', color: '#d97706' },
      ],
      suggestedFollowUps: [
        'What classes am I teaching on Monday?',
        'What is the syllabus progress in Mathematics?',
        'List all students in Class 8-A',
      ],
    }
  }

  // 3. Syllabus & Subject Progress
  if (
    q.includes('syllabus') ||
    q.includes('course') ||
    q.includes('curriculum') ||
    q.includes('chapter') ||
    q.includes('math')
  ) {
    const mathCourses = data.courses.filter(
      (c) => c.facultyInCharge.includes('Vikram') || c.name.includes('Math')
    )

    return {
      content: `### 📖 Curriculum & Syllabus Tracker — Mathematics
**Faculty In-Charge:** ${teacher.name}

| Course Code | Subject & Grade | Chapters Completed | Total Chapters | Completion Rate |
| :--- | :--- | :--- | :--- | :--- |
${mathCourses
  .map(
    (c) =>
      `| **${c.code}** | ${c.name} (${c.classGrade}) | **${c.chaptersCompleted}** | **${c.syllabusChaptersCount}** | **${Math.round(
        (c.chaptersCompleted / c.syllabusChaptersCount) * 100
      )}%** |`
  )
  .join('\n')}

> 🎯 **Next Milestone:** Chapter 6 (Linear Equations & Rational Numbers) scheduled for completion by Oct 10th.`,
      suggestedFollowUps: [
        'What classes am I teaching on Monday?',
        'Show low attendance students in Class 8-A',
      ],
    }
  }

  // Default Teacher Welcome
  return {
    content: `### 👨‍🏫 Faculty Desk — ${teacher.name}
**Role:** ${teacher.designation} • **Department:** ${teacher.department} • **Cabin:** ${teacher.cabin}

**Assigned Classes:** ${teacher.assignedClasses.join(', ')}  
**Subjects:** ${teacher.subjectsTaught.join(', ')}  
**Class Teacher Responsibility:** ${teacher.isClassTeacherOf || 'Class 8-A'}

How can I help you today? You can query your daily teaching timetable, Class 8-A attendance watchlist, syllabus completion tracker, or student grade rosters.`,
    suggestedFollowUps: [
      'What classes am I teaching on Monday?',
      'Show low attendance students in Class 8-A',
      'What is the syllabus progress in Mathematics?',
    ],
  }
}

/**
 * Library Administrator Query Handler
 */
function handleLibraryQueries(q: string, user: UserProfile, data: ErpDataSnapshot): ChatResponse {
  if (q.includes('overdue') || q.includes('fine') || q.includes('late') || q.includes('delay')) {
    const overdue = data.bookIssues.filter((b) => b.status === 'Overdue')
    return {
      content: `### 📚 Central Library: Overdue Issues Ledger
**Head Librarian:** ${user.name}

| Book Title | ISBN | Borrower | Class | Due Date | Fine Accrued |
| :--- | :--- | :--- | :--- | :--- | :--- |
${overdue
  .map(
    (b) =>
      `| **${b.bookTitle}** | \`${b.isbn}\` | ${b.studentName} (${b.studentRoll}) | ${b.classGrade} | ${b.dueDate} | **₹${b.fineAmount}** |`
  )
  .join('\n')}

> 🔔 Automated SMS reminders have been dispatched for overdue books.`,
      suggestedFollowUps: [
        'Show library inventory & catalog summary',
        'Who borrowed the Mathematics Olympiad book?',
        'List all active book issues with return dates',
      ],
    }
  }

  if (
    q.includes('inventory') ||
    q.includes('book') ||
    q.includes('catalog') ||
    q.includes('shelf') ||
    q.includes('copies')
  ) {
    return {
      content: `### 📖 Library Book Repository & Catalog
**Total Registered Volumes:** ${data.libraryBooks.reduce((s, b) => s + b.totalCopies, 0)} Copies

| Title | Author | Category | Available / Total | Shelf Location |
| :--- | :--- | :--- | :--- | :--- |
${data.libraryBooks
  .map(
    (b) =>
      `| **${b.title}** | ${b.author} | ${b.category} | **${b.copiesAvailable} / ${b.totalCopies}** | \`${b.shelfLocation}\` |`
  )
  .join('\n')}`,
      suggestedFollowUps: [
        'Which books are currently overdue?',
        'List all active book issues with return dates',
      ],
    }
  }

  return {
    content: `### 📚 Library Administration Desk — ${user.name}
**Clearance:** Full Library Circulation, Cataloging, Book Stock Inventory, and Fines Ledger.

- **Available Catalog Titles:** ${data.libraryBooks.length} titles
- **Active Issued Books:** ${data.bookIssues.filter((i) => i.status === 'Issued').length}
- **Overdue Books:** ${data.bookIssues.filter((i) => i.status === 'Overdue').length} (Fine: ₹50)

You can ask about overdue book returns, book shelf locations, student borrowing records, or title availability.`,
    suggestedFollowUps: [
      'Which books are currently overdue?',
      'Show library inventory & catalog summary',
      'Who borrowed the Mathematics Olympiad book?',
    ],
  }
}

/**
 * Administration Role Query Handler
 */
function handleAdminOfficeQueries(q: string, user: UserProfile, data: ErpDataSnapshot): ChatResponse {
  if (
    q.includes('expense') ||
    q.includes('voucher') ||
    q.includes('bill') ||
    q.includes('payment') ||
    q.includes('vendor')
  ) {
    return {
      content: `### 📑 School Administration: Expense Ledger (FY 2024–25)
**Department:** Accounts & Administration Office • **Head:** ${user.name}

| Voucher No. | Category | Description | Amount | Date | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${data.expenses
  .slice(0, 6)
  .map(
    (e) =>
      `| **${e.expenseNumber}** | ${e.category} | ${e.description} | **₹${e.amount.toLocaleString('en-IN')}** | ${e.date} | \`${e.status}\` |`
  )
  .join('\n')}

> 💰 **Total Recorded Expenditure:** ₹${data.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}`,
      suggestedFollowUps: [
        'What is the annual budget utilization by category?',
        'What is the total fee outstanding vs collected?',
        'Show student admission applications status',
      ],
    }
  }

  if (
    q.includes('budget') ||
    q.includes('allocation') ||
    q.includes('fiscal') ||
    q.includes('fund')
  ) {
    return {
      content: `### 📊 Annual Budget Allocation vs Actual Spend (FY 2024–2025)
| Category | Allocated Budget | Amount Spent | Utilization % | Remaining Balance |
| :--- | :--- | :--- | :--- | :--- |
${data.budgetAllocations
  .map((b) => {
    const pct = Math.round((b.spentAmount / b.allocatedAmount) * 100)
    const remaining = b.allocatedAmount - b.spentAmount
    return `| **${b.category}** | ₹${b.allocatedAmount.toLocaleString('en-IN')} | ₹${b.spentAmount.toLocaleString('en-IN')} | **${pct}%** | ₹${remaining.toLocaleString('en-IN')} |`
  })
  .join('\n')}`,
      suggestedFollowUps: [
        'Show recent expense vouchers and status',
        'What is the total fee outstanding vs collected?',
        'Show student admission applications status',
      ],
    }
  }

  if (
    q.includes('admission') ||
    q.includes('applicant') ||
    q.includes('enrollment') ||
    q.includes('intake')
  ) {
    return {
      content: `### 🎓 Admissions & Enrollment Pipeline (2024–25 Intake)
| Application No. | Applicant Name | Class Applied | Guardian Contact | Status |
| :--- | :--- | :--- | :--- | :--- |
${data.admissions
  .map(
    (a) =>
      `| **${a.applicationNumber}** | **${a.applicantName}** | ${a.applyingForClass} | ${a.guardianPhone} | \`${a.status.toUpperCase()}\` |`
  )
  .join('\n')}`,
      suggestedFollowUps: [
        'Show recent expense vouchers and status',
        'What is the annual budget utilization by category?',
      ],
    }
  }

  return {
    content: `### 🏛️ Administration & Accounts Desk — ${user.name}
**Administrative Scope:** Financial Operations, Vendor Expenses, Annual Budgets, Fee Collection, and Admissions Processing.

- **Total Fee Collected:** ₹${data.totalFeesCollected.toLocaleString('en-IN')} (Outstanding: ₹${data.totalFeesOutstanding.toLocaleString('en-IN')})
- **Active Admissions Under Review:** ${data.admissions.filter((a) => a.status === 'Under Review' || a.status === 'Shortlisted').length}
- **School Expenses Recorded:** ${data.expenses.length} vouchers

How can I assist your administrative workflow?`,
    suggestedFollowUps: [
      'What is the total fee outstanding vs collected?',
      'Show recent expense vouchers and status',
      'What is the annual budget utilization by category?',
      'Show student admission applications status',
    ],
  }
}

/**
 * Principal & Super Admin Query Handler (Holistic Institutional Overview)
 */
function handleSuperAdminQueries(q: string, user: UserProfile, data: ErpDataSnapshot): ChatResponse {
  if (
    q.includes('fee') ||
    q.includes('dues') ||
    q.includes('revenue') ||
    q.includes('collection')
  ) {
    return {
      content: `### 💰 Institutional Fee Collection Summary
**Campus:** ${user.institutionName || 'Greenwood International School'}

| Metric | Amount | Description |
| :--- | :--- | :--- |
| **Total Fees Collected** | **₹${data.totalFeesCollected.toLocaleString('en-IN')}** | 78.4% Collection efficiency |
| **Total Fees Outstanding** | **₹${data.totalFeesOutstanding.toLocaleString('en-IN')}** | Across ${data.overdueCount} pending invoices |
| **Overdue Invoices Count** | **${data.overdueCount}** | Automated payment notices issued |

> 🔔 Highest outstanding dues concentrated in Class 8-A and Class 7-A.`,
      dataHighlights: [
        { label: 'Fees Collected', value: `₹${data.totalFeesCollected.toLocaleString('en-IN')}`, color: '#16a34a' },
        { label: 'Outstanding Dues', value: `₹${data.totalFeesOutstanding.toLocaleString('en-IN')}`, color: '#dc2626' },
        { label: 'Overdue Invoices', value: `${data.overdueCount}`, color: '#d97706' },
      ],
      suggestedFollowUps: [
        'Which students have attendance below 75%?',
        'Show faculty staff directory and departments',
        'Show annual budget allocation vs spend',
      ],
    }
  }

  if (
    q.includes('attendance') ||
    q.includes('low attendance') ||
    q.includes('watch')
  ) {
    return {
      content: `### 🚨 School-Wide Low Attendance Watchlist (< 75%)
**Threshold Policy:** CBSE/State Board 75.0% Mandatory Presence

| Roll No. | Student Name | Class | Attendance % | Present / Total | Parent Contact |
| :--- | :--- | :--- | :--- | :--- | :--- |
${data.lowAttendanceStudents
  .map(
    (s) =>
      `| **${s.rollNumber}** | ${s.name} | ${s.classGrade} | **${s.attendancePct}%** | ${s.classesPresent}/${s.totalClasses} | ${s.guardianPhone} |`
  )
  .join('\n')}

> ⚠️ Total **${data.lowAttendanceStudents.length} students** currently flag attendance alerts.`,
      dataHighlights: [
        { label: 'Low Attendance Students', value: `${data.lowAttendanceStudents.length}`, color: '#dc2626' },
        { label: 'School Avg Attendance', value: '82.4%', color: '#16a34a' },
      ],
      suggestedFollowUps: [
        'Show fee collection and outstanding dues summary',
        'Show faculty staff directory and departments',
        'Show student admission applications status',
      ],
    }
  }

  if (
    q.includes('faculty') ||
    q.includes('teacher') ||
    q.includes('staff')
  ) {
    return {
      content: `### 👨‍🏫 Teaching Faculty & Departmental Directory
| Teacher Code | Faculty Name | Department | Assigned Classes | Cabin | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${data.facultyList
  .map(
    (f) =>
      `| **${f.teacherCode}** | **${f.name}** | ${f.department} | ${f.assignedClasses.join(', ')} | \`${f.cabin}\` | \`${f.status}\` |`
  )
  .join('\n')}`,
      suggestedFollowUps: [
        'Show fee collection and outstanding dues summary',
        'Which students have attendance below 75%?',
      ],
    }
  }

  // Default Super Admin / Principal Summary
  return {
    content: `### 🏛️ Executive Campus Intelligence — ${user.name}
**Active Role:** ${user.role} • **Institution:** ${user.institutionName}

#### Key Operational Indicators:
- 👥 **Student Body:** **${data.enrolledStudentsCount} Enrolled Students** across ${data.activeClassesCount} Active Classes
- 👨‍🏫 **Teaching Staff:** **${data.facultyCount} Faculty Members** (Active)
- 💳 **Fee Collection:** **₹${data.totalFeesCollected.toLocaleString('en-IN')} Collected** (₹${data.totalFeesOutstanding.toLocaleString('en-IN')} Outstanding)
- ⚠️ **Attendance Watch:** **${data.attendanceWatchCount} Students** below 75% threshold
- 🚌 **Bus Fleet:** 3 Active Transit Routes (All on time)
- 📚 **Library Catalog:** 4 Titles (1 Overdue Issue)
- 📑 **Admissions:** 5 Applications (1 Admitted, 1 Shortlisted, 1 Waitlisted)

You have full managerial clearance to query any academic, operational, logistical, or financial module across the campus.`,
    suggestedFollowUps: [
      'Show fee collection and outstanding dues summary',
      'Which students have attendance below 75%?',
      'Show faculty staff directory and departments',
      'Show annual budget allocation vs spend',
    ],
  }
}

/**
 * Returns role-tailored prompt chips
 */
export function getRoleQuickSuggestions(role?: UserProfile['role']): string[] {
  switch (role) {
    case 'Student':
      return [
        'What is my attendance percentage?',
        'Show my Term 1 report card & marks',
        'Do I have any pending fee dues?',
        'What is my Monday timetable?',
        'Which library books are issued to me?',
        'What is my assigned school bus route?',
      ]
    case 'Parent':
      return [
        'What is Rahul\'s attendance percentage?',
        'Show Rahul\'s exam marks & report card',
        'Are there any pending fee invoices for Rahul?',
        'What bus route does Rahul take?',
        'Who is Rahul\'s class teacher?',
      ]
    case 'Teacher':
      return [
        'What classes am I teaching on Monday?',
        'Show low attendance students in Class 8-A',
        'What is the syllabus progress in Mathematics?',
        'List all students in Class 8-A',
        'Show my teaching schedule and cabin details',
      ]
    case 'Library Admin':
      return [
        'Which books are currently overdue?',
        'Show library inventory & catalog summary',
        'Who borrowed the Mathematics Olympiad book?',
        'List all active book issues with return dates',
      ]
    case 'Administration':
      return [
        'What is the total fee outstanding vs collected?',
        'Show recent expense vouchers and status',
        'What is the annual budget utilization by category?',
        'Show student admission applications status',
      ]
    case 'Principal':
    case 'Super Admin':
    default:
      return [
        'Campus overview: students, faculty, and fee collection',
        'Which students have attendance below 75%?',
        'Show fee collection and outstanding dues summary',
        'Show faculty staff directory and departments',
        'Show annual budget allocation vs spend',
        'Show bus fleet transit and occupancy status',
      ]
  }
}
