export interface Student {
  id: string
  rollNumber: string
  name: string
  email: string
  classGrade: string // e.g. 'Class 8-A', 'Class 6-B', 'Class 10-A'
  section: string // 'A' | 'B'
  academicYear: string
  attendancePct: number
  classesPresent: number
  totalClasses: number
  overallGrade: string // 'A1' | 'A2' | 'B1' | 'B2'
  termPercentage: number
  phone: string
  busRoute: string
  guardianName: string
  guardianRelation: string
  guardianPhone: string
  address: string
  dues: number
  admissionDate: string
  dateOfBirth: string
  bloodGroup: string
  remarks: string
}

export interface Faculty {
  id: string
  teacherCode: string
  name: string
  email: string
  department: string // e.g. 'Mathematics & Statistics', 'Science & Technology', 'Languages'
  designation: string // e.g. 'Senior Teacher', 'Head of Science', 'Class Teacher (8-A)'
  assignedClasses: string[] // e.g. ['Class 8-A', 'Class 9-B', 'Class 10-A']
  subjectsTaught: string[] // e.g. ['Mathematics', 'Applied Science']
  isClassTeacherOf?: string // e.g. 'Class 8-A'
  cabin: string
  phone: string
  qualification: string
  experienceYears: number
  status: 'Active' | 'On Leave'
}

export interface TimetableSlot {
  id: string
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  period: string // 'Period 1 (08:30–09:15)', 'Period 2 (09:15–10:00)', etc.
  time: string
  subjectCode: string
  subjectName: string
  classGrade: string // e.g. 'Class 8-A'
  room: string
  teacher: string
  type: 'Theory' | 'Lab / Practical' | 'Activity'
}

export interface Course {
  id: string
  code: string
  name: string
  classGrade: string
  department: string
  periodsPerWeek: number
  type: 'Core Academic' | 'Co-Curricular' | 'Laboratory'
  facultyInCharge: string
  enrolledStudentsCount: number
  syllabusChaptersCount: number
  chaptersCompleted: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  studentRoll: string
  studentName: string
  classGrade: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'Pending' | 'Paid' | 'Overdue'
  feeType: 'Term 1 Tuition Fee' | 'School Bus & Transport' | 'Annual Activity & Lab' | 'Uniform & Books Kit'
}

export interface Exam {
  id: string
  name: string // e.g. 'Term 1 Half-Yearly Examination 2024', 'Unit Test 1 - September'
  term: 'Term 1' | 'Term 2' | 'Unit Assessment'
  classGrade: string
  subject: string
  date: string
  maxMarks: number
  conductedBy: string
  status: 'Scheduled' | 'Conducted' | 'Evaluated' | 'Published'
  marksMap: Record<string, { marks: number; grade: string; remarks: string }> // studentRoll -> marks
}

export interface AttendanceRecord {
  id: string
  date: string
  classGrade: string
  subject: string
  teacher: string
  attendanceMap: Record<string, 'Present' | 'Absent' | 'Late'>
}

export interface TransportRoute {
  id: string
  routeNumber: string // 'Route 04 (North City)'
  busNumber: string // 'KA-01-EB-4210'
  driverName: string
  driverPhone: string
  attendantName: string
  capacity: number
  occupied: number
  stops: string[]
  status: 'On Time' | 'Delayed' | 'Completed'
}

export interface HostelRoom {
  id: string
  block: 'Junior Boys Wing' | 'Senior Boys Wing' | 'Girls Wing'
  roomNumber: string
  capacity: number
  occupied: number
  students: { roll: string; name: string; classGrade: string }[]
  warden: string
  status: 'Available' | 'Full' | 'Maintenance'
}

export interface LibraryBook {
  id: string
  isbn: string
  title: string
  author: string
  category: 'Science & Nature' | 'Mathematics' | 'Literature & Fiction' | 'History & Civics' | 'Encyclopedias'
  copiesAvailable: number
  totalCopies: number
  shelfLocation: string
}

export interface BookIssueRecord {
  id: string
  bookId: string
  bookTitle: string
  isbn: string
  studentRoll: string
  studentName: string
  classGrade: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: 'Issued' | 'Returned' | 'Overdue'
  fineAmount: number
  remarks?: string
}

export interface UserRole {
  id: string
  name: string
  email: string
  role: 'Super Admin' | 'Principal' | 'Teacher' | 'Student' | 'Parent' | 'Library Admin'
  designation: string
  lastActive: string
  status: 'Active' | 'Invited' | 'Suspended'
}

