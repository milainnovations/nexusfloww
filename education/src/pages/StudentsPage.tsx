import React, { useState, useMemo } from 'react'
import {
  Search,
  UserPlus,
  Download,
  Phone,
  GraduationCap,
  Bus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import type { Student } from '../data/mockData'
import { Modal } from '../components/common/Modal'
import { Drawer } from '../components/common/Drawer'
import { Badge } from '../components/common/Badge'

export const StudentsPage: React.FC = () => {
  const { user } = useAuth()
  const { students, addStudent, deleteStudent } = useErpData()

  const role = user?.role || 'Principal'
  const isTeacher = role === 'Teacher'
  const isStudentOrParent = role === 'Student' || role === 'Parent'

  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState<string>(isTeacher ? 'Class 8-A' : 'All')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showEnrolModal, setShowEnrolModal] = useState(false)

  // Enrol Form Fields
  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [classGrade, setClassGrade] = useState('Class 8-A')
  const [section, setSection] = useState('A')
  const [phone, setPhone] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianRelation] = useState('Father')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [busRoute, setBusRoute] = useState('Bus Route 04 (North City)')
  const [bloodGroup, setBloodGroup] = useState('B+')
  const [gender, setGender] = useState<'Male' | 'Female'>('Male')

  // Filtered list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.guardianName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesClass = classFilter === 'All' || s.classGrade === classFilter

      return matchesSearch && matchesClass
    })
  }, [students, searchQuery, classFilter])

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addStudent({
      name,
      rollNumber:
        rollNumber ||
        `SCH-${classGrade.replace('Class ', '').replace('-', '')}-${String(students.length + 1).padStart(2, '0')}`,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@demo.com`,
      gender,
      classGrade,
      section,
      academicYear: '2024–2025',
      phone: phone || '+91 98765 00000',
      busRoute,
      guardianName: guardianName || 'Guardian',
      guardianRelation: guardianRelation || 'Father',
      guardianPhone: guardianPhone || '+91 98765 00000',
      address: 'Bengaluru Campus',
      dues: 0,
      dateOfBirth: '15 Nov 2011',
      bloodGroup: bloodGroup || 'B+',
      remarks: 'Newly admitted student for academic session 2024–25.',
    })
    setShowEnrolModal(false)
    setName('')
    setRollNumber('')
    setEmail('')
    setPhone('')
    setGuardianName('')
  }

  const exportCSV = () => {
    const headers = 'Roll Number,Name,Class,Guardian,Phone,Attendance,Term Percentage,Grade\n'
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.rollNumber}","${s.name}","${s.classGrade}","${s.guardianName}","${s.guardianPhone}","${s.attendancePct}%","${s.termPercentage}%","${s.overallGrade}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `greenwood_school_students_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ACADEMIC REGISTRY HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD SCHOOL ADMISSIONS & REGISTRY
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            {isTeacher ? 'My Students (Class 8-A)' : 'Students Register'}
          </h1>
          <p className="text-sm text-[#50685e]">
            {isTeacher
              ? 'Pupil directory, guardian contacts, attendance standing, and term remarks for your assigned class.'
              : 'School-wide enrollment directory, class rosters, guardian contacts, and attendance metrics.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#c5d8cd] bg-white px-4 py-2 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          {!isStudentOrParent && (
            <button
              onClick={() => setShowEnrolModal(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Enrol Student</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTERS & SEARCH */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#14241e] mr-1">Filter Class:</span>
          {['All', 'Class 6-B', 'Class 7-A', 'Class 8-A', 'Class 10-A'].map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                classFilter === cls
                  ? 'bg-[#0e4b38] text-white font-semibold'
                  : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll #, guardian..."
            className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
          />
        </div>
      </div>

      {/* 3. STUDENTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3.5 px-5">ROLL NUMBER</th>
                <th className="py-3.5 px-5">STUDENT NAME</th>
                <th className="py-3.5 px-5">CLASS & SECTION</th>
                <th className="py-3.5 px-5">GUARDIAN & PHONE</th>
                <th className="py-3.5 px-5">TRANSPORT ROUTE</th>
                <th className="py-3.5 px-5">ATTENDANCE</th>
                <th className="py-3.5 px-5">TERM PROGRESS</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef] text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#71877e]">
                    No students match the selected class or search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-[#f7faf8] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5 font-mono font-medium text-[#14241e]">
                      {student.rollNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#14241e] group-hover:text-[#0e4b38]">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-[#71877e]">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#eef7f2] px-2.5 py-1 text-xs font-semibold text-[#0e4b38]">
                        <GraduationCap className="h-3 w-3" />
                        {student.classGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-[#14241e]">{student.guardianName}</div>
                      <div className="text-[11px] text-[#71877e] flex items-center gap-1">
                        <Phone className="h-3 w-3 text-[#8fa39b]" />
                        {student.guardianPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-[#50685e]">
                        <Bus className="h-3.5 w-3.5 text-[#71877e]" />
                        <span className="truncate max-w-[140px]">{student.busRoute}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`font-semibold ${
                          student.attendancePct < 75 ? 'text-[#b91c1c]' : 'text-[#0e4b38]'
                        }`}
                      >
                        {student.attendancePct}%
                      </span>
                      <div className="text-[10px] text-[#82968e]">
                        {student.classesPresent}/{student.totalClasses} classes
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <Badge variant={student.termPercentage >= 85 ? 'green' : 'neutral'} size="sm">
                          {student.overallGrade} ({student.termPercentage}%)
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStudent(student)
                        }}
                        className="rounded-lg border border-[#d6e3dc] px-2.5 py-1 text-[11px] font-medium text-[#0e4b38] hover:bg-[#eef5f1]"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DRAWER: Student Details */}
      <Drawer
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Academic Dossier"
        subtitle={selectedStudent ? `${selectedStudent.name} • ${selectedStudent.rollNumber}` : ''}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#f4f8f5] p-4 border border-[#e2ece6] space-y-2">
              <div className="text-[10px] font-bold text-[#0e4b38] uppercase tracking-wider">
                {selectedStudent.classGrade} (Section {selectedStudent.section})
              </div>
              <div className="text-xl font-bold text-[#14241e]">{selectedStudent.name}</div>
              <div className="text-xs text-[#50685e]">
                DOB: <strong>{selectedStudent.dateOfBirth}</strong> • Blood Group: <strong>{selectedStudent.bloodGroup}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-[#14241e] uppercase tracking-wider text-[11px]">
                Guardian & Contact Information
              </div>
              <div className="rounded-xl border border-[#edf3ef] p-3 space-y-2 bg-[#fcfdfc]">
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Guardian Name:</span>
                  <span className="font-semibold text-[#14241e]">
                    {selectedStudent.guardianName} ({selectedStudent.guardianRelation})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Guardian Mobile:</span>
                  <span className="font-semibold text-[#14241e]">{selectedStudent.guardianPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Address:</span>
                  <span className="font-medium text-[#14241e]">{selectedStudent.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Bus Route:</span>
                  <span className="font-medium text-[#14241e]">{selectedStudent.busRoute}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-[#14241e] uppercase tracking-wider text-[11px]">
                Academic & Attendance Metrics
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#edf3ef] p-3 bg-[#fcfdfc]">
                  <div className="text-[10px] text-[#71877e] uppercase">Attendance Score</div>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      selectedStudent.attendancePct < 75 ? 'text-[#b91c1c]' : 'text-[#0e4b38]'
                    }`}
                  >
                    {selectedStudent.attendancePct}%
                  </div>
                  <div className="text-[10px] text-[#82968e]">
                    {selectedStudent.classesPresent}/{selectedStudent.totalClasses} periods present
                  </div>
                </div>

                <div className="rounded-xl border border-[#edf3ef] p-3 bg-[#fcfdfc]">
                  <div className="text-[10px] text-[#71877e] uppercase">Term 1 Standing</div>
                  <div className="text-lg font-bold text-[#0e4b38] mt-0.5">
                    Grade {selectedStudent.overallGrade}
                  </div>
                  <div className="text-[10px] text-[#82968e]">
                    Score: {selectedStudent.termPercentage}%
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#fafcfb] border border-[#edf3ef] p-4 text-xs">
              <div className="font-semibold text-[#14241e]">Teacher's Remarks:</div>
              <div className="text-[#50685e] mt-1 italic">"{selectedStudent.remarks}"</div>
            </div>

            {!isStudentOrParent && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    deleteStudent(selectedStudent.id)
                    setSelectedStudent(null)
                  }}
                  className="w-full rounded-xl border border-[#fca5a5] py-2 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                >
                  Delete Record
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 5. MODAL: Enrol Student */}
      <Modal
        isOpen={showEnrolModal}
        onClose={() => setShowEnrolModal(false)}
        title="Enrol Student — Academic Session 2024–25"
        subtitle="Add a student and configure class, guardian, and transport details."
      >
        <form onSubmit={handleEnrolSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Student Full Name *
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
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Class Grade *</label>
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
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>A</option>
                <option>B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Name *</label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Alok Dixit"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Phone *</label>
              <input
                type="text"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Transport Route</label>
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

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>B+</option>
                <option>O+</option>
                <option>A+</option>
                <option>AB+</option>
                <option>O-</option>
                <option>A-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
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
              Enrol Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
