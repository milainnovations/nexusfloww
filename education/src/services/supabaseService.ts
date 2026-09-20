/**
 * SUPABASE DATA SERVICE LAYER
 * 
 * Typed wrappers for all database table operations.
 * Maps Supabase snake_case columns to the app's camelCase TypeScript types.
 */

import { supabase } from '../lib/supabase'
import type {
  Student,
  Faculty,
  TimetableSlot,
  Course,
  Exam,
  Invoice,
  HostelRoom,
  LibraryBook,
  BookIssueRecord,
  UserRole,
  ExpenseRecord,
  AdmissionRecord,
} from '../data/mockData'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function handleError(context: string, error: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (error && typeof error === 'object' && (error as any).code === 'PGRST116') {
    return
  }
  console.error(`[SupabaseService] ${context}:`, error)
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStudent(row: any): Student {
  return {
    id: row.id,
    rollNumber: row.roll_number,
    name: row.name,
    email: row.email ?? '',
    gender: row.gender ?? 'Male',
    classGrade: row.class_grade,
    section: row.section ?? 'A',
    academicYear: row.academic_year ?? '2024-2025',
    attendancePct: Number(row.attendance_pct ?? 100),
    classesPresent: row.classes_present ?? 0,
    totalClasses: row.total_classes ?? 66,
    overallGrade: row.overall_grade ?? 'A1',
    termPercentage: Number(row.term_percentage ?? 0),
    phone: row.phone ?? '',
    busRoute: row.bus_route ?? 'Private / Walker',
    guardianName: row.guardian_name ?? '',
    guardianRelation: (row.guardian_relation ?? 'Father') as Student['guardianRelation'],
    guardianPhone: row.guardian_phone ?? '',
    address: row.address ?? '',
    dues: Number(row.dues ?? 0),
    admissionDate: row.admission_date
      ? new Date(row.admission_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '',
    dateOfBirth: row.date_of_birth ?? '',
    bloodGroup: row.blood_group ?? '',
    remarks: row.remarks ?? '',
  }
}

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('class_grade')
    .order('roll_number')
  if (error) { handleError('fetchStudents', error); return [] }
  return (data ?? []).map(mapStudent)
}

export async function fetchStudentByRoll(roll: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('roll_number', roll)
    .maybeSingle()
  if (error) { handleError('fetchStudentByRoll', error); return null }
  return data ? mapStudent(data) : null
}

export async function upsertStudent(student: Student): Promise<boolean> {
  const { error } = await supabase.from('students').upsert({
    id: student.id,
    roll_number: student.rollNumber,
    name: student.name,
    email: student.email,
    gender: student.gender,
    class_grade: student.classGrade,
    section: student.section,
    academic_year: student.academicYear ?? '2024-2025',
    attendance_pct: student.attendancePct,
    classes_present: student.classesPresent,
    total_classes: student.totalClasses,
    overall_grade: student.overallGrade,
    term_percentage: student.termPercentage,
    phone: student.phone,
    bus_route: student.busRoute,
    guardian_name: student.guardianName,
    guardian_relation: student.guardianRelation,
    guardian_phone: student.guardianPhone,
    address: student.address,
    dues: student.dues,
    remarks: student.remarks,
  }, { onConflict: 'id' })
  if (error) { handleError('upsertStudent', error); return false }
  return true
}

export async function deleteStudentById(id: string): Promise<boolean> {
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) { handleError('deleteStudentById', error); return false }
  return true
}

export async function updateStudentAttendance(
  rollNumber: string,
  classesPresent: number,
  totalClasses: number,
  attendancePct: number
): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .update({ classes_present: classesPresent, total_classes: totalClasses, attendance_pct: attendancePct })
    .eq('roll_number', rollNumber)
  if (error) { handleError('updateStudentAttendance', error); return false }
  return true
}

// ─── FACULTY ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFaculty(row: any): Faculty {
  return {
    id: row.id,
    teacherCode: row.teacher_code,
    name: row.name,
    email: row.email ?? '',
    department: row.department,
    designation: row.designation,
    assignedClasses: row.assigned_classes ?? [],
    subjectsTaught: row.subjects_taught ?? [],
    isClassTeacherOf: row.is_class_teacher_of ?? '',
    cabin: row.cabin ?? '',
    phone: row.phone ?? '',
    qualification: row.qualification ?? '',
    experienceYears: row.experience_years ?? 0,
    status: row.status ?? 'Active',
  }
}

