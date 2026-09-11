import React, { useState } from 'react'
import {
  Clock,
  Plus,
  Trash2,
  Building,
  GraduationCap,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import type { TimetableSlot } from '../data/mockData'
import { Modal } from '../components/common/Modal'
import { Badge } from '../components/common/Badge'

export const TimetablePage: React.FC = () => {
  const { user } = useAuth()
  const { timetableSlots, addTimetableSlot, removeTimetableSlot } = useErpData()

  const role = user?.role || 'Principal'
  const isManagement = role === 'Principal' || role === 'Super Admin'

  const [activeDay, setActiveDay] = useState<TimetableSlot['day']>('Monday')
  const [selectedClass, setSelectedClass] = useState<string>('Class 8-A')
  const [filterMode, setFilterMode] = useState<'class' | 'teacher'>('class')
  const [selectedTeacher, setSelectedTeacher] = useState('Prof. Vikram Singh')
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [day, setDay] = useState<TimetableSlot['day']>('Monday')
  const [period, setPeriod] = useState('Period 1 (08:30–09:15)')
  const [subjectCode] = useState('MTH-801')
  const [subjectName, setSubjectName] = useState('Mathematics')
  const [classGrade, setClassGrade] = useState('Class 8-A')
  const [room, setRoom] = useState('Room 201 (Class 8-A)')
  const [teacher, setTeacher] = useState('Prof. Vikram Singh')
  const [type] = useState<'Theory' | 'Lab / Practical' | 'Activity'>('Theory')

  const days: TimetableSlot['day'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  // Filter slots
  const filteredSlots = timetableSlots.filter((slot) => {
    const matchesDay = slot.day === activeDay
    if (filterMode === 'class') {
      return matchesDay && slot.classGrade === selectedClass
    }
    return matchesDay && slot.teacher.includes(selectedTeacher)
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTimetableSlot({
      day,
      period,
      time: period.split('(')[1]?.replace(')', '') || '08:30–09:15',
      subjectCode,
      subjectName,
      classGrade,
      room,
      teacher,
      type,
    })
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD ACADEMIC SCHEDULE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            School Timetable & Periods
          </h1>
          <p className="text-sm text-[#50685e]">
            Clash-free daily schedules for classes 6th to 10th with morning assembly, periods 1–7, and lab rotations.
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Period Slot</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('class')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterMode === 'class'
                ? 'bg-[#0e4b38] text-white'
                : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
            }`}
          >
            Filter by Class
          </button>
          <button
            onClick={() => setFilterMode('teacher')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterMode === 'teacher'
                ? 'bg-[#0e4b38] text-white'
                : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
            }`}
          >
            Filter by Teacher
          </button>

          {filterMode === 'class' ? (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] px-3 py-1.5 text-xs font-semibold text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              <option>Class 8-A</option>
              <option>Class 6-B</option>
              <option>Class 7-A</option>
              <option>Class 10-A</option>
            </select>
          ) : (
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] px-3 py-1.5 text-xs font-semibold text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              <option>Prof. Vikram Singh</option>
              <option>Dr. Priya Patel</option>
              <option>Mrs. Sunita Rao</option>
              <option>Mr. Arjun Verma</option>
            </select>
          )}
        </div>

        {/* Days Pill List */}
        <div className="flex flex-wrap items-center gap-1.5">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeDay === d
                  ? 'bg-[#0e4b38] text-white shadow-2xs'
                  : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Period Cards */}
      <div className="space-y-3">
        {filteredSlots.length === 0 ? (
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-12 text-center text-xs text-[#71877e]">
            No teaching periods scheduled for {activeDay} in {filterMode === 'class' ? selectedClass : selectedTeacher}.
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="group flex flex-col justify-between gap-4 rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm hover:border-[#cde0d5] sm:flex-row sm:items-center transition-all"
            >
              <div className="flex items-start gap-4 sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf4ee] text-[#0e4b38] font-bold text-xs">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#14241e]">{slot.period}</span>
                    <Badge
                      variant={
                        slot.type === 'Lab / Practical'
                          ? 'amber'
                          : slot.type === 'Activity'
                          ? 'purple'
                          : 'green'
                      }
                      size="sm"
                    >
                      {slot.type}
                    </Badge>
                  </div>
                  <h3 className="font-editorial text-lg font-semibold text-[#0e4b38] mt-0.5">
                    {slot.subjectName}
                  </h3>
                  <div className="text-xs text-[#71877e] flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-[#14241e]">
                      <GraduationCap className="h-3.5 w-3.5 text-[#8fa39b]" />
                      {slot.classGrade}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-[#8fa39b]" />
                      {slot.room}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#8fa39b]" />
                      Teacher: {slot.teacher}
                    </span>
                  </div>
                </div>
              </div>

              {isManagement && (
                <button
                  onClick={() => removeTimetableSlot(slot.id)}
                  className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#fef2f2] hover:text-[#b91c1c] transition-colors"
                  title="Remove period"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: Add Timetable Slot */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Timetable Period"
        subtitle="Schedule a classroom period slot for a class and teacher."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as any)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Period Slot</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Period 1 (08:30–09:15)</option>
                <option>Period 2 (09:15–10:00)</option>
                <option>Period 3 (10:15–11:00)</option>
                <option>Period 4 (11:00–11:45)</option>
                <option>Period 5 (12:30–01:15)</option>
                <option>Period 6 (01:15–02:00)</option>
                <option>Period 7 (02:00–02:45)</option>
              </select>
            </div>
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
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Subject</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Mathematics</option>
                <option>General Science</option>
                <option>English Literature</option>
                <option>Social Studies</option>
                <option>Computer Applications</option>
                <option>Physical Education & Games</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Teacher</label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Prof. Vikram Singh</option>
                <option>Dr. Priya Patel</option>
                <option>Mrs. Sunita Rao</option>
                <option>Mr. Arjun Verma</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Room</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Room 201"
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
              Add Period
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
