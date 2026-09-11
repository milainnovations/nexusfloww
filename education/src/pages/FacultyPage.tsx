import React, { useState } from 'react'
import {
  Plus,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Award,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import type { Faculty } from '../data/mockData'
import { Modal } from '../components/common/Modal'
import { Drawer } from '../components/common/Drawer'
import { Badge } from '../components/common/Badge'

export const FacultyPage: React.FC = () => {
  const { user } = useAuth()
  const { facultyList, addFaculty } = useErpData()

  const role = user?.role || 'Principal'
  const isManagement = role === 'Principal' || role === 'Super Admin'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Mathematics & Computing')
  const [designation, setDesignation] = useState('Senior Faculty & Class Teacher (8-A)')
  const [assignedClasses, setAssignedClasses] = useState('Class 8-A, Class 9-B')
  const [subjectsTaught, setSubjectsTaught] = useState('Mathematics')
  const [isClassTeacherOf, setIsClassTeacherOf] = useState('Class 8-A')
  const [qualification, setQualification] = useState('M.Sc., B.Ed')
  const [experienceYears] = useState('10')

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.teacherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subjectsTaught.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addFaculty({
      teacherCode: `TCH-${Date.now().toString().slice(-4)}`,
      name,
      email: email || `${name.toLowerCase().replace(/[\s.]+/g, '.')}@demo.com`,
      department,
      designation,
      assignedClasses: assignedClasses.split(',').map((c) => c.trim()),
      subjectsTaught: subjectsTaught.split(',').map((s) => s.trim()),
      isClassTeacherOf: isClassTeacherOf || undefined,
      cabin: 'Staff Room Block A — Desk 04',
      phone: '+91 94481 00000',
      qualification,
      experienceYears: Number(experienceYears),
      status: 'Active',
    })
    setShowAddModal(false)
    setName('')
    setEmail('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD TEACHING STAFF & FACULTY
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            Teachers & Staff Directory
          </h1>
          <p className="text-sm text-[#50685e]">
            Academic faculty profiles, assigned school classes, subjects taught, and class teacher allocations.
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Appoint Teacher</span>
          </button>
        )}
      </div>

      {/* Directory Cards Grid */}
      <div className="flex items-center justify-between border-b border-[#edf3ef] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#14241e]">Active Faculty Members:</span>
          <span className="rounded-full bg-[#e8f6ed] px-2.5 py-0.5 text-xs font-semibold text-[#0e4b38]">
            {filteredFaculty.length} teachers
          </span>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teacher, subject, class..."
            className="w-full rounded-xl border border-[#c9dcd2] bg-white py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredFaculty.map((faculty) => (
          <div
            key={faculty.id}
            onClick={() => setSelectedFaculty(faculty)}
            className="group flex flex-col justify-between rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm hover:border-[#cde0d5] hover:shadow-bluke-md transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf4ee] text-[#0e4b38] font-bold text-sm">
                    {faculty.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-medium text-[#14241e] group-hover:text-[#0e4b38] transition-colors">
                      {faculty.name}
                    </h3>
                    <div className="text-xs text-[#71877e]">{faculty.designation}</div>
                    <div className="text-[10.5px] font-mono text-[#8fa39b]">{faculty.teacherCode}</div>
                  </div>
                </div>

                <Badge variant={faculty.status === 'Active' ? 'green' : 'amber'} size="sm">
                  {faculty.status}
                </Badge>
              </div>

              {/* Assigned Classes Pill List */}
              <div className="space-y-1.5 pt-2 border-t border-[#edf3ef]">
                <div className="text-[11px] font-semibold text-[#71877e]">Assigned Classes & Sections:</div>
                <div className="flex flex-wrap gap-1.5">
                  {faculty.assignedClasses.map((cls) => (
                    <span
                      key={cls}
                      className="rounded-md bg-[#f0f7f3] border border-[#d6e8dd] px-2 py-0.5 text-[11px] font-semibold text-[#0e4b38]"
                    >
                      {cls}
                    </span>
                  ))}
                  {faculty.isClassTeacherOf && (
                    <span className="rounded-md bg-[#fef3c7] border border-[#fde68a] px-2 py-0.5 text-[11px] font-bold text-[#92400e]">
                      Class Teacher: {faculty.isClassTeacherOf}
                    </span>
                  )}
                </div>
              </div>

              {/* Subjects Taught */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-[#71877e]">Subjects Taught:</div>
                <div className="text-xs font-medium text-[#14241e]">
                  {faculty.subjectsTaught.join(' • ')}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#edf3ef] pt-4 text-xs text-[#71877e]">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-[#8fa39b]" />
                <span>{faculty.qualification}</span>
              </div>
              <div className="font-semibold text-[#0e4b38]">
                {faculty.experienceYears} yrs experience
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DRAWER: Faculty Profile */}
      <Drawer
        isOpen={!!selectedFaculty}
        onClose={() => setSelectedFaculty(null)}
        title="Teacher Profile"
        subtitle={selectedFaculty ? `${selectedFaculty.name} (${selectedFaculty.teacherCode})` : ''}
      >
        {selectedFaculty && (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#f4f8f5] p-4 border border-[#e2ece6] space-y-2">
              <div className="text-[10px] font-bold text-[#0e4b38] uppercase tracking-wider">
                {selectedFaculty.department}
              </div>
              <div className="text-xl font-bold text-[#14241e]">{selectedFaculty.name}</div>
              <div className="text-xs text-[#50685e]">{selectedFaculty.designation}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-[#14241e] uppercase tracking-wider text-[11px]">
                Teaching Load & Assigned Classes
              </div>
              <div className="rounded-xl border border-[#edf3ef] p-3 space-y-2 bg-[#fcfdfc]">
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Class Teacher:</span>
                  <span className="font-bold text-[#0e4b38]">
                    {selectedFaculty.isClassTeacherOf || 'Subject Specialist'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Assigned Classes:</span>
                  <span className="font-semibold text-[#14241e]">
                    {selectedFaculty.assignedClasses.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Subjects:</span>
                  <span className="font-medium text-[#14241e]">
                    {selectedFaculty.subjectsTaught.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71877e]">Staff Cabin:</span>
                  <span className="font-medium text-[#14241e]">{selectedFaculty.cabin}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-[#14241e] uppercase tracking-wider text-[11px]">
                Contact & Credentials
              </div>
              <div className="rounded-xl border border-[#edf3ef] p-3 space-y-2 bg-[#fcfdfc]">
                <div className="flex items-center gap-2 text-[#14241e]">
                  <Mail className="h-4 w-4 text-[#71877e]" />
                  <span>{selectedFaculty.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#14241e]">
                  <Phone className="h-4 w-4 text-[#71877e]" />
                  <span>{selectedFaculty.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#14241e]">
                  <Award className="h-4 w-4 text-[#71877e]" />
                  <span>{selectedFaculty.qualification}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* MODAL: Appoint Teacher */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Appoint New Teacher"
        subtitle="Add a faculty member and assign class sections & subjects."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Teacher Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mrs. Sunita Rao"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Mathematics & Computing</option>
                <option>Science & Technology</option>
                <option>Languages & Literature</option>
                <option>Social Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Faculty"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">
                Assigned Classes (Comma separated)
              </label>
              <input
                type="text"
                value={assignedClasses}
                onChange={(e) => setAssignedClasses(e.target.value)}
                placeholder="Class 8-A, Class 9-B"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Class Teacher Of</label>
              <select
                value={isClassTeacherOf}
                onChange={(e) => setIsClassTeacherOf(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option value="">None (Subject Teacher)</option>
                <option value="Class 6-A">Class 6-A</option>
                <option value="Class 6-B">Class 6-B</option>
                <option value="Class 7-A">Class 7-A</option>
                <option value="Class 8-A">Class 8-A</option>
                <option value="Class 10-A">Class 10-A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Subjects Taught</label>
              <input
                type="text"
                value={subjectsTaught}
                onChange={(e) => setSubjectsTaught(e.target.value)}
                placeholder="e.g. Mathematics, Science"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Sc., B.Ed"
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
              Confirm Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