/* ----------------------------------------------------
   STUDENTS DATASET (SCHOOL GRADES 6 TO 10)
---------------------------------------------------- */
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-1',
    rollNumber: 'SCH-8A-01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@demo.com',
    classGrade: 'Class 8-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 71.2,
    classesPresent: 47,
    totalClasses: 66,
    overallGrade: 'A2',
    termPercentage: 84.5,
    phone: '+91 98765 43201',
    busRoute: 'Bus Route 04 (North City)',
    guardianName: 'Suresh Sharma',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00001',
    address: 'Flat 402, Green Meadows, Bengaluru',
    dues: 25000,
    admissionDate: '10 Jun 2024',
    dateOfBirth: '14 Nov 2011',
    bloodGroup: 'B+',
    remarks: 'Consistent performer; needs slight focus in Science practicals.',
  },
  {
    id: 's-2',
    rollNumber: 'SCH-8A-02',
    name: 'Sneha Patel',
    email: 'sneha.patel@demo.com',
    classGrade: 'Class 8-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 92.5,
    classesPresent: 61,
    totalClasses: 66,
    overallGrade: 'A1',
    termPercentage: 94.2,
    phone: '+91 98765 43202',
    busRoute: 'Bus Route 02 (Indiranagar)',
    guardianName: 'Ramesh Patel',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00002',
    address: 'B-12, Palm Residency, Bengaluru',
    dues: 0,
    admissionDate: '10 Jun 2024',
    dateOfBirth: '22 Mar 2011',
    bloodGroup: 'O+',
    remarks: 'Class Monitor; outstanding analytical ability in Mathematics.',
  },
  {
    id: 's-3',
    rollNumber: 'SCH-8A-03',
    name: 'Amit Kumar',
    email: 'amit.kumar@demo.com',
    classGrade: 'Class 8-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 71.2,
    classesPresent: 47,
    totalClasses: 66,
    overallGrade: 'B1',
    termPercentage: 76.8,
    phone: '+91 98765 43203',
    busRoute: 'Bus Route 06 (Whitefield)',
    guardianName: 'Sunil Kumar',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00003',
    address: '14/3, Indira Nagar, Bengaluru',
    dues: 45000,
    admissionDate: '11 Jun 2024',
    dateOfBirth: '05 Aug 2011',
    bloodGroup: 'A+',
    remarks: 'Active in sports; encouraged to attend remedial English sessions.',
  },
  {
    id: 's-4',
    rollNumber: 'SCH-8A-04',
    name: 'Pooja Gupta',
    email: 'pooja.gupta@demo.com',
    classGrade: 'Class 8-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 72.7,
    classesPresent: 48,
    totalClasses: 66,
    overallGrade: 'A2',
    termPercentage: 82.4,
    phone: '+91 98765 43204',
    busRoute: 'Bus Route 01 (Koramangala)',
    guardianName: 'Deepak Gupta',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00004',
    address: '89, Koramangala 4th Block, Bengaluru',
    dues: 60000,
    admissionDate: '12 Jun 2024',
    dateOfBirth: '19 Jan 2011',
    bloodGroup: 'AB+',
    remarks: 'Strong creative writing skills and active in cultural debates.',
  },
  {
    id: 's-5',
    rollNumber: 'SCH-8A-05',
    name: 'Rohit Jain',
    email: 'rohit.jain@demo.com',
    classGrade: 'Class 8-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 74.0,
    classesPresent: 49,
    totalClasses: 66,
    overallGrade: 'B1',
    termPercentage: 75.0,
    phone: '+91 98765 43205',
    busRoute: 'Bus Route 04 (North City)',
    guardianName: 'Mahaveer Jain',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00005',
    address: '22, Ring Road, Bengaluru',
    dues: 70000,
    admissionDate: '12 Jun 2024',
    dateOfBirth: '30 Jul 2011',
    bloodGroup: 'O-',
    remarks: 'Shows keen interest in Computer Science and robotics club.',
  },
  {
    id: 's-6',
    rollNumber: 'SCH-6B-01',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@demo.com',
    classGrade: 'Class 6-B',
    section: 'B',
    academicYear: '2024–2025',
    attendancePct: 94.5,
    classesPresent: 62,
    totalClasses: 66,
    overallGrade: 'A1',
    termPercentage: 96.0,
    phone: '+91 98765 43206',
    busRoute: 'Bus Route 03 (Jayanagar)',
    guardianName: 'Venkat Reddy',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00006',
    address: '77, Jubilee Enclave, Bengaluru',
    dues: 0,
    admissionDate: '13 Jun 2024',
    dateOfBirth: '09 Oct 2013',
    bloodGroup: 'B+',
    remarks: 'Class topper in Science; exceptional quiz team participant.',
  },
  {
    id: 's-7',
    rollNumber: 'SCH-7A-01',
    name: 'Vijay Nair',
    email: 'vijay.nair@demo.com',
    classGrade: 'Class 7-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 73.5,
    classesPresent: 48,
    totalClasses: 66,
    overallGrade: 'B2',
    termPercentage: 72.5,
    phone: '+91 98765 43207',
    busRoute: 'Bus Route 05 (Malleshwaram)',
    guardianName: 'Gopal Nair',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00007',
    address: 'Plot 10, Malleshwaram, Bengaluru',
    dues: 50000,
    admissionDate: '14 Jun 2024',
    dateOfBirth: '17 Dec 2012',
    bloodGroup: 'A-',
    remarks: 'Good progress in Hindi and Social Studies; needs regular homework check.',
  },
  {
    id: 's-8',
    rollNumber: 'SCH-10A-01',
    name: 'Kavita Das',
    email: 'kavita.das@demo.com',
    classGrade: 'Class 10-A',
    section: 'A',
    academicYear: '2024–2025',
    attendancePct: 88.0,
    classesPresent: 58,
    totalClasses: 66,
    overallGrade: 'A1',
    termPercentage: 89.6,
    phone: '+91 98765 43208',
    busRoute: 'Bus Route 06 (Whitefield)',
    guardianName: 'Pranab Das',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 00008',
    address: '404, Whitefield Main Road, Bengaluru',
    dues: 20000,
    admissionDate: '14 Jun 2024',
    dateOfBirth: '03 Feb 2009',
    bloodGroup: 'O+',
    remarks: 'Excellent leadership in School Prefect Council and Science Olympiad.',
  },
]