export async function fetchFaculty(): Promise<Faculty[]> {
  const { data, error } = await supabase.from('faculty').select('*').order('name')
  if (error) { handleError('fetchFaculty', error); return [] }
  return (data ?? []).map(mapFaculty)
}

export async function upsertFaculty(faculty: Faculty): Promise<boolean> {
  const { error } = await supabase.from('faculty').upsert({
    id: faculty.id,
    teacher_code: faculty.teacherCode,
    name: faculty.name,
    email: faculty.email,
    department: faculty.department,
    designation: faculty.designation,
    assigned_classes: faculty.assignedClasses,
    subjects_taught: faculty.subjectsTaught,
    is_class_teacher_of: faculty.isClassTeacherOf,
    cabin: faculty.cabin,
    phone: faculty.phone,
    qualification: faculty.qualification,
    experience_years: faculty.experienceYears,
    status: faculty.status,
  }, { onConflict: 'id' })
  if (error) { handleError('upsertFaculty', error); return false }
  return true
}

// ─── COURSES ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCourse(row: any): Course {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    classGrade: row.class_grade,
    department: row.department,
    periodsPerWeek: row.periods_per_week ?? 5,
    type: row.type ?? 'Core Academic',
    facultyInCharge: row.faculty_in_charge ?? '',
    enrolledStudentsCount: row.enrolled_students_count ?? 0,
    syllabusChaptersCount: row.syllabus_chapters_count ?? 15,
    chaptersCompleted: row.chapters_completed ?? 0,
  }
}

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select('*').order('class_grade')
  if (error) { handleError('fetchCourses', error); return [] }
  return (data ?? []).map(mapCourse)
}

export async function upsertCourse(course: Course): Promise<boolean> {
  const { error } = await supabase.from('courses').upsert({
    id: course.id,
    code: course.code,
    name: course.name,
    class_grade: course.classGrade,
    department: course.department,
    periods_per_week: course.periodsPerWeek,
    type: course.type,
    faculty_in_charge: course.facultyInCharge,
    enrolled_students_count: course.enrolledStudentsCount,
    syllabus_chapters_count: course.syllabusChaptersCount,
    chapters_completed: course.chaptersCompleted,
  }, { onConflict: 'id' })
  if (error) { handleError('upsertCourse', error); return false }
  return true
}

// ─── TIMETABLE ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTimetableSlot(row: any): TimetableSlot {
  return {
    id: row.id,
    day: row.day_of_week as TimetableSlot['day'],
    period: row.period,
    time: row.time,
    subjectCode: row.subject_code ?? '',
    subjectName: row.subject_name,
    classGrade: row.class_grade,
    room: row.room,
    teacher: row.teacher,
    type: row.type ?? 'Theory',
  }
}

export async function fetchTimetable(): Promise<TimetableSlot[]> {
  const { data, error } = await supabase.from('timetable').select('*').order('class_grade').order('day_of_week')
  if (error) { handleError('fetchTimetable', error); return [] }
  return (data ?? []).map(mapTimetableSlot)
}

export async function upsertTimetableSlot(slot: TimetableSlot): Promise<boolean> {
  const { error } = await supabase.from('timetable').upsert({
    id: slot.id,
    day_of_week: slot.day,
    period: slot.period,
    time: slot.time,
    subject_code: slot.subjectCode,
    subject_name: slot.subjectName,
    class_grade: slot.classGrade,
    room: slot.room,
    teacher: slot.teacher,
    type: slot.type,
    academic_year: '2024-2025',
  }, { onConflict: 'id' })
  if (error) { handleError('upsertTimetableSlot', error); return false }
  return true
}

export async function deleteTimetableSlot(id: string): Promise<boolean> {
  const { error } = await supabase.from('timetable').delete().eq('id', id)
  if (error) { handleError('deleteTimetableSlot', error); return false }
  return true
}

