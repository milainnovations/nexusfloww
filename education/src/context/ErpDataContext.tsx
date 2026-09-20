import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
  UserRole,
  ExpenseRecord,
  BudgetAllocation,
  AdmissionRecord,
} from '../data/mockData'
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_COURSES,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  INITIAL_INVOICES,
  INITIAL_BUS_ROUTES,
  INITIAL_HOSTEL,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_BOOK_ISSUES,
  INITIAL_USERS,
  INITIAL_EXPENSES,
  INITIAL_BUDGET_ALLOCATIONS,
  INITIAL_ADMISSIONS,
} from '../data/mockData'
import * as db from '../services/supabaseService'

interface ErpDataContextType {
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
  usersList: UserRole[]
  expenses: ExpenseRecord[]
  budgetAllocations: BudgetAllocation[]
  admissions: AdmissionRecord[]

  // Loading states
  isLoading: boolean
  loadingError: string | null
  refreshData: () => Promise<void>

  // Stats
  enrolledStudentsCount: number
  facultyCount: number
  totalFeesOutstanding: number
  totalFeesCollected: number
  overdueCount: number
  attendanceWatchCount: number
  lowAttendanceStudents: Student[]
  activeClassesCount: number

  // Actions
  addStudent: (student: Omit<Student, 'id' | 'admissionDate' | 'attendancePct' | 'classesPresent' | 'totalClasses' | 'overallGrade' | 'termPercentage'>) => Student
  updateStudent: (id: string, updates: Partial<Student>) => void
  deleteStudent: (id: string) => void

  addFaculty: (faculty: Omit<Faculty, 'id'>) => Faculty
  updateFaculty: (id: string, updates: Partial<Faculty>) => void

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => TimetableSlot
  removeTimetableSlot: (id: string) => void

  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice
  markInvoicePaid: (id: string) => void

  addExam: (exam: Omit<Exam, 'id'>) => Exam
  updateExamMarks: (examId: string, marksMap: Record<string, { marks: number; grade: string; remarks: string }>) => void
  publishExam: (examId: string) => void
  bulkImportMarksCSV: (records: Array<{ studentRoll: string; subject: string; marksObtained: number; maxMarks: number; term: string; remarks?: string }>) => void

  markAttendanceBulk: (classGrade: string, rollNumbersPresent: string[]) => void
  addCourse: (course: Omit<Course, 'id' | 'enrolledStudentsCount' | 'chaptersCompleted'>) => void
  allocateHostelRoom: (roomId: string, studentRoll: string, studentName: string, classGrade: string) => void

  // Library Actions
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => LibraryBook
  updateLibraryBook: (id: string, updates: Partial<LibraryBook>) => void
  deleteLibraryBook: (id: string) => void
  issueBookToStudent: (bookId: string, studentRoll: string, studentName: string, classGrade: string, dueDateDays?: number) => void
  processBookReturn: (issueId: string) => void
  issueLibraryBook: (bookId: string) => void
  returnLibraryBook: (bookId: string) => void

  // Administration Actions
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'expenseNumber'>) => ExpenseRecord
  updateExpenseStatus: (id: string, status: ExpenseRecord['status']) => void
  addAdmission: (admission: Omit<AdmissionRecord, 'id' | 'applicationNumber'>) => AdmissionRecord
  updateAdmissionStatus: (id: string, status: AdmissionRecord['status'], remarks?: string) => void

  resetData: () => void
}

const ErpDataContext = createContext<ErpDataContextType | undefined>(undefined)