/* ----------------------------------------------------
   TEACHERS & STAFF DATASET
---------------------------------------------------- */
export const INITIAL_FACULTY: Faculty[] = [
  {
    id: 'f-1',
    teacherCode: 'TCH-MAT-01',
    name: 'Prof. Vikram Singh',
    email: 'vikram.singh@demo.com',
    department: 'Mathematics & Computing',
    designation: 'Senior Faculty & Class Teacher (8-A)',
    assignedClasses: ['Class 8-A', 'Class 9-B', 'Class 10-A'],
    subjectsTaught: ['Mathematics', 'Applied Mathematics'],
    isClassTeacherOf: 'Class 8-A',
    cabin: 'Staff Room Block A — Desk 04',
    phone: '+91 94481 11003',
    qualification: 'M.Sc. Mathematics, B.Ed (Gold Medalist)',
    experienceYears: 12,
    status: 'Active',
  },
  {
    id: 'f-2',
    teacherCode: 'TCH-SCI-01',
    name: 'Dr. Priya Patel',
    email: 'priya.patel@demo.com',
    department: 'Science & Technology',
    designation: 'Head of Science Department',
    assignedClasses: ['Class 8-A', 'Class 7-A', 'Class 10-A'],
    subjectsTaught: ['General Science', 'Physics & Chemistry'],
    cabin: 'Science Lab Annex — Cabin 02',
    phone: '+91 94481 11002',
    qualification: 'Ph.D. in Physics, B.Ed',
    experienceYears: 14,
    status: 'Active',
  },
  {
    id: 'f-3',
    teacherCode: 'TCH-ENG-01',
    name: 'Mrs. Sunita Rao',
    email: 'sunita.rao@demo.com',
    department: 'Languages & Literature',
    designation: 'Senior English Teacher & Class Teacher (7-A)',
    assignedClasses: ['Class 6-B', 'Class 7-A', 'Class 8-A'],
    subjectsTaught: ['English Language', 'English Literature'],
    isClassTeacherOf: 'Class 7-A',
    cabin: 'Staff Room Block B — Desk 11',
    phone: '+91 94481 11005',
    qualification: 'M.A. English Literature, B.Ed',
    experienceYears: 10,
    status: 'Active',
  },
  {
    id: 'f-4',
    teacherCode: 'TCH-SST-01',
    name: 'Mr. Arjun Verma',
    email: 'arjun.verma@demo.com',
    department: 'Social Sciences',
    designation: 'Social Studies & History Teacher',
    assignedClasses: ['Class 8-A', 'Class 9-A', 'Class 10-A'],
    subjectsTaught: ['Social Science (History & Civics)', 'Geography'],
    cabin: 'Staff Room Block A — Desk 09',
    phone: '+91 94481 11004',
    qualification: 'M.A. History, B.Ed',
    experienceYears: 8,
    status: 'Active',
  },
]