// ─── EXAMS ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExam(row: any, marksRows: any[]): Exam {
  const marksMap: Record<string, { marks: number; grade: string; remarks: string }> = {}
  for (const m of marksRows) {
    if (m.exam_id === row.id) {
      marksMap[m.student_roll] = {
        marks: Number(m.marks_obtained),
        grade: m.grade ?? '',
        remarks: m.remarks ?? '',
      }
    }
  }
  return {
    id: row.id,
    name: row.name,
    term: row.term ?? 'Term 1',
    classGrade: row.class_grade,
    subject: row.subject,
    date: row.exam_date
      ? new Date(row.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    maxMarks: row.max_marks ?? 100,
    conductedBy: row.conducted_by ?? '',
    status: row.status ?? 'Scheduled',
    marksMap,
  }
}

export async function fetchExams(): Promise<Exam[]> {
  const [examsResult, marksResult] = await Promise.all([
    supabase.from('exams').select('*').order('exam_date', { ascending: false }),
    supabase.from('exam_marks').select('*'),
  ])
  if (examsResult.error) { handleError('fetchExams', examsResult.error); return [] }
  const marksRows = marksResult.data ?? []
  return (examsResult.data ?? []).map((row) => mapExam(row, marksRows))
}

export async function upsertExam(exam: Exam): Promise<boolean> {
  // Parse date string back to ISO for DB
  let examDate = exam.date
  try {
    const parsed = new Date(exam.date)
    if (!isNaN(parsed.getTime())) examDate = parsed.toISOString().split('T')[0]
  } catch {/* keep original */}

  const { error } = await supabase.from('exams').upsert({
    id: exam.id,
    name: exam.name,
    term: exam.term,
    class_grade: exam.classGrade,
    subject: exam.subject,
    exam_date: examDate,
    max_marks: exam.maxMarks,
    conducted_by: exam.conductedBy,
    status: exam.status,
  }, { onConflict: 'id' })
  if (error) { handleError('upsertExam', error); return false }
  return true
}

export async function upsertExamMarks(
  examId: string,
  marksMap: Record<string, { marks: number; grade: string; remarks: string }>
): Promise<boolean> {
  const rows = Object.entries(marksMap).map(([studentRoll, val]) => ({
    id: `em-${examId}-${studentRoll}`,
    exam_id: examId,
    student_roll: studentRoll,
    marks_obtained: val.marks,
    grade: val.grade,
    remarks: val.remarks,
  }))
  if (rows.length === 0) return true
  const { error } = await supabase.from('exam_marks').upsert(rows, { onConflict: 'exam_id,student_roll' })
  if (error) { handleError('upsertExamMarks', error); return false }
  return true
}

// ─── INVOICES ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    studentRoll: row.student_roll,
    studentName: row.student_name,
    classGrade: row.class_grade,
    amount: Number(row.amount),
    dueDate: row.due_date
      ? new Date(row.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    paidDate: row.paid_date
      ? new Date(row.paid_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : undefined,
    status: row.status,
    feeType: row.fee_type,
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { handleError('fetchInvoices', error); return [] }
  return (data ?? []).map(mapInvoice)
}

export async function fetchInvoicesByStudentRoll(roll: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('student_roll', roll)
    .order('created_at', { ascending: false })
  if (error) { handleError('fetchInvoicesByStudentRoll', error); return [] }
  return (data ?? []).map(mapInvoice)
}

export async function upsertInvoice(invoice: Invoice): Promise<boolean> {
  const parseDateForDb = (dateStr?: string) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
    } catch {/* skip */}
    return null
  }
  const { error } = await supabase.from('invoices').upsert({
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    student_roll: invoice.studentRoll,
    student_name: invoice.studentName,
    class_grade: invoice.classGrade,
    amount: invoice.amount,
    due_date: parseDateForDb(invoice.dueDate),
    paid_date: parseDateForDb(invoice.paidDate),
    status: invoice.status,
    fee_type: invoice.feeType,
    academic_year: '2024-2025',
  }, { onConflict: 'id' })
  if (error) { handleError('upsertInvoice', error); return false }
  return true
}

export async function markInvoicePaidDb(id: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'Paid', paid_date: today })
    .eq('id', id)
  if (error) { handleError('markInvoicePaidDb', error); return false }
  return true
}