export const ErpDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([])
  const [facultyList, setFacultyList] = useState<Faculty[]>([])
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([])
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([])
  const [bookIssues, setBookIssues] = useState<BookIssueRecord[]>([])
  const [usersList, setUsersList] = useState<UserRole[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  const busRoutes: TransportRoute[] = INITIAL_BUS_ROUTES
  const budgetAllocations: BudgetAllocation[] = INITIAL_BUDGET_ALLOCATIONS

  // Fetch all data from Supabase
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setLoadingError(null)
    try {
      const [
        fetchedStudents,
        fetchedFaculty,
        fetchedCourses,
        fetchedTimetable,
        fetchedExams,
        fetchedInvoices,
        fetchedHostelRooms,
        fetchedBooks,
        fetchedIssues,
        fetchedUsers,
        fetchedExpenses,
        fetchedAdmissions,
      ] = await Promise.all([
        db.fetchStudents(),
        db.fetchFaculty(),
        db.fetchCourses(),
        db.fetchTimetable(),
        db.fetchExams(),
        db.fetchInvoices(),
        db.fetchHostelRooms(),
        db.fetchLibraryBooks(),
        db.fetchBookIssues(),
        db.fetchUsers(),
        db.fetchExpenses(),
        db.fetchAdmissions(),
      ])

      let baseStudents = fetchedStudents.length > 0 ? fetchedStudents : INITIAL_STUDENTS
      try {
        const customStudentsStr = localStorage.getItem('erp_custom_students')
        if (customStudentsStr) {
          const customStudents: Student[] = JSON.parse(customStudentsStr)
          const baseIds = new Set(baseStudents.map((s) => s.id))
          const extra = customStudents.filter((cs) => !baseIds.has(cs.id))
          baseStudents = [...extra, ...baseStudents]
        }
      } catch {
        /* ignore storage errors */
      }
      setStudents(baseStudents)
      setFacultyList(fetchedFaculty.length > 0 ? fetchedFaculty : INITIAL_FACULTY)
      setCourses(fetchedCourses.length > 0 ? fetchedCourses : INITIAL_COURSES)
      setTimetableSlots(fetchedTimetable.length > 0 ? fetchedTimetable : INITIAL_TIMETABLE)
      setExams(fetchedExams.length > 0 ? fetchedExams : INITIAL_EXAMS)
      setInvoices(fetchedInvoices.length > 0 ? fetchedInvoices : INITIAL_INVOICES)
      setHostelRooms(fetchedHostelRooms.length > 0 ? fetchedHostelRooms : INITIAL_HOSTEL)
      setLibraryBooks(fetchedBooks.length > 0 ? fetchedBooks : INITIAL_LIBRARY_BOOKS)
      setBookIssues(fetchedIssues.length > 0 ? fetchedIssues : INITIAL_BOOK_ISSUES)
      setUsersList(fetchedUsers.length > 0 ? fetchedUsers : INITIAL_USERS)
      setExpenses(fetchedExpenses.length > 0 ? fetchedExpenses : INITIAL_EXPENSES)
      setAdmissions(fetchedAdmissions.length > 0 ? fetchedAdmissions : INITIAL_ADMISSIONS)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data from database'
      console.warn('[ErpDataContext] Supabase query notice, applying default dataset:', msg)

      let defaultStudents = INITIAL_STUDENTS
      try {
        const customStudentsStr = localStorage.getItem('erp_custom_students')
        if (customStudentsStr) {
          const customStudents: Student[] = JSON.parse(customStudentsStr)
          const baseIds = new Set(defaultStudents.map((s) => s.id))
          const extra = customStudents.filter((cs) => !baseIds.has(cs.id))
          defaultStudents = [...extra, ...defaultStudents]
        }
      } catch {
        /* ignore storage errors */
      }
      setStudents(defaultStudents)
      setFacultyList(INITIAL_FACULTY)
      setCourses(INITIAL_COURSES)
      setTimetableSlots(INITIAL_TIMETABLE)
      setExams(INITIAL_EXAMS)
      setInvoices(INITIAL_INVOICES)
      setHostelRooms(INITIAL_HOSTEL)
      setLibraryBooks(INITIAL_LIBRARY_BOOKS)
      setBookIssues(INITIAL_BOOK_ISSUES)
      setUsersList(INITIAL_USERS)
      setExpenses(INITIAL_EXPENSES)
      setAdmissions(INITIAL_ADMISSIONS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // ─── Computed Stats ────────────────────────────────────────────────────────
  const enrolledStudentsCount = students.length
  const facultyCount = facultyList.length
  const pendingInvoices = invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue')
  const totalFeesOutstanding = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0)
  const paidInvoices = invoices.filter((i) => i.status === 'Paid')
  const totalFeesCollected = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0)
  const overdueCount = pendingInvoices.length
  const activeClasses = Array.from(new Set(students.map((s) => s.classGrade)))
  const activeClassesCount = activeClasses.length
  const lowAttendanceStudents = students
    .filter((s) => s.attendancePct < 75)
    .sort((a, b) => a.attendancePct - b.attendancePct)
  const attendanceWatchCount = lowAttendanceStudents.length

  // ─── Student Handlers ──────────────────────────────────────────────────────
  const addStudent = (data: Omit<Student, 'id' | 'admissionDate' | 'attendancePct' | 'classesPresent' | 'totalClasses' | 'overallGrade' | 'termPercentage'>) => {
    const classTag = (data.classGrade || 'Class 8-A').replace(/[^0-9A-Z]/gi, '').toUpperCase()
    const autoRollNumber = data.rollNumber || `SCH-${classTag}-${String(students.length + 1).padStart(2, '0')}`
    const autoEmail = data.email || `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.school.edu`

    const newStudent: Student = {
      ...data,
      rollNumber: autoRollNumber,
      email: autoEmail,
      id: `s-${Date.now()}`,
      admissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      attendancePct: 0,
      classesPresent: 0,
      totalClasses: 0,
      overallGrade: 'Pending Evaluation',
      termPercentage: 0,
    }

    setStudents((prev) => [newStudent, ...prev])
    db.upsertStudent(newStudent) // async, fire-and-forget

    // Provision User Role for authentication & login
    const newUser: UserRole = {
      id: `usr-${newStudent.id}`,
      name: newStudent.name,
      email: newStudent.email,
      role: 'Student',
      designation: `Student — ${newStudent.classGrade} (Roll #${newStudent.rollNumber})`,
      lastActive: 'Just registered',
      status: 'Active',
    }

    setUsersList((prev) => {
      if (prev.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) return prev
      return [...prev, newUser]
    })

    // Store initial default password (School@1234), forced password change flag, and exact student profile
    try {
      localStorage.setItem(`erp_user_pwd_${newStudent.email.toLowerCase()}`, 'School@1234')
      localStorage.setItem(`erp_must_change_pwd_${newStudent.email.toLowerCase()}`, 'true')
      localStorage.setItem(`erp_student_profile_${newStudent.email.toLowerCase()}`, JSON.stringify(newStudent))

      const customStudentsStr = localStorage.getItem('erp_custom_students') || '[]'
      const existing: Student[] = JSON.parse(customStudentsStr)
      const updatedList = [newStudent, ...existing.filter((s) => s.id !== newStudent.id)]
      localStorage.setItem('erp_custom_students', JSON.stringify(updatedList))
    } catch {
      /* ignore storage errors */
    }

    return newStudent
  }

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      const target = updated.find((s) => s.id === id)
      if (target) db.upsertStudent(target)
      return updated
    })
  }

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    db.deleteStudentById(id)
  }

  // ─── Faculty Handlers ──────────────────────────────────────────────────────
  const addFaculty = (data: Omit<Faculty, 'id'>) => {
    const newFaculty: Faculty = { ...data, id: `f-${Date.now()}` }
    setFacultyList((prev) => [...prev, newFaculty])
    db.upsertFaculty(newFaculty)
    return newFaculty
  }

  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFacultyList((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      const target = updated.find((f) => f.id === id)
      if (target) db.upsertFaculty(target)
      return updated
    })
  }

  // ─── Timetable Handlers ────────────────────────────────────────────────────
  const addTimetableSlot = (data: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = { ...data, id: `tt-${Date.now()}` }
    setTimetableSlots((prev) => [...prev, newSlot])
    db.upsertTimetableSlot(newSlot)
    return newSlot
  }

  const removeTimetableSlot = (id: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id))
    db.deleteTimetableSlot(id)
  }

  // ─── Invoice Handlers ──────────────────────────────────────────────────────
  const addInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: `SCH-INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
    }
    setInvoices((prev) => [newInvoice, ...prev])
    db.upsertInvoice(newInvoice)
    return newInvoice
  }

  const markInvoicePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: 'Paid' as const, paidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
          : inv
      )
    )
    db.markInvoicePaidDb(id)
  }

  // ─── Exam Handlers ─────────────────────────────────────────────────────────
  const addExam = (data: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...data, id: `ex-${Date.now()}` }
    setExams((prev) => [newExam, ...prev])
    db.upsertExam(newExam)
    return newExam
  }

  const updateExamMarks = (examId: string, marksMap: Record<string, { marks: number; grade: string; remarks: string }>) => {
    setExams((prev) =>
      prev.map((ex) =>
        ex.id === examId ? { ...ex, marksMap: { ...ex.marksMap, ...marksMap }, status: 'Evaluated' as const } : ex
      )
    )
    db.upsertExamMarks(examId, marksMap)
  }

  const publishExam = (examId: string) => {
    setExams((prev) =>
      prev.map((ex) => (ex.id === examId ? { ...ex, status: 'Published' as const } : ex))
    )
    const exam = exams.find((e) => e.id === examId)
    if (exam) db.upsertExam({ ...exam, status: 'Published' })
  }

  const bulkImportMarksCSV = (
    records: Array<{ studentRoll: string; subject: string; marksObtained: number; maxMarks: number; term: string; remarks?: string }>
  ) => {
    setExams((prevExams) => {
      let updatedExams = [...prevExams]
      records.forEach((rec) => {
        const pct = (rec.marksObtained / rec.maxMarks) * 100
        let grade = 'F'
        if (pct >= 90) grade = 'A1'
        else if (pct >= 80) grade = 'A2'
        else if (pct >= 70) grade = 'B1'
        else if (pct >= 60) grade = 'B2'
        else if (pct >= 50) grade = 'C1'
        else if (pct >= 33) grade = 'C2'

        const targetExamIndex = updatedExams.findIndex(
          (e) => e.subject.toLowerCase() === rec.subject.toLowerCase() && e.term === rec.term
        )

        if (targetExamIndex >= 0) {
          const ex = updatedExams[targetExamIndex]
          const newMarksMap = {
            ...ex.marksMap,
            [rec.studentRoll]: { marks: rec.marksObtained, grade, remarks: rec.remarks || 'Uploaded via Principal CSV Import' },
          }
          updatedExams[targetExamIndex] = { ...ex, status: 'Published', marksMap: newMarksMap }
          db.upsertExamMarks(ex.id, newMarksMap)
        } else {
          const newEx: Exam = {
            id: `ex-csv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: `${rec.subject} ${rec.term} Assessment`,
            term: (rec.term as Exam['term']) || 'Term 2',
            classGrade: 'Class 8-A',
            subject: rec.subject,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            maxMarks: rec.maxMarks,
            conductedBy: 'Principal CSV Bulk Import',
            status: 'Published',
            marksMap: { [rec.studentRoll]: { marks: rec.marksObtained, grade, remarks: rec.remarks || 'Uploaded via Principal CSV Import' } },
          }
          updatedExams.push(newEx)
          db.upsertExam(newEx).then(() => db.upsertExamMarks(newEx.id, newEx.marksMap))
        }
      })
      return updatedExams
    })
  }

  // ─── Attendance ────────────────────────────────────────────────────────────
  const markAttendanceBulk = (classGrade: string, rollNumbersPresent: string[]) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.classGrade !== classGrade) return s
        const isPresent = rollNumbersPresent.includes(s.rollNumber)
        const total = s.totalClasses + 1
        const present = s.classesPresent + (isPresent ? 1 : 0)
        const pct = Number(((present / total) * 100).toFixed(1))
        const updated = { ...s, totalClasses: total, classesPresent: present, attendancePct: pct }
        db.updateStudentAttendance(s.rollNumber, present, total, pct)
        return updated
      })
    )
  }

  // ─── Course Handlers ───────────────────────────────────────────────────────
  const addCourse = (data: Omit<Course, 'id' | 'enrolledStudentsCount' | 'chaptersCompleted'>) => {
    const newCourse: Course = {
      ...data,
      id: `c-${Date.now()}`,
      enrolledStudentsCount: students.filter((s) => s.classGrade === data.classGrade).length || 5,
      chaptersCompleted: 0,
    }
    setCourses((prev) => [...prev, newCourse])
    db.upsertCourse(newCourse)
  }

  // ─── Hostel Handlers ───────────────────────────────────────────────────────
  const allocateHostelRoom = (roomId: string, studentRoll: string, studentName: string, classGrade: string) => {
    setHostelRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && r.occupied < r.capacity) {
          const updatedStudents = [...r.students, { roll: studentRoll, name: studentName, classGrade }]
          return { ...r, occupied: updatedStudents.length, students: updatedStudents, status: updatedStudents.length >= r.capacity ? 'Full' : 'Available' }
        }
        return r
      })
    )
    db.allocateHostelRoomDb(roomId, studentRoll, studentName, classGrade)
  }

  // ─── Library Handlers ──────────────────────────────────────────────────────
  const addLibraryBook = (data: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = { ...data, id: `bk-${Date.now()}` }
    setLibraryBooks((prev) => [newBook, ...prev])
    db.upsertLibraryBook(newBook)
    return newBook
  }

  const updateLibraryBook = (id: string, updates: Partial<LibraryBook>) => {
    setLibraryBooks((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      const target = updated.find((b) => b.id === id)
      if (target) db.upsertLibraryBook(target)
      return updated
    })
  }

  const deleteLibraryBook = (id: string) => {
    setLibraryBooks((prev) => prev.filter((b) => b.id !== id))
    db.deleteLibraryBookById(id)
  }

  const issueBookToStudent = (bookId: string, studentRoll: string, studentName: string, classGrade: string, dueDateDays = 14) => {
    const targetBook = libraryBooks.find((b) => b.id === bookId)
    if (!targetBook || targetBook.copiesAvailable <= 0) return

    const now = new Date()
    const due = new Date()
    due.setDate(now.getDate() + dueDateDays)
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const newIssue: BookIssueRecord = {
      id: `iss-${Date.now()}`,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      isbn: targetBook.isbn,
      studentRoll,
      studentName,
      classGrade,
      issueDate: fmt(now),
      dueDate: fmt(due),
      status: 'Issued',
      fineAmount: 0,
      remarks: 'Issued by Library Administrator',
    }
    setBookIssues((prev) => [newIssue, ...prev])
    setLibraryBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b)))
    db.upsertBookIssue(newIssue)
    const updatedBook = libraryBooks.find((b) => b.id === bookId)
    if (updatedBook) db.upsertLibraryBook({ ...updatedBook, copiesAvailable: updatedBook.copiesAvailable - 1 })
  }

  const processBookReturn = (issueId: string) => {
    const issue = bookIssues.find((i) => i.id === issueId)
    if (!issue || issue.status === 'Returned') return
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const returnedIssue = { ...issue, status: 'Returned' as const, returnDate: nowStr }
    setBookIssues((prev) => prev.map((i) => (i.id === issueId ? returnedIssue : i)))
    setLibraryBooks((prev) =>
      prev.map((b) => b.id === issue.bookId && b.copiesAvailable < b.totalCopies ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b)
    )
    db.upsertBookIssue(returnedIssue)
    const book = libraryBooks.find((b) => b.id === issue.bookId)
    if (book && book.copiesAvailable < book.totalCopies) db.upsertLibraryBook({ ...book, copiesAvailable: book.copiesAvailable + 1 })
  }

  const issueLibraryBook = (bookId: string) => {
    setLibraryBooks((prev) => prev.map((b) => (b.id === bookId && b.copiesAvailable > 0 ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b)))
    const book = libraryBooks.find((b) => b.id === bookId)
    if (book && book.copiesAvailable > 0) db.upsertLibraryBook({ ...book, copiesAvailable: book.copiesAvailable - 1 })
  }

  const returnLibraryBook = (bookId: string) => {
    setLibraryBooks((prev) => prev.map((b) => (b.id === bookId && b.copiesAvailable < b.totalCopies ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b)))
    const book = libraryBooks.find((b) => b.id === bookId)
    if (book && book.copiesAvailable < book.totalCopies) db.upsertLibraryBook({ ...book, copiesAvailable: book.copiesAvailable + 1 })
  }

  // ─── Administration Handlers ───────────────────────────────────────────────
  const addExpense = (data: Omit<ExpenseRecord, 'id' | 'expenseNumber'>) => {
    const newExpense: ExpenseRecord = {
      ...data,
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2024-${String(expenses.length + 1).padStart(3, '0')}`,
    }
    setExpenses((prev) => [newExpense, ...prev])
    db.upsertExpense(newExpense)
    return newExpense
  }

  const updateExpenseStatus = (id: string, status: ExpenseRecord['status']) => {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, status } : e))
      const target = updated.find((e) => e.id === id)
      if (target) db.upsertExpense(target)
      return updated
    })
  }

  const addAdmission = (data: Omit<AdmissionRecord, 'id' | 'applicationNumber'>) => {
    const newAdmission: AdmissionRecord = {
      ...data,
      id: `adm-${Date.now()}`,
      applicationNumber: `ADM-2024-${String(admissions.length + 1).padStart(3, '0')}`,
    }
    setAdmissions((prev) => [newAdmission, ...prev])
    db.upsertAdmission(newAdmission)
    return newAdmission
  }

  const updateAdmissionStatus = (id: string, status: AdmissionRecord['status'], remarks?: string) => {
    setAdmissions((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, status, ...(remarks ? { remarks } : {}) } : a))
      const target = updated.find((a) => a.id === id)
      if (target) {
        db.upsertAdmission(target)
        // Auto-provision student profile & user login account upon admission approval
        if (status === 'Admitted') {
          const studentEmail = `${target.applicantName.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.school.edu`
          const existing = students.find(
            (s) => s.email.toLowerCase() === studentEmail.toLowerCase() || s.name.toLowerCase() === target.applicantName.toLowerCase()
          )
          if (!existing) {
            addStudent({
              rollNumber: '',
              name: target.applicantName,
              email: studentEmail,
              gender: 'Male',
              classGrade: target.applyingForClass || 'Class 6-A',
              section: 'A',
              academicYear: '2024-2025',
              phone: target.guardianPhone || '+91 98765 00000',
              busRoute: 'Private / Walker',
              guardianName: target.guardianName || 'Guardian',
              guardianRelation: 'Father',
              guardianPhone: target.guardianPhone || '+91 98765 00000',
              address: 'Greenwood Campus Residence',
              dues: 25000,
              dateOfBirth: '2012-01-01',
              bloodGroup: 'O+',
              remarks: `Admitted via Application #${target.applicationNumber}`,
            })
          }
        }
      }
      return updated
    })
  }

  const resetData = () => {
    refreshData()
  }

  return (
    <ErpDataContext.Provider
      value={{
        students,
        facultyList,
        timetableSlots,
        courses,
        exams,
        invoices,
        busRoutes,
        hostelRooms,
        libraryBooks,
        bookIssues,
        usersList,
        expenses,
        budgetAllocations,
        admissions,
        isLoading,
        loadingError,
        refreshData,
        enrolledStudentsCount,
        facultyCount,
        totalFeesOutstanding,
        totalFeesCollected,
        overdueCount,
        attendanceWatchCount,
        lowAttendanceStudents,
        activeClassesCount,
        addStudent,
        updateStudent,
        deleteStudent,
        addFaculty,
        updateFaculty,
        addTimetableSlot,
        removeTimetableSlot,
        addInvoice,
        markInvoicePaid,
        addExam,
        updateExamMarks,
        publishExam,
        bulkImportMarksCSV,
        markAttendanceBulk,
        addCourse,
        allocateHostelRoom,
        addLibraryBook,
        updateLibraryBook,
        deleteLibraryBook,
        issueBookToStudent,
        processBookReturn,
        issueLibraryBook,
        returnLibraryBook,
        addExpense,
        updateExpenseStatus,
        addAdmission,
        updateAdmissionStatus,
        resetData,
      }}
    >
      {children}
    </ErpDataContext.Provider>
  )
}

export const useErpData = () => {
  const context = useContext(ErpDataContext)
  if (!context) {
    throw new Error('useErpData must be used within an ErpDataProvider')
  }
  return context
}