/* ----------------------------------------------------
   TIMETABLE DATASET (PERIOD 1 TO 7 FOR CLASSES)
---------------------------------------------------- */
export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Monday
  {
    id: 'tt-m1',
    day: 'Monday',
    period: 'Period 1 (08:30–09:15)',
    time: '08:30–09:15',
    subjectCode: 'MTH-801',
    subjectName: 'Mathematics',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Prof. Vikram Singh',
    type: 'Theory',
  },
  {
    id: 'tt-m2',
    day: 'Monday',
    period: 'Period 2 (09:15–10:00)',
    time: '09:15–10:00',
    subjectCode: 'SCI-801',
    subjectName: 'Science (Physics/Chemistry)',
    classGrade: 'Class 8-A',
    room: 'Junior Science Lab',
    teacher: 'Dr. Priya Patel',
    type: 'Lab / Practical',
  },
  {
    id: 'tt-m3',
    day: 'Monday',
    period: 'Period 3 (10:15–11:00)',
    time: '10:15–11:00',
    subjectCode: 'ENG-801',
    subjectName: 'English Literature',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Mrs. Sunita Rao',
    type: 'Theory',
  },
  {
    id: 'tt-m4',
    day: 'Monday',
    period: 'Period 4 (11:00–11:45)',
    time: '11:00–11:45',
    subjectCode: 'SST-801',
    subjectName: 'Social Studies (History)',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Mr. Arjun Verma',
    type: 'Theory',
  },
  {
    id: 'tt-m5',
    day: 'Monday',
    period: 'Period 5 (12:30–01:15)',
    time: '12:30–01:15',
    subjectCode: 'CMP-801',
    subjectName: 'Computer Applications',
    classGrade: 'Class 8-A',
    room: 'Computer Lab 01',
    teacher: 'Prof. Vikram Singh',
    type: 'Lab / Practical',
  },
  {
    id: 'tt-m6',
    day: 'Monday',
    period: 'Period 6 (01:15–02:00)',
    time: '01:15–02:00',
    subjectCode: 'HND-801',
    subjectName: 'Hindi / Second Language',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Mrs. Sunita Rao',
    type: 'Theory',
  },
  {
    id: 'tt-m7',
    day: 'Monday',
    period: 'Period 7 (02:00–02:45)',
    time: '02:00–02:45',
    subjectCode: 'ACT-801',
    subjectName: 'Physical Education & Games',
    classGrade: 'Class 8-A',
    room: 'School Sports Ground',
    teacher: 'Coach Rajesh',
    type: 'Activity',
  },

  // Tuesday
  {
    id: 'tt-t1',
    day: 'Tuesday',
    period: 'Period 1 (08:30–09:15)',
    time: '08:30–09:15',
    subjectCode: 'SCI-801',
    subjectName: 'Science (Biology)',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Dr. Priya Patel',
    type: 'Theory',
  },
  {
    id: 'tt-t2',
    day: 'Tuesday',
    period: 'Period 2 (09:15–10:00)',
    time: '09:15–10:00',
    subjectCode: 'MTH-801',
    subjectName: 'Mathematics (Geometry)',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Prof. Vikram Singh',
    type: 'Theory',
  },
  {
    id: 'tt-t3',
    day: 'Tuesday',
    period: 'Period 3 (10:15–11:00)',
    time: '10:15–11:00',
    subjectCode: 'ENG-801',
    subjectName: 'English Grammar',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Mrs. Sunita Rao',
    type: 'Theory',
  },
  {
    id: 'tt-t4',
    day: 'Tuesday',
    period: 'Period 4 (11:00–11:45)',
    time: '11:00–11:45',
    subjectCode: 'SST-801',
    subjectName: 'Geography',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Mr. Arjun Verma',
    type: 'Theory',
  },
  {
    id: 'tt-t5',
    day: 'Tuesday',
    period: 'Period 5 (12:30–01:15)',
    time: '12:30–01:15',
    subjectCode: 'MTH-801',
    subjectName: 'Mathematics Remedial & Problem Solving',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Prof. Vikram Singh',
    type: 'Theory',
  },

  // Wednesday
  {
    id: 'tt-w1',
    day: 'Wednesday',
    period: 'Period 1 (08:30–09:15)',
    time: '08:30–09:15',
    subjectCode: 'MTH-801',
    subjectName: 'Mathematics (Algebra)',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Prof. Vikram Singh',
    type: 'Theory',
  },
  {
    id: 'tt-w2',
    day: 'Wednesday',
    period: 'Period 2 (09:15–10:00)',
    time: '09:15–10:00',
    subjectCode: 'SCI-801',
    subjectName: 'Science Practical Experiments',
    classGrade: 'Class 8-A',
    room: 'Physics Lab',
    teacher: 'Dr. Priya Patel',
    type: 'Lab / Practical',
  },
  {
    id: 'tt-w3',
    day: 'Wednesday',
    period: 'Period 3 (10:15–11:00)',
    time: '10:15–11:00',
    subjectCode: 'ENG-801',
    subjectName: 'English Creative Writing',
    classGrade: 'Class 8-A',
    room: 'Room 201 (Class 8-A)',
    teacher: 'Mrs. Sunita Rao',
    type: 'Theory',
  },
]