// ─── LIBRARY BOOKS ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLibraryBook(row: any): LibraryBook {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title,
    author: row.author,
    category: row.category,
    totalCopies: row.total_copies ?? 1,
    copiesAvailable: row.copies_available ?? 1,
    shelfLocation: row.shelf_location ?? '',
  }
}

export async function fetchLibraryBooks(): Promise<LibraryBook[]> {
  const { data, error } = await supabase.from('library_books').select('*').order('title')
  if (error) { handleError('fetchLibraryBooks', error); return [] }
  return (data ?? []).map(mapLibraryBook)
}

export async function upsertLibraryBook(book: LibraryBook): Promise<boolean> {
  const { error } = await supabase.from('library_books').upsert({
    id: book.id,
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    category: book.category,
    total_copies: book.totalCopies,
    copies_available: book.copiesAvailable,
    shelf_location: book.shelfLocation,
  }, { onConflict: 'id' })
  if (error) { handleError('upsertLibraryBook', error); return false }
  return true
}

export async function deleteLibraryBookById(id: string): Promise<boolean> {
  const { error } = await supabase.from('library_books').delete().eq('id', id)
  if (error) { handleError('deleteLibraryBookById', error); return false }
  return true
}

// ─── LIBRARY ISSUES ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBookIssue(row: any): BookIssueRecord {
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    isbn: row.isbn,
    studentRoll: row.student_roll,
    studentName: row.student_name,
    classGrade: row.class_grade,
    issueDate: fmt(row.issue_date),
    dueDate: fmt(row.due_date),
    returnDate: row.return_date ? fmt(row.return_date) : undefined,
    status: row.status,
    fineAmount: Number(row.fine_amount ?? 0),
    remarks: row.remarks ?? '',
  }
}

export async function fetchBookIssues(): Promise<BookIssueRecord[]> {
  const { data, error } = await supabase
    .from('library_issues')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { handleError('fetchBookIssues', error); return [] }
  return (data ?? []).map(mapBookIssue)
}

export async function upsertBookIssue(issue: BookIssueRecord): Promise<boolean> {
  const parseDate = (s: string) => {
    try { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] } catch {/* skip */}
    return null
  }
  const { error } = await supabase.from('library_issues').upsert({
    id: issue.id,
    book_id: issue.bookId,
    book_title: issue.bookTitle,
    isbn: issue.isbn,
    student_roll: issue.studentRoll,
    student_name: issue.studentName,
    class_grade: issue.classGrade,
    issue_date: parseDate(issue.issueDate),
    due_date: parseDate(issue.dueDate),
    return_date: issue.returnDate ? parseDate(issue.returnDate) : null,
    status: issue.status,
    fine_amount: issue.fineAmount,
    remarks: issue.remarks,
  }, { onConflict: 'id' })
  if (error) { handleError('upsertBookIssue', error); return false }
  return true
}

// ─── HOSTEL ROOMS ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHostelRoom(row: any, allocs: any[]): HostelRoom {
  const roomAllocs = allocs.filter((a) => a.room_id === row.id)
  return {
    id: row.id,
    block: row.block,
    roomNumber: row.room_number,
    capacity: row.capacity ?? 4,
    occupied: row.occupied ?? 0,
    warden: row.warden ?? '',
    status: row.status ?? 'Available',
    students: roomAllocs.map((a) => ({
      roll: a.student_roll,
      name: a.student_name,
      classGrade: a.class_grade,
    })),
  }
}

export async function fetchHostelRooms(): Promise<HostelRoom[]> {
  const [roomsResult, allocsResult] = await Promise.all([
    supabase.from('hostel_rooms').select('*').order('block').order('room_number'),
    supabase.from('hostel_allocations').select('*').is('vacated_at', null),
  ])
  if (roomsResult.error) { handleError('fetchHostelRooms', roomsResult.error); return [] }
  const allocs = allocsResult.data ?? []
  return (roomsResult.data ?? []).map((r) => mapHostelRoom(r, allocs))
}

