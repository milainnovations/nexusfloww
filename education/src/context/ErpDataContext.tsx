import React, { createContext, useContext, useState, useEffect } from 'react'
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
  INITIAL_TIMETABLE,
  INITIAL_COURSES,
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
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edu_students_v1')
    if (!saved) return INITIAL_STUDENTS
    const parsed: Student[] = JSON.parse(saved)
    // Migration: backfill gender field if missing (added after initial release)
    const genderMap: Record<string, 'Male' | 'Female'> = {
      'SCH-8A-01': 'Male', 'SCH-8A-02': 'Female', 'SCH-8A-03': 'Male',
      'SCH-8A-04': 'Female', 'SCH-8A-05': 'Male', 'SCH-6B-01': 'Female',
      'SCH-7A-01': 'Male', 'SCH-10A-01': 'Female',
    }
    return parsed.map((s) => s.gender ? s : { ...s, gender: genderMap[s.rollNumber] ?? 'Male' })
  })

  const [facultyList, setFacultyList] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem('edu_faculty_v1')
    return saved ? JSON.parse(saved) : INITIAL_FACULTY
  })

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('edu_timetable_v1')
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE
  })

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('edu_courses_v1')
    return saved ? JSON.parse(saved) : INITIAL_COURSES
  })

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('edu_exams_v1')
    return saved ? JSON.parse(saved) : INITIAL_EXAMS
  })

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('edu_invoices_v1')
    return saved ? JSON.parse(saved) : INITIAL_INVOICES
  })

  const [busRoutes] = useState<TransportRoute[]>(INITIAL_BUS_ROUTES)

  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(() => {
    const saved = localStorage.getItem('edu_hostel_v1')
    return saved ? JSON.parse(saved) : INITIAL_HOSTEL
  })

  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem('edu_library_v1')
    return saved ? JSON.parse(saved) : INITIAL_LIBRARY_BOOKS
  })

  const [bookIssues, setBookIssues] = useState<BookIssueRecord[]>(() => {
    const saved = localStorage.getItem('edu_book_issues_v1')
    return saved ? JSON.parse(saved) : INITIAL_BOOK_ISSUES
  })

  const [usersList, setUsersList] = useState<UserRole[]>(() => {
    const saved = localStorage.getItem('edu_users_v1')
    return saved ? JSON.parse(saved) : INITIAL_USERS
  })

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('edu_expenses_v1')
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES
  })

  const [budgetAllocations] = useState<BudgetAllocation[]>(INITIAL_BUDGET_ALLOCATIONS)

  const [admissions, setAdmissions] = useState<AdmissionRecord[]>(() => {
    const saved = localStorage.getItem('edu_admissions_v1')
    return saved ? JSON.parse(saved) : INITIAL_ADMISSIONS
  })

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('edu_students_v1', JSON.stringify(students))
  }, [students])

  useEffect(() => {
    localStorage.setItem('edu_faculty_v1', JSON.stringify(facultyList))
  }, [facultyList])

  useEffect(() => {
    localStorage.setItem('edu_timetable_v1', JSON.stringify(timetableSlots))
  }, [timetableSlots])

  useEffect(() => {
    localStorage.setItem('edu_courses_v1', JSON.stringify(courses))
  }, [courses])

  useEffect(() => {
    localStorage.setItem('edu_exams_v1', JSON.stringify(exams))
  }, [exams])

  useEffect(() => {
    localStorage.setItem('edu_invoices_v1', JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem('edu_library_v1', JSON.stringify(libraryBooks))
  }, [libraryBooks])

  useEffect(() => {
    localStorage.setItem('edu_book_issues_v1', JSON.stringify(bookIssues))
  }, [bookIssues])

  useEffect(() => {
    localStorage.setItem('edu_expenses_v1', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('edu_admissions_v1', JSON.stringify(admissions))
  }, [admissions])

  // Calculated Metrics
  const enrolledStudentsCount = students.length
  const facultyCount = facultyList.length

  const pendingInvoices = invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue')
  const totalFeesOutstanding = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0)
  const paidInvoices = invoices.filter((i) => i.status === 'Paid')
  const totalFeesCollected = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0)
  const overdueCount = pendingInvoices.length

  const activeClasses = Array.from(new Set(students.map((s) => s.classGrade)))
  const activeClassesCount = activeClasses.length

  // Students with attendance < 75%
  const lowAttendanceStudents = students
    .filter((s) => s.attendancePct < 75)
    .sort((a, b) => a.attendancePct - b.attendancePct)

  const attendanceWatchCount = lowAttendanceStudents.length

  // Handlers
  const addStudent = (data: Omit<Student, 'id' | 'admissionDate' | 'attendancePct' | 'classesPresent' | 'totalClasses' | 'overallGrade' | 'termPercentage'>) => {
    const newStudent: Student = {
      ...data,
      id: `s-${Date.now()}`,
      admissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      attendancePct: 100,
      classesPresent: 1,
      totalClasses: 1,
      overallGrade: 'A1',
      termPercentage: 85,
    }
    setStudents((prev) => [newStudent, ...prev])
    return newStudent
  }

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  const addFaculty = (data: Omit<Faculty, 'id'>) => {
    const newFaculty: Faculty = {
      ...data,
      id: `f-${Date.now()}`,
    }
    setFacultyList((prev) => [...prev, newFaculty])
    return newFaculty
  }

  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFacultyList((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const addTimetableSlot = (data: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...data,
      id: `tt-${Date.now()}`,
    }
    setTimetableSlots((prev) => [...prev, newSlot])
    return newSlot
  }

  const removeTimetableSlot = (id: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const addInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: `SCH-INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
    }
    setInvoices((prev) => [newInvoice, ...prev])
    return newInvoice
  }

  const markInvoicePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'Paid' as const,
              paidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            }
          : inv
      )
    )
  }

  const addExam = (data: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...data,
      id: `ex-${Date.now()}`,
    }
    setExams((prev) => [newExam, ...prev])
    return newExam
  }

  const updateExamMarks = (examId: string, marksMap: Record<string, { marks: number; grade: string; remarks: string }>) => {
    setExams((prev) =>
      prev.map((ex) =>
        ex.id === examId
          ? {
              ...ex,
              marksMap: { ...ex.marksMap, ...marksMap },
              status: 'Evaluated' as const,
            }
          : ex
      )
    )
  }

  const publishExam = (examId: string) => {
    setExams((prev) =>
      prev.map((ex) => (ex.id === examId ? { ...ex, status: 'Published' as const } : ex))
    )
  }

  const bulkImportMarksCSV = (
    records: Array<{
      studentRoll: string
      subject: string
      marksObtained: number
      maxMarks: number
      term: string
      remarks?: string
    }>
  ) => {
    setExams((prevExams) => {
      let updatedExams = [...prevExams]

      records.forEach((rec) => {
        // Calculate grade
        const pct = (rec.marksObtained / rec.maxMarks) * 100
        let grade = 'F'
        if (pct >= 90) grade = 'A1'
        else if (pct >= 80) grade = 'A2'
        else if (pct >= 70) grade = 'B1'
        else if (pct >= 60) grade = 'B2'
        else if (pct >= 50) grade = 'C1'
        else if (pct >= 33) grade = 'C2'

        // Match existing exam by subject and term or create new
        const targetExamIndex = updatedExams.findIndex(
          (e) => e.subject.toLowerCase() === rec.subject.toLowerCase() && e.term === rec.term
        )

        if (targetExamIndex >= 0) {
          const ex = updatedExams[targetExamIndex]
          updatedExams[targetExamIndex] = {
            ...ex,
            status: 'Published',
            marksMap: {
              ...ex.marksMap,
              [rec.studentRoll]: {
                marks: rec.marksObtained,
                grade,
                remarks: rec.remarks || 'Uploaded via Principal CSV Import',
              },
            },
          }
        } else {
          // Create new exam record for this subject
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
            marksMap: {
              [rec.studentRoll]: {
                marks: rec.marksObtained,
                grade,
                remarks: rec.remarks || 'Uploaded via Principal CSV Import',
              },
            },
          }
          updatedExams.push(newEx)
        }
      })

      return updatedExams
    })
  }

  const markAttendanceBulk = (classGrade: string, rollNumbersPresent: string[]) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.classGrade !== classGrade) return s
        const isPresent = rollNumbersPresent.includes(s.rollNumber)
        const total = s.totalClasses + 1
        const present = s.classesPresent + (isPresent ? 1 : 0)
        const pct = Number(((present / total) * 100).toFixed(1))
        return {
          ...s,
          totalClasses: total,
          classesPresent: present,
          attendancePct: pct,
        }
      })
    )
  }

  const addCourse = (data: Omit<Course, 'id' | 'enrolledStudentsCount' | 'chaptersCompleted'>) => {
    const newCourse: Course = {
      ...data,
      id: `c-${Date.now()}`,
      enrolledStudentsCount: students.filter((s) => s.classGrade === data.classGrade).length || 5,
      chaptersCompleted: 0,
    }
    setCourses((prev) => [...prev, newCourse])
  }

  const allocateHostelRoom = (roomId: string, studentRoll: string, studentName: string, classGrade: string) => {
    setHostelRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && r.occupied < r.capacity) {
          const updatedStudents = [...r.students, { roll: studentRoll, name: studentName, classGrade }]
          return {
            ...r,
            occupied: updatedStudents.length,
            students: updatedStudents,
            status: updatedStudents.length >= r.capacity ? 'Full' : 'Available',
          }
        }
        return r
      })
    )
  }

  const addLibraryBook = (data: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = {
      ...data,
      id: `bk-${Date.now()}`,
    }
    setLibraryBooks((prev) => [newBook, ...prev])
    return newBook
  }

  const updateLibraryBook = (id: string, updates: Partial<LibraryBook>) => {
    setLibraryBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const deleteLibraryBook = (id: string) => {
    setLibraryBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const issueBookToStudent = (
    bookId: string,
    studentRoll: string,
    studentName: string,
    classGrade: string,
    dueDateDays: number = 14
  ) => {
    const targetBook = libraryBooks.find((b) => b.id === bookId)
    if (!targetBook || targetBook.copiesAvailable <= 0) return

    const now = new Date()
    const due = new Date()
    due.setDate(now.getDate() + dueDateDays)

    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const newIssue: BookIssueRecord = {
      id: `iss-${Date.now()}`,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      isbn: targetBook.isbn,
      studentRoll,
      studentName,
      classGrade,
      issueDate: formatDate(now),
      dueDate: formatDate(due),
      status: 'Issued',
      fineAmount: 0,
      remarks: 'Issued by Library Administrator',
    }

    setBookIssues((prev) => [newIssue, ...prev])
    setLibraryBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b))
    )
  }

  const processBookReturn = (issueId: string) => {
    const issue = bookIssues.find((i) => i.id === issueId)
    if (!issue || issue.status === 'Returned') return

    const nowStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    setBookIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: 'Returned', returnDate: nowStr } : i))
    )

    setLibraryBooks((prev) =>
      prev.map((b) =>
        b.id === issue.bookId && b.copiesAvailable < b.totalCopies
          ? { ...b, copiesAvailable: b.copiesAvailable + 1 }
          : b
      )
    )
  }

  const issueLibraryBook = (bookId: string) => {
    setLibraryBooks((prev) =>
      prev.map((b) => (b.id === bookId && b.copiesAvailable > 0 ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b))
    )
  }

  const returnLibraryBook = (bookId: string) => {
    setLibraryBooks((prev) =>
      prev.map((b) => (b.id === bookId && b.copiesAvailable < b.totalCopies ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b))
    )
  }

  // Administration Handlers
  const addExpense = (data: Omit<ExpenseRecord, 'id' | 'expenseNumber'>) => {
    const newExpense: ExpenseRecord = {
      ...data,
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2024-${String(expenses.length + 1).padStart(3, '0')}`,
    }
    setExpenses((prev) => [newExpense, ...prev])
    return newExpense
  }

  const updateExpenseStatus = (id: string, status: ExpenseRecord['status']) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
  }

  const addAdmission = (data: Omit<AdmissionRecord, 'id' | 'applicationNumber'>) => {
    const newAdmission: AdmissionRecord = {
      ...data,
      id: `adm-${Date.now()}`,
      applicationNumber: `ADM-2024-${String(admissions.length + 1).padStart(3, '0')}`,
    }
    setAdmissions((prev) => [newAdmission, ...prev])
    return newAdmission
  }

  const updateAdmissionStatus = (id: string, status: AdmissionRecord['status'], remarks?: string) => {
    setAdmissions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, ...(remarks ? { remarks } : {}) } : a))
    )
  }

  const resetData = () => {
    setStudents(INITIAL_STUDENTS)
    setFacultyList(INITIAL_FACULTY)
    setTimetableSlots(INITIAL_TIMETABLE)
    setCourses(INITIAL_COURSES)
    setExams(INITIAL_EXAMS)
    setInvoices(INITIAL_INVOICES)
    setHostelRooms(INITIAL_HOSTEL)
    setLibraryBooks(INITIAL_LIBRARY_BOOKS)
    setBookIssues(INITIAL_BOOK_ISSUES)
    setUsersList(INITIAL_USERS)
    setExpenses(INITIAL_EXPENSES)
    setAdmissions(INITIAL_ADMISSIONS)
    localStorage.clear()
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