/* ----------------------------------------------------
   SUBJECTS & CURRICULUM DATASET
---------------------------------------------------- */
export const INITIAL_COURSES: Course[] = [
  {
    id: 'c-1',
    code: 'MTH-801',
    name: 'Mathematics (Class 8)',
    classGrade: 'Class 8-A',
    department: 'Mathematics & Computing',
    periodsPerWeek: 6,
    type: 'Core Academic',
    facultyInCharge: 'Prof. Vikram Singh',
    enrolledStudentsCount: 5,
    syllabusChaptersCount: 16,
    chaptersCompleted: 11,
  },
  {
    id: 'c-2',
    code: 'SCI-801',
    name: 'General Science & Lab (Class 8)',
    classGrade: 'Class 8-A',
    department: 'Science & Technology',
    periodsPerWeek: 6,
    type: 'Laboratory',
    facultyInCharge: 'Dr. Priya Patel',
    enrolledStudentsCount: 5,
    syllabusChaptersCount: 18,
    chaptersCompleted: 13,
  },
  {
    id: 'c-3',
    code: 'ENG-801',
    name: 'English Language & Literature (Class 8)',
    classGrade: 'Class 8-A',
    department: 'Languages & Literature',
    periodsPerWeek: 5,
    type: 'Core Academic',
    facultyInCharge: 'Mrs. Sunita Rao',
    enrolledStudentsCount: 5,
    syllabusChaptersCount: 14,
    chaptersCompleted: 10,
  },
  {
    id: 'c-4',
    code: 'SST-801',
    name: 'Social Studies: History & Civics (Class 8)',
    classGrade: 'Class 8-A',
    department: 'Social Sciences',
    periodsPerWeek: 5,
    type: 'Core Academic',
    facultyInCharge: 'Mr. Arjun Verma',
    enrolledStudentsCount: 5,
    syllabusChaptersCount: 15,
    chaptersCompleted: 9,
  },
  {
    id: 'c-5',
    code: 'CMP-801',
    name: 'Computer Applications & Coding (Class 8)',
    classGrade: 'Class 8-A',
    department: 'Mathematics & Computing',
    periodsPerWeek: 3,
    type: 'Laboratory',
    facultyInCharge: 'Prof. Vikram Singh',
    enrolledStudentsCount: 5,
    syllabusChaptersCount: 10,
    chaptersCompleted: 8,
  },
]

