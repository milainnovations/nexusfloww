import React, { useState } from 'react'
import {
  Plus,
  Search,
  GraduationCap,
  Clock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { Modal } from '../components/common/Modal'
import { Badge } from '../components/common/Badge'

export const CoursesPage: React.FC = () => {
  const { user } = useAuth()
  const { courses, addCourse } = useErpData()

  const role = user?.role || 'Principal'
  const isManagement = role === 'Principal' || role === 'Super Admin'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [classGrade, setClassGrade] = useState('Class 8-A')
  const [department] = useState('Mathematics & Computing')
  const [periodsPerWeek, setPeriodsPerWeek] = useState('6')
  const [type] = useState<'Core Academic' | 'Co-Curricular' | 'Laboratory'>('Core Academic')
  const [facultyInCharge, setFacultyInCharge] = useState('Prof. Vikram Singh')
  const [syllabusChaptersCount, setSyllabusChaptersCount] = useState('16')

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.facultyInCharge.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesClass = selectedClass === 'All' || c.classGrade === selectedClass

    return matchesSearch && matchesClass
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addCourse({
      code: code || `SUB-${Date.now().toString().slice(-4)}`,
      name,
      classGrade,
      department,
      periodsPerWeek: Number(periodsPerWeek),
      type,
      facultyInCharge,
      syllabusChaptersCount: Number(syllabusChaptersCount),
    })
    setShowAddModal(false)
    setName('')
    setCode('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD ACADEMIC CURRICULUM
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            Subjects & Syllabus
          </h1>
          <p className="text-sm text-[#50685e]">
            School curriculum breakdown, syllabus completion tracking, and teacher-in-charge assignments.
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Subject</span>
          </button>
        )}
      </div>

      {/* Class Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#14241e] mr-1">Filter Class:</span>
          {['All', 'Class 8-A', 'Class 6-B', 'Class 7-A', 'Class 10-A'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedClass === cls
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
            placeholder="Search subject, teacher..."
            className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const progressPct = Math.round(
            (course.chaptersCompleted / (course.syllabusChaptersCount || 1)) * 100
          )

          return (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm hover:border-[#cde0d5] hover:shadow-bluke-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-[#eef7f2] px-2.5 py-1 text-xs font-bold text-[#0e4b38] font-mono">
                    {course.code}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {course.classGrade}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[#14241e] leading-snug">
                    {course.name}
                  </h3>
                  <div className="text-xs text-[#71877e] mt-1">{course.department}</div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#edf3ef]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#71877e]">Syllabus Progress</span>
                    <span className="font-bold text-[#0e4b38]">
                      {course.chaptersCompleted}/{course.syllabusChaptersCount} chapters ({progressPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                    <div
                      className="h-full bg-[#0e4b38] rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#50685e]">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-[#8fa39b]" />
                    <span>Teacher: <strong>{course.facultyInCharge}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#8fa39b]" />
                    <span>{course.periodsPerWeek} periods / week</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL: Add Course */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Subject to Curriculum"
        subtitle="Configure subject code, syllabus chapters, and assign teacher."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics & Geometry"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Class Grade</label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Class 8-A</option>
                <option>Class 6-B</option>
                <option>Class 7-A</option>
                <option>Class 10-A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Teacher in Charge</label>
              <select
                value={facultyInCharge}
                onChange={(e) => setFacultyInCharge(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Prof. Vikram Singh</option>
                <option>Dr. Priya Patel</option>
                <option>Mrs. Sunita Rao</option>
                <option>Mr. Arjun Verma</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Periods / Week</label>
              <input
                type="number"
                value={periodsPerWeek}
                onChange={(e) => setPeriodsPerWeek(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Total Chapters</label>
              <input
                type="number"
                value={syllabusChaptersCount}
                onChange={(e) => setSyllabusChaptersCount(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Add Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