export async function allocateHostelRoomDb(
  roomId: string,
  studentRoll: string,
  studentName: string,
  classGrade: string
): Promise<boolean> {
  const { error: allocError } = await supabase.from('hostel_allocations').upsert({
    id: `ha-${roomId}-${studentRoll}`,
    room_id: roomId,
    student_roll: studentRoll,
    student_name: studentName,
    class_grade: classGrade,
  }, { onConflict: 'room_id,student_roll' })
  if (allocError) { handleError('allocateHostelRoomDb.alloc', allocError); return false }

  // Increment occupied count
  const { error: updateError } = await supabase.rpc('increment_hostel_occupied', { room_id_arg: roomId })
  if (updateError) {
    // Fallback: manual update
    const { data: room } = await supabase.from('hostel_rooms').select('occupied, capacity').eq('id', roomId).single()
    if (room) {
      const newOccupied = (room.occupied ?? 0) + 1
      const newStatus = newOccupied >= (room.capacity ?? 4) ? 'Full' : 'Available'
      await supabase.from('hostel_rooms').update({ occupied: newOccupied, status: newStatus }).eq('id', roomId)
    }
  }
  return true
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExpense(row: any): ExpenseRecord {
  return {
    id: row.id,
    expenseNumber: row.expense_number,
    category: row.category,
    description: row.description,
    vendor: row.vendor,
    amount: Number(row.amount),
    approvedBy: row.approved_by ?? '',
    date: row.expense_date
      ? new Date(row.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    status: row.status,
    paymentMode: row.payment_mode,
    remarks: row.remarks ?? '',
  }
}

export async function fetchExpenses(): Promise<ExpenseRecord[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { handleError('fetchExpenses', error); return [] }
  return (data ?? []).map(mapExpense)
}

export async function upsertExpense(expense: ExpenseRecord): Promise<boolean> {
  const parseDate = (s: string) => {
    try { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] } catch {/* skip */}
    return new Date().toISOString().split('T')[0]
  }
  const { error } = await supabase.from('expenses').upsert({
    id: expense.id,
    expense_number: expense.expenseNumber,
    category: expense.category,
    description: expense.description,
    vendor: expense.vendor,
    amount: expense.amount,
    approved_by: expense.approvedBy,
    expense_date: parseDate(expense.date),
    status: expense.status,
    payment_mode: expense.paymentMode,
    remarks: expense.remarks,
    academic_year: '2024-2025',
  }, { onConflict: 'id' })
  if (error) { handleError('upsertExpense', error); return false }
  return true
}

// ─── ADMISSIONS ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdmission(row: any): AdmissionRecord {
  return {
    id: row.id,
    applicationNumber: row.application_number,
    applicantName: row.applicant_name,
    applyingForClass: row.applying_for_class,
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    applicationDate: row.application_date
      ? new Date(row.application_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    status: row.status,
    interviewDate: row.interview_date
      ? new Date(row.interview_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : undefined,
    remarks: row.remarks ?? '',
  }
}

export async function fetchAdmissions(): Promise<AdmissionRecord[]> {
  const { data, error } = await supabase
    .from('admissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { handleError('fetchAdmissions', error); return [] }
  return (data ?? []).map(mapAdmission)
}

export async function upsertAdmission(admission: AdmissionRecord): Promise<boolean> {
  const parseDate = (s?: string) => {
    if (!s) return null
    try { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] } catch {/* skip */}
    return null
  }
  const { error } = await supabase.from('admissions').upsert({
    id: admission.id,
    application_number: admission.applicationNumber,
    applicant_name: admission.applicantName,
    applying_for_class: admission.applyingForClass,
    guardian_name: admission.guardianName,
    guardian_phone: admission.guardianPhone,
    application_date: parseDate(admission.applicationDate),
    status: admission.status,
    interview_date: parseDate(admission.interviewDate),
    remarks: admission.remarks,
    academic_year: '2024-2025',
  }, { onConflict: 'id' })
  if (error) { handleError('upsertAdmission', error); return false }
  return true
}

// ─── USERS (ERP User Roles) ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserRole(row: any): UserRole {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    designation: row.designation ?? '',
    status: row.status ?? 'Active',
    lastActive: row.last_active ?? 'Recently',
  }
}

export async function fetchUsers(): Promise<UserRole[]> {
  const { data, error } = await supabase.from('users').select('*').order('name')
  if (error) { handleError('fetchUsers', error); return [] }
  return (data ?? []).map(mapUserRole)
}

export async function fetchUserByEmail(email: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (error) { handleError('fetchUserByEmail', error); return null }
  return data ? mapUserRole(data) : null
}