/* ----------------------------------------------------
   EXAMS & TESTS DATASET (CONDUCTED BY TEACHERS)
---------------------------------------------------- */
export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex-1',
    name: 'Term 1 Half-Yearly Examination 2024',
    term: 'Term 1',
    classGrade: 'Class 8-A',
    subject: 'Mathematics',
    date: '18 Sep 2024',
    maxMarks: 100,
    conductedBy: 'Prof. Vikram Singh',
    status: 'Evaluated',
    marksMap: {
      'SCH-8A-01': { marks: 88, grade: 'A2', remarks: 'Good grasp of linear equations; check calculation steps.' },
      'SCH-8A-02': { marks: 98, grade: 'A1', remarks: 'Exceptional mathematical rigor and perfect score in Geometry.' },
      'SCH-8A-03': { marks: 74, grade: 'B1', remarks: 'Satisfactory; practice algebraic identities regularly.' },
      'SCH-8A-04': { marks: 82, grade: 'A2', remarks: 'Very good analytical approach; neat presentation.' },
      'SCH-8A-05': { marks: 76, grade: 'B1', remarks: 'Good potential; revise Mensuration formulas.' },
    },
  },
  {
    id: 'ex-2',
    name: 'Unit Test 2 — Science Practical & Theory',
    term: 'Unit Assessment',
    classGrade: 'Class 8-A',
    subject: 'General Science',
    date: '25 Sep 2024',
    maxMarks: 50,
    conductedBy: 'Dr. Priya Patel',
    status: 'Evaluated',
    marksMap: {
      'SCH-8A-01': { marks: 42, grade: 'A2', remarks: 'Good understanding of Chemical Reactions.' },
      'SCH-8A-02': { marks: 49, grade: 'A1', remarks: 'Flawless experiment notes and viva.' },
      'SCH-8A-03': { marks: 36, grade: 'B1', remarks: 'Improve ray diagrams in Optics.' },
      'SCH-8A-04': { marks: 44, grade: 'A2', remarks: 'Very attentive during lab experiments.' },
      'SCH-8A-05': { marks: 38, grade: 'B1', remarks: 'Active participant in lab work.' },
    },
  },
  {
    id: 'ex-3',
    name: 'Unit Test 3 — English Comprehension & Essay',
    term: 'Unit Assessment',
    classGrade: 'Class 8-A',
    subject: 'English Literature',
    date: '04 Oct 2024',
    maxMarks: 50,
    conductedBy: 'Mrs. Sunita Rao',
    status: 'Scheduled',
    marksMap: {},
  },
]

/* ----------------------------------------------------
   FEES & INVOICES (SCHOOL TERM FEES)
---------------------------------------------------- */
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'SCH-INV-2024-001',
    studentRoll: 'SCH-8A-05',
    studentName: 'Rohit Jain',
    classGrade: 'Class 8-A',
    amount: 70000,
    dueDate: '15 Sep 2024',
    status: 'Pending',
    feeType: 'Term 1 Tuition Fee',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'SCH-INV-2024-002',
    studentRoll: 'SCH-8A-04',
    studentName: 'Pooja Gupta',
    classGrade: 'Class 8-A',
    amount: 60000,
    dueDate: '10 Sep 2024',
    status: 'Overdue',
    feeType: 'Term 1 Tuition Fee',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'SCH-INV-2024-003',
    studentRoll: 'SCH-7A-01',
    studentName: 'Vijay Nair',
    classGrade: 'Class 7-A',
    amount: 50000,
    dueDate: '20 Sep 2024',
    status: 'Pending',
    feeType: 'School Bus & Transport',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'SCH-INV-2024-004',
    studentRoll: 'SCH-8A-03',
    studentName: 'Amit Kumar',
    classGrade: 'Class 8-A',
    amount: 45000,
    dueDate: '15 Sep 2024',
    status: 'Pending',
    feeType: 'Term 1 Tuition Fee',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'SCH-INV-2024-005',
    studentRoll: 'SCH-8A-01',
    studentName: 'Rahul Sharma',
    classGrade: 'Class 8-A',
    amount: 25000,
    dueDate: '25 Sep 2024',
    status: 'Pending',
    feeType: 'Annual Activity & Lab',
  },
  {
    id: 'inv-6',
    invoiceNumber: 'SCH-INV-2024-006',
    studentRoll: 'SCH-10A-01',
    studentName: 'Kavita Das',
    classGrade: 'Class 10-A',
    amount: 20000,
    dueDate: '28 Sep 2024',
    status: 'Pending',
    feeType: 'Uniform & Books Kit',
  },
  {
    id: 'inv-7',
    invoiceNumber: 'SCH-INV-2024-007',
    studentRoll: 'SCH-8A-02',
    studentName: 'Sneha Patel',
    classGrade: 'Class 8-A',
    amount: 65000,
    dueDate: '10 Aug 2024',
    paidDate: '08 Aug 2024',
    status: 'Paid',
    feeType: 'Term 1 Tuition Fee',
  },
  {
    id: 'inv-8',
    invoiceNumber: 'SCH-INV-2024-008',
    studentRoll: 'SCH-6B-01',
    studentName: 'Ananya Reddy',
    classGrade: 'Class 6-B',
    amount: 60000,
    dueDate: '10 Aug 2024',
    paidDate: '05 Aug 2024',
    status: 'Paid',
    feeType: 'Term 1 Tuition Fee',
  },
]

/* ----------------------------------------------------
   TRANSPORT & BUS ROUTES
---------------------------------------------------- */
export const INITIAL_BUS_ROUTES: TransportRoute[] = [
  {
    id: 'tr-1',
    routeNumber: 'Route 04 (North City)',
    busNumber: 'KA-01-EB-4210',
    driverName: 'Mr. Ramesh Gowda',
    driverPhone: '+91 98450 11221',
    attendantName: 'Mrs. Lakshmi (Attendant)',
    capacity: 36,
    occupied: 32,
    stops: ['Hebbal Flyover', 'Sahakar Nagar', 'Yelahanka Satellite', 'School Campus Gate'],
    status: 'On Time',
  },
  {
    id: 'tr-2',
    routeNumber: 'Route 02 (Indiranagar & CBD)',
    busNumber: 'KA-01-EB-4214',
    driverName: 'Mr. Suresh Babu',
    driverPhone: '+91 98450 11222',
    attendantName: 'Mrs. Radha',
    capacity: 36,
    occupied: 28,
    stops: ['100ft Road Indiranagar', 'Domlur Flyover', 'MG Road Metro', 'School Campus Gate'],
    status: 'On Time',
  },
  {
    id: 'tr-3',
    routeNumber: 'Route 06 (Whitefield Express)',
    busNumber: 'KA-01-EB-4218',
    driverName: 'Mr. Manjunath',
    driverPhone: '+91 98450 11223',
    attendantName: 'Mrs. Shobha',
    capacity: 40,
    occupied: 38,
    stops: ['ITPL Main Gate', 'Hope Farm Junction', 'Marathahalli Bridge', 'School Campus Gate'],
    status: 'On Time',
  },
]

export const INITIAL_HOSTEL: HostelRoom[] = [
  {
    id: 'h-1',
    block: 'Junior Boys Wing',
    roomNumber: 'Dorm A-101',
    capacity: 4,
    occupied: 2,
    students: [{ roll: 'SCH-8A-01', name: 'Rahul Sharma', classGrade: 'Class 8-A' }],
    warden: 'Mr. B. K. Rao (Hostel Master)',
    status: 'Available',
  },
  {
    id: 'h-2',
    block: 'Senior Boys Wing',
    roomNumber: 'Dorm B-204',
    capacity: 4,
    occupied: 2,
    students: [{ roll: 'SCH-8A-05', name: 'Rohit Jain', classGrade: 'Class 8-A' }],
    warden: 'Mr. S. M. Hegde',
    status: 'Available',
  },
  {
    id: 'h-3',
    block: 'Girls Wing',
    roomNumber: 'Dorm C-102',
    capacity: 4,
    occupied: 2,
    students: [{ roll: 'SCH-6B-01', name: 'Ananya Reddy', classGrade: 'Class 6-B' }],
    warden: 'Mrs. Manjula Devi',
    status: 'Available',
  },
]

/* ----------------------------------------------------
   LIBRARY REPOSITORY (SCHOOL LIBRARY)
---------------------------------------------------- */
export const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'bk-1',
    isbn: '978-0199535569',
    title: 'Oxford Illustrated Science Encyclopedia for Young Learners',
    author: 'Oxford University Press',
    category: 'Science & Nature',
    copiesAvailable: 5,
    totalCopies: 8,
    shelfLocation: 'Science Wing / Shelf A-02',
  },
  {
    id: 'bk-2',
    isbn: '978-0141321103',
    title: 'The Adventures of Tom Sawyer & Huckleberry Finn',
    author: 'Mark Twain',
    category: 'Literature & Fiction',
    copiesAvailable: 7,
    totalCopies: 10,
    shelfLocation: 'Junior Classics / Shelf C-01',
  },
  {
    id: 'bk-3',
    isbn: '978-8174508126',
    title: 'Mathematics Problem Solver & Olympiad Foundation (Class 8)',
    author: 'R.D. Sharma & Board Experts',
    category: 'Mathematics',
    copiesAvailable: 4,
    totalCopies: 6,
    shelfLocation: 'Mathematics Stack / Shelf M-04',
  },
  {
    id: 'bk-4',
    isbn: '978-0756698287',
    title: 'DK Eyewitness History: Ancient Civilizations to Modern World',
    author: 'Dorling Kindersley',
    category: 'History & Civics',
    copiesAvailable: 6,
    totalCopies: 8,
    shelfLocation: 'Social Sciences / Shelf H-03',
  },
]

/* ----------------------------------------------------
   LIBRARY ISSUE & RETURN LEDGER
---------------------------------------------------- */
export const INITIAL_BOOK_ISSUES: BookIssueRecord[] = [
  {
    id: 'iss-1',
    bookId: 'bk-1',
    bookTitle: 'Oxford Illustrated Science Encyclopedia for Young Learners',
    isbn: '978-0199535569',
    studentRoll: 'SCH-8A-01',
    studentName: 'Rahul Sharma',
    classGrade: 'Class 8-A',
    issueDate: '15 Aug 2024',
    dueDate: '29 Aug 2024',
    status: 'Overdue',
    fineAmount: 50,
    remarks: 'Return delayed by 9 days; fine generated.',
  },
  {
    id: 'iss-2',
    bookId: 'bk-3',
    bookTitle: 'Mathematics Problem Solver & Olympiad Foundation (Class 8)',
    isbn: '978-8174508126',
    studentRoll: 'SCH-8A-02',
    studentName: 'Sneha Patel',
    classGrade: 'Class 8-A',
    issueDate: '01 Sep 2024',
    dueDate: '15 Sep 2024',
    status: 'Issued',
    fineAmount: 0,
    remarks: 'Issued for Olympiad prep.',
  },
  {
    id: 'iss-3',
    bookId: 'bk-2',
    bookTitle: 'The Adventures of Tom Sawyer & Huckleberry Finn',
    isbn: '978-0141321103',
    studentRoll: 'SCH-6B-01',
    studentName: 'Ananya Reddy',
    classGrade: 'Class 6-B',
    issueDate: '10 Aug 2024',
    dueDate: '24 Aug 2024',
    returnDate: '22 Aug 2024',
    status: 'Returned',
    fineAmount: 0,
    remarks: 'Returned in excellent condition.',
  },
]

/* ----------------------------------------------------
   USERS & SYSTEM ROLES
---------------------------------------------------- */
export const INITIAL_USERS: UserRole[] = [
  {
    id: 'u-1',
    name: 'Dr. Rajesh Kumar',
    email: 'admin@demo.com',
    role: 'Super Admin',
    designation: 'Managing Director & System Administrator',
    lastActive: 'Just now',
    status: 'Active',
  },
  {
    id: 'u-2',
    name: 'Dr. Anita Sharma',
    email: 'principal@demo.com',
    role: 'Principal',
    designation: 'Head of School & Executive Academic Principal',
    lastActive: '5 mins ago',
    status: 'Active',
  },
  {
    id: 'u-3',
    name: 'Prof. Vikram Singh',
    email: 'teacher@demo.com',
    role: 'Teacher',
    designation: 'Senior Faculty (Maths) & Class Teacher 8-A',
    lastActive: '15 mins ago',
    status: 'Active',
  },
  {
    id: 'u-6',
    name: 'Mrs. Meenakshi Sundaram',
    email: 'library@demo.com',
    role: 'Library Admin',
    designation: 'Head Librarian & Learning Resource Administrator',
    lastActive: '10 mins ago',
    status: 'Active',
  },
  {
    id: 'u-4',
    name: 'Rahul Sharma',
    email: 'student@demo.com',
    role: 'Student',
    designation: 'Student — Class 8-A (Roll #01)',
    lastActive: '30 mins ago',
    status: 'Active',
  },
  {
    id: 'u-5',
    name: 'Mr. Suresh Sharma',
    email: 'parent@demo.com',
    role: 'Parent',
    designation: 'Parent / Guardian of Rahul Sharma (Class 8-A)',
    lastActive: '1 hour ago',
    status: 'Active',
  },
]
