import React, { useState } from 'react'
import {
  Search,
  FileText,
  Plus,
  Printer,
  CheckCircle2,
  Upload,
  Download,
  FileSpreadsheet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { GradeDistributionBarChart, ReportCardMarkBreakdownChart, ReportCardSkillCompetencyRadialChart, ReportCardBenchmarkComparisonChart } from '../components/analytics/AnalyticsCharts'
import type { Student } from '../data/mockData'

export const ExamsGradesPage: React.FC = () => {
  const { user } = useAuth()
  const { students, exams, addExam, updateExamMarks, bulkImportMarksCSV } = useErpData()

  const role = user?.role || 'Principal'
  const isStudentOrParent = role === 'Student' || role === 'Parent'
  const isTeacher = role === 'Teacher'
  const isPrincipalOrAdmin = role === 'Principal' || role === 'Super Admin'

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showReportCardModal, setShowReportCardModal] = useState(false)
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null)

  // CSV Import State
  const [csvText, setCsvText] = useState('')
  const [csvPreviewRows, setCsvPreviewRows] = useState<Array<{ studentRoll: string; subject: string; marksObtained: number; maxMarks: number; term: string; remarks?: string }>>([])
  const [csvSuccessMsg, setCsvSuccessMsg] = useState('')

  // Test Scheduling State
  const [newTestName, setNewTestName] = useState('')
  const [newTestSubject, setNewTestSubject] = useState('Mathematics')
  const [newTestClass, setNewTestClass] = useState('Class 8-A')
  const [newTestDate, setNewTestDate] = useState('15 Oct 2024')
  const [newTestMaxMarks, setNewTestMaxMarks] = useState('100')

  // Marks Entry State for Selected Exam
  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0]
  const classStudents = students.filter((s) => s.classGrade === (activeExam?.classGrade || 'Class 8-A'))

  const [marksState, setMarksState] = useState<Record<string, { marks: number; remarks: string }>>(() => {
    const map: Record<string, { marks: number; remarks: string }> = {}
    classStudents.forEach((s) => {
      const existing = activeExam?.marksMap[s.rollNumber]
      map[s.rollNumber] = {
        marks: existing ? existing.marks : 85,
        remarks: existing ? existing.remarks : 'Good comprehension of core concepts.',
      }
    })
    return map
  })

  const [saveMarksSuccess, setSaveMarksSuccess] = useState(false)

  // Filtered students for ledger
  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const calculateGrade = (marks: number, maxMarks: number) => {
    const pct = (marks / maxMarks) * 100
    if (pct >= 91) return 'A1'
    if (pct >= 81) return 'A2'
    if (pct >= 71) return 'B1'
    if (pct >= 61) return 'B2'
    if (pct >= 51) return 'C1'
    if (pct >= 41) return 'C2'
    return 'D (Needs Improvement)'
  }

  const handleMarksChange = (rollNumber: string, value: string) => {
    const num = Math.min(Number(activeExam?.maxMarks || 100), Math.max(0, Number(value) || 0))
    setMarksState((prev) => ({
      ...prev,
      [rollNumber]: {
        ...prev[rollNumber],
        marks: num,
      },
    }))
  }

  const handleRemarksChange = (rollNumber: string, remarks: string) => {
    setMarksState((prev) => ({
      ...prev,
      [rollNumber]: {
        ...prev[rollNumber],
        remarks,
      },
    }))
  }

  const handleSaveMarks = () => {
    if (!activeExam) return
    const updatedMap: Record<string, { marks: number; grade: string; remarks: string }> = {}
    Object.entries(marksState).forEach(([roll, data]) => {
      updatedMap[roll] = {
        marks: data.marks,
        grade: calculateGrade(data.marks, activeExam.maxMarks),
        remarks: data.remarks,
      }
    })

    updateExamMarks(activeExam.id, updatedMap)
    setSaveMarksSuccess(true)
    setTimeout(() => setSaveMarksSuccess(false), 2500)
  }

  const handleScheduleTest = (e: React.FormEvent) => {
    e.preventDefault()
    addExam({
      name: newTestName,
      term: 'Unit Assessment',
      classGrade: newTestClass,
      subject: newTestSubject,
      date: newTestDate,
      maxMarks: Number(newTestMaxMarks),
      conductedBy: user?.name || 'Prof. Vikram Singh',
      status: 'Scheduled',
      marksMap: {},
    })
    setShowScheduleModal(false)
    setNewTestName('')
  }

  const openReportCard = (student: Student) => {
    setSelectedStudentForCard(student)
    setShowReportCardModal(true)
  }

  // Student specific record — resolved from logged-in user, not hardcoded
  const defaultStudentCard = (
    (user?.rollNumber ? students.find((s) => s.rollNumber === user.rollNumber) : null) ??
    (user?.email ? students.find((s) => s.email.toLowerCase() === user.email.toLowerCase()) : null) ??
    students[0]
  )

  const handleCsvTextChange = (text: string) => {
    setCsvText(text)
    const lines = text.trim().split('\n')
    if (lines.length <= 1) {
      setCsvPreviewRows([])
      return
    }

    const rows: Array<{ studentRoll: string; subject: string; marksObtained: number; maxMarks: number; term: string; remarks?: string }> = []
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim())
      if (parts.length >= 4) {
        const studentRoll = parts[0]
        const subject = parts[1]
        const marksObtained = Number(parts[2]) || 0
        const maxMarks = Number(parts[3]) || 100
        const term = parts[4] || 'Term 2'
        const remarks = parts[5] || 'Uploaded via Principal CSV Import'

        if (studentRoll && subject) {
          rows.push({ studentRoll, subject, marksObtained, maxMarks, term, remarks })
        }
      }
    }
    setCsvPreviewRows(rows)
  }

  const handleDownloadSampleCsv = () => {
    const sample = `studentRoll,subject,marksObtained,maxMarks,term,remarks\nSCH-8A-01,Mathematics,92,100,Term 2,Excellent concept clarity\nSCH-8A-02,Mathematics,88,100,Term 2,Great analytical skills\nSCH-8A-03,General Science,85,100,Term 2,Good lab work\nSCH-8A-04,English Literature,94,100,Term 2,Top vocabulary scorer\nSCH-8A-05,Social Studies,79,100,Term 2,Good progress`
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Sample_Student_Marks_Import.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleProcessCsvImport = () => {
    if (csvPreviewRows.length === 0) return
    bulkImportMarksCSV(csvPreviewRows)
    setCsvSuccessMsg(`Successfully imported ${csvPreviewRows.length} student mark records via Principal CSV Import!`)
    setTimeout(() => {
      setShowCsvModal(false)
      setCsvSuccessMsg('')
      setCsvText('')
      setCsvPreviewRows([])
    }, 2000)
  }

  /* -------------------------------------------------------------
     STUDENT / PARENT VIEW: OFFICIAL REPORT CARD
  ------------------------------------------------------------- */
  if (isStudentOrParent) {
    const s = defaultStudentCard
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
              STUDENT EVALUATION & ASSESSMENT
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
              Progress Report Card
            </h1>
            <p className="text-sm text-[#50685e]">
              Official Term 1 Scholastic Assessment Card for <strong>{s.name}</strong> ({s.classGrade}).
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report Card</span>
          </button>
        </div>

        {/* PRINTABLE OFFICIAL REPORT CARD CONTAINER */}
        <div className="rounded-3xl border-2 border-[#c5d8cd] bg-white p-8 sm:p-10 shadow-bluke-lg space-y-8">
          {/* School Header */}
          <div className="border-b-2 border-[#0e4b38] pb-6 flex flex-col items-center text-center space-y-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0e4b38] text-white font-serif font-bold text-2xl mb-1 shadow-sm">
              G
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#0e4b38]">
              Greenwood International School
            </h2>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#50685e]">
              CBSE Affiliation #83042 • School Code: 45102
            </div>
            <div className="text-xs text-[#71877e]">
              Sarjapur Road, Bengaluru — 560035 • Email: office@greenwood.edu
            </div>
            <div className="mt-2 rounded-full bg-[#e8f6ed] px-4 py-1 text-xs font-bold text-[#0e4b38] tracking-wider uppercase">
              Official Term 1 Progress Report Card (2024–2025)
            </div>
          </div>

          {/* Student Dossier Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-[#f8faf9] p-4 text-xs border border-[#e5ebe7]">
            <div>
              <span className="text-[#71877e] block text-[10.5px] uppercase font-semibold">Student Name</span>
              <span className="font-bold text-[#14241e] text-sm">{s.name}</span>
            </div>
            <div>
              <span className="text-[#71877e] block text-[10.5px] uppercase font-semibold">Roll Number</span>
              <span className="font-mono font-bold text-[#14241e] text-sm">{s.rollNumber}</span>
            </div>
            <div>
              <span className="text-[#71877e] block text-[10.5px] uppercase font-semibold">Class & Section</span>
              <span className="font-bold text-[#0e4b38] text-sm">{s.classGrade} (Section {s.section})</span>
            </div>
            <div>
              <span className="text-[#71877e] block text-[10.5px] uppercase font-semibold">Class Teacher</span>
              <span className="font-medium text-[#14241e]">Prof. Vikram Singh</span>
            </div>
          </div>

          {/* Marks Table */}
          <div className="overflow-hidden rounded-2xl border border-[#e2ece6]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#e2ece6] bg-[#0e4b38] text-white text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-5">SUBJECT</th>
                  <th className="py-3 px-5 text-center">MAX MARKS</th>
                  <th className="py-3 px-5 text-center">MARKS OBTAINED</th>
                  <th className="py-3 px-5 text-center">GRADE</th>
                  <th className="py-3 px-5">TEACHER REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3ef]">
                <tr className="hover:bg-[#fafcfb]">
                  <td className="py-3.5 px-5 font-semibold text-[#14241e]">Mathematics</td>
                  <td className="py-3.5 px-5 text-center font-mono">100</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-[#0e4b38]">88</td>
                  <td className="py-3.5 px-5 text-center font-bold text-[#0e4b38]">A2</td>
                  <td className="py-3.5 px-5 text-[#50685e]">Excellent understanding of linear algebra and geometry.</td>
                </tr>
                <tr className="hover:bg-[#fafcfb]">
                  <td className="py-3.5 px-5 font-semibold text-[#14241e]">General Science & Lab</td>
                  <td className="py-3.5 px-5 text-center font-mono">100</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-[#0e4b38]">84</td>
                  <td className="py-3.5 px-5 text-center font-bold text-[#0e4b38]">A2</td>
                  <td className="py-3.5 px-5 text-[#50685e]">Very active in science lab practicals; neat experiment notes.</td>
                </tr>
                <tr className="hover:bg-[#fafcfb]">
                  <td className="py-3.5 px-5 font-semibold text-[#14241e]">English Literature</td>
                  <td className="py-3.5 px-5 text-center font-mono">100</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-[#0e4b38]">92</td>
                  <td className="py-3.5 px-5 text-center font-bold text-[#0e4b38]">A1</td>
                  <td className="py-3.5 px-5 text-[#50685e]">Exceptional essay writing and vocabulary mastery.</td>
                </tr>
                <tr className="hover:bg-[#fafcfb]">
                  <td className="py-3.5 px-5 font-semibold text-[#14241e]">Social Science (History/Civics)</td>
                  <td className="py-3.5 px-5 text-center font-mono">100</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-[#0e4b38]">78</td>
                  <td className="py-3.5 px-5 text-center font-bold text-[#0e4b38]">B1</td>
                  <td className="py-3.5 px-5 text-[#50685e]">Good understanding; practice map work regularly.</td>
                </tr>
                <tr className="hover:bg-[#fafcfb]">
                  <td className="py-3.5 px-5 font-semibold text-[#14241e]">Computer Applications & Coding</td>
                  <td className="py-3.5 px-5 text-center font-mono">100</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold text-[#0e4b38]">90</td>
                  <td className="py-3.5 px-5 text-center font-bold text-[#0e4b38]">A1</td>
                  <td className="py-3.5 px-5 text-[#50685e]">Strong logic in Python basics and algorithm loops.</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#0e4b38] bg-[#f4f8f5] font-bold text-xs">
                  <td className="py-3 px-5 text-[#14241e]">GRAND TOTAL</td>
                  <td className="py-3 px-5 text-center font-mono">500</td>
                  <td className="py-3 px-5 text-center font-mono text-[#0e4b38] text-sm">432 / 500</td>
                  <td className="py-3 px-5 text-center text-[#0e4b38] text-sm">A2 (86.4%)</td>
                  <td className="py-3 px-5 text-[#0e4b38]">Result: PASSED WITH DISTINCTION</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Visual Analytics Charts for Student & Parents */}
          <div className="space-y-6 pt-4 border-t border-[#edf3ef]">
            <div className="rounded-xl bg-[#f0f7f3] p-3 text-xs font-semibold text-[#0e4b38] flex items-center justify-between">
              <span className="font-bold">📊 VISUAL ACADEMIC ANALYTICS & COMPETENCY INSIGHTS</span>
              <span className="text-[10px] text-[#71877e] font-normal">Included for Parent & Student Performance Guidance</span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ReportCardBenchmarkComparisonChart
                title={`${s.name.split(' ')[0]}'s Subject Score vs Class Average vs Class Best`}
                studentName={s.name.split(' ')[0]}
              />
              <ReportCardMarkBreakdownChart
                title="Subject Score Composition (Theory, Practical & Internal)"
              />
            </div>

            <ReportCardSkillCompetencyRadialChart
              title="360° Learning Habit & Competency Profile"
            />
          </div>

          {/* Attendance & Teacher Signature Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs">
            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4">
              <span className="text-[10px] font-semibold text-[#71877e] uppercase">Attendance Record</span>
              <div className="text-base font-bold text-[#14241e] mt-1">{s.attendancePct}% Present</div>
              <div className="text-[11px] text-[#50685e]">47 of 66 working periods</div>
            </div>

            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#71877e] uppercase">Class Teacher</span>
                <div className="text-xs font-bold text-[#14241e] mt-1">Prof. Vikram Singh</div>
              </div>
              <div className="text-[10px] font-mono text-[#8fa39b] border-t border-dashed border-[#c5d8cd] pt-1 mt-3">
                Digital Sign: V.Singh (Verified)
              </div>
            </div>

            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#71877e] uppercase">Principal & Seal</span>
                <div className="text-xs font-bold text-[#0e4b38] mt-1">Dr. Anita Sharma</div>
              </div>
              <div className="text-[10px] font-mono text-[#0e4b38] font-bold border-t border-dashed border-[#0e4b38]/40 pt-1 mt-3">
                ★ GREENWOOD SCHOOL SEAL ★
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* -------------------------------------------------------------
     TEACHER & PRINCIPAL EXAM MANAGEMENT & MARKS ENTRY VIEW
  ------------------------------------------------------------- */
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            EXAMINATION & ASSESSMENT OFFICE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            Exams & Progress Reports
          </h1>
          <p className="text-sm text-[#50685e]">
            {isTeacher
              ? 'Schedule assessments, record student marks, auto-compute grades, and compile report cards.'
              : 'School examination records, term assessments, and official report card publishing.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {(isTeacher || isPrincipalOrAdmin) && (
            <button
              onClick={() => setShowCsvModal(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#0e4b38] bg-[#f0f7f3] px-4 py-2 text-xs font-semibold text-[#0e4b38] hover:bg-[#0e4b38] hover:text-white transition-all shrink-0 shadow-2xs"
            >
              <Upload className="h-4 w-4" />
              <span>+ Upload Class Marks (CSV)</span>
            </button>
          )}

          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Schedule Test / Exam</span>
          </button>
        </div>
      </div>

      {saveMarksSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-[#e8f6ed] border border-[#bbf7d0] p-4 text-xs font-semibold text-[#166534] animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-[#16a34a]" />
          <span>Marks ledger saved & grades recalculated for {activeExam.name}.</span>
        </div>
      )}

      {/* Exam Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {exams.map((ex) => (
          <div
            key={ex.id}
            onClick={() => setSelectedExamId(ex.id)}
            className={`rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedExamId === ex.id
                ? 'border-[#0e4b38] bg-[#f4f8f5] shadow-bluke-sm'
                : 'border-[#e2ece6] bg-white hover:border-[#cde0d5]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
                {ex.term}
              </span>
              <Badge variant={ex.status === 'Evaluated' ? 'green' : 'amber'} size="sm">
                {ex.status}
              </Badge>
            </div>
            <div className="font-semibold text-sm text-[#14241e] mt-1">{ex.name}</div>
            <div className="text-xs text-[#50685e] mt-1">
              {ex.classGrade} • {ex.subject} • Max: {ex.maxMarks}
            </div>
            <div className="text-[10.5px] text-[#82968e] mt-2 flex items-center justify-between">
              <span>Date: {ex.date}</span>
              <span className="font-medium text-[#0e4b38]">By: {ex.conductedBy}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grade Analytics Chart */}
      <GradeDistributionBarChart title={`${activeExam?.name || 'Selected Assessment'} — Grade Distribution`} />

      {/* Marks Entry Ledger Table */}
      <div className="rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#edf3ef] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <span className="text-xs font-bold text-[#14241e]">Active Gradebook: </span>
            <span className="text-xs font-semibold text-[#0e4b38]">{activeExam.name} ({activeExam.classGrade} • {activeExam.subject})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or roll #..."
                className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleSaveMarks}
              className="rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#125641] transition-all"
            >
              Save Marks
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3 px-6">ROLL NUMBER</th>
                <th className="py-3 px-6">STUDENT NAME</th>
                <th className="py-3 px-6 text-center">MARKS / {activeExam.maxMarks}</th>
                <th className="py-3 px-6 text-center">GRADE</th>
                <th className="py-3 px-6">ACADEMIC REMARKS</th>
                <th className="py-3 px-6 text-right">REPORT CARD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef] text-xs">
              {filteredStudents.map((student) => {
                const currentData = marksState[student.rollNumber] || { marks: 85, remarks: 'Good grasp.' }
                const computedGrade = calculateGrade(currentData.marks, activeExam.maxMarks)

                return (
                  <tr key={student.id} className="hover:bg-[#f7faf8] transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#14241e]">
                      {student.rollNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#14241e]">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <input
                        type="number"
                        min="0"
                        max={activeExam.maxMarks}
                        value={currentData.marks}
                        onChange={(e) => handleMarksChange(student.rollNumber, e.target.value)}
                        className="w-20 rounded-lg border border-[#c9dcd2] px-2 py-1 text-center font-mono font-bold text-xs text-[#0e4b38] focus:border-[#0e4b38] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={computedGrade.startsWith('A') ? 'green' : 'neutral'} size="sm">
                        Grade {computedGrade}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <input
                        type="text"
                        value={currentData.remarks}
                        onChange={(e) => handleRemarksChange(student.rollNumber, e.target.value)}
                        placeholder="Write feedback..."
                        className="w-full rounded-lg border border-[#edf3ef] bg-white px-2.5 py-1 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openReportCard(student)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#c5d8cd] px-2.5 py-1 text-[11px] font-semibold text-[#0e4b38] hover:bg-[#eef5f1]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Card</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Schedule Test */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Assessment / Examination"
        subtitle="Configure assessment schedule, class grade, subject and max marks."
      >
        <form onSubmit={handleScheduleTest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Assessment Name *
            </label>
            <input
              type="text"
              required
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              placeholder="e.g. Unit Assessment 3 — Geometry"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Class Grade</label>
              <select
                value={newTestClass}
                onChange={(e) => setNewTestClass(e.target.value)}
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
                value={newTestSubject}
                onChange={(e) => setNewTestSubject(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Mathematics</option>
                <option>General Science</option>
                <option>English Literature</option>
                <option>Social Studies</option>
                <option>Computer Applications</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Date</label>
              <input
                type="text"
                value={newTestDate}
                onChange={(e) => setNewTestDate(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Max Marks</label>
              <input
                type="number"
                value={newTestMaxMarks}
                onChange={(e) => setNewTestMaxMarks(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Schedule Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Report Card Preview — Visual Edition */}
      <Modal
        isOpen={showReportCardModal && !!selectedStudentForCard}
        onClose={() => setShowReportCardModal(false)}
        title="Official Student Progress Card"
        subtitle={selectedStudentForCard ? `${selectedStudentForCard.name} • ${selectedStudentForCard.classGrade} • Term 1 Assessment` : ''}
      >
        {selectedStudentForCard && (
          <div className="space-y-5 text-xs">
            {/* School Header */}
            <div className="rounded-xl border border-[#c5d8cd] bg-gradient-to-br from-[#f0f7f3] to-[#e8f6ed] p-4 text-center">
              <h3 className="font-editorial text-lg font-bold text-[#0e4b38]">Greenwood International School</h3>
              <p className="text-[10px] text-[#71877e]">Affiliation #83042 • CBSE Board • Term 1 Assessment Report 2024–25</p>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-3">
              <div><span className="text-[#71877e]">Student: </span><span className="font-bold text-[#14241e]">{selectedStudentForCard.name}</span></div>
              <div><span className="text-[#71877e]">Roll #: </span><span className="font-mono font-bold">{selectedStudentForCard.rollNumber}</span></div>
              <div><span className="text-[#71877e]">Class: </span><span className="font-semibold">{selectedStudentForCard.classGrade}</span></div>
              <div><span className="text-[#71877e]">Attendance: </span><span className="font-bold text-[#0e4b38]">{selectedStudentForCard.attendancePct}%</span></div>
            </div>

            {/* Performance Summary Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: 'Overall Score',
                  value: `${selectedStudentForCard.termPercentage}%`,
                  sub: `Grade: ${selectedStudentForCard.overallGrade}`,
                  color: selectedStudentForCard.termPercentage >= 85 ? '#0e4b38' : selectedStudentForCard.termPercentage >= 70 ? '#2563eb' : '#d97706',
                  bg: selectedStudentForCard.termPercentage >= 85 ? 'bg-[#e8f6ed] border-[#bbf7d0]' : selectedStudentForCard.termPercentage >= 70 ? 'bg-[#eff6ff] border-[#bfdbfe]' : 'bg-[#fef3c7] border-[#fde68a]',
                },
                {
                  label: 'Attendance',
                  value: `${selectedStudentForCard.attendancePct}%`,
                  sub: selectedStudentForCard.attendancePct >= 75 ? 'In Safe Zone ✓' : 'Below Threshold ⚠',
                  color: selectedStudentForCard.attendancePct >= 75 ? '#0e4b38' : '#d97706',
                  bg: selectedStudentForCard.attendancePct >= 75 ? 'bg-[#e8f6ed] border-[#bbf7d0]' : 'bg-[#fef3c7] border-[#fde68a]',
                },
                {
                  label: 'Class Standing',
                  value: selectedStudentForCard.termPercentage >= 85 ? 'Distinction' : selectedStudentForCard.termPercentage >= 75 ? 'Merit' : selectedStudentForCard.termPercentage >= 60 ? 'Pass' : 'Needs Focus',
                  sub: 'Based on Term 1 aggregate',
                  color: '#14241e',
                  bg: 'bg-[#f8faf9] border-[#e2ece6]',
                },
              ].map((badge) => (
                <div key={badge.label} className={`rounded-xl border p-3 text-center ${badge.bg}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c] mb-1">{badge.label}</div>
                  <div className="font-editorial text-xl font-bold" style={{ color: badge.color }}>{badge.value}</div>
                  <div className="text-[10px] text-[#71877e] mt-0.5">{badge.sub}</div>
                </div>
              ))}
            </div>

            {/* CHART 1: Peer Benchmark — Child vs Class Average vs Best */}
            <ReportCardBenchmarkComparisonChart
              title={`${selectedStudentForCard.name.split(' ')[0]}'s Score vs Class Average vs Class Best`}
              studentName={selectedStudentForCard.name.split(' ')[0]}
            />

            {/* CHART 2: Marks Composition — Theory vs Practical vs Internal */}
            <ReportCardMarkBreakdownChart
              title="Subject Score — Theory, Practical & Internal Breakdown"
            />

            {/* CHART 3: Holistic 360° Learner Competency Profile */}
            <ReportCardSkillCompetencyRadialChart
              title="360° Learning & Competency Profile"
            />

            {/* Teacher Remark */}
            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c] mb-1">Class Teacher's Remark</div>
              <div className="italic text-[#50685e]">"{selectedStudentForCard.remarks}"</div>
            </div>

            <button
              onClick={() => {
                setShowReportCardModal(false)
                window.print()
              }}
              className="w-full rounded-xl bg-[#0e4b38] py-2.5 text-xs font-semibold text-white hover:bg-[#125641] transition-all"
            >
              Print Official Report Card
            </button>
          </div>
        )}
      </Modal>

      {/* MODAL: Class Teacher CSV Marks Importer */}
      <Modal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        title="Class Teacher Bulk CSV Marks Importer"
        subtitle="Upload student term evaluation scores for your class via CSV file or raw CSV text."
      >
        <div className="space-y-4 text-xs">
          {csvSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-[#e8f6ed] border border-[#bbf7d0] p-3 text-xs font-semibold text-[#166534]">
              <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
              <span>{csvSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-[#f4f8f5] border border-[#d6e3dc] p-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#0e4b38]" />
              <div>
                <div className="font-bold text-[#14241e]">Standard CSV Template</div>
                <div className="text-[11px] text-[#50685e]">Columns: studentRoll, subject, marksObtained, maxMarks, term, remarks</div>
              </div>
            </div>
            <button
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0e4b38] bg-white px-3 py-1.5 text-xs font-semibold text-[#0e4b38] hover:bg-[#0e4b38] hover:text-white transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Paste CSV Content or Drag & Drop File
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => handleCsvTextChange(e.target.value)}
              placeholder="studentRoll,subject,marksObtained,maxMarks,term,remarks&#10;SCH-8A-01,Mathematics,92,100,Term 2,Excellent&#10;SCH-8A-02,Mathematics,88,100,Term 2,Great improvement"
              className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] p-3 font-mono text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          {csvPreviewRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0e4b38]">
                  Parsed CSV Records ({csvPreviewRows.length} rows ready)
                </span>
                <Badge variant="green" size="sm">Valid Format</Badge>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-xl border border-[#e2ece6] bg-white">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-[#e2ece6] bg-[#f8faf9] font-semibold text-[#50685e]">
                      <th className="py-2 px-3">Roll #</th>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3 text-center">Marks</th>
                      <th className="py-2 px-3">Term</th>
                      <th className="py-2 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf3ef]">
                    {csvPreviewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#fafcfb]">
                        <td className="py-1.5 px-3 font-mono font-semibold text-[#14241e]">{row.studentRoll}</td>
                        <td className="py-1.5 px-3 font-medium">{row.subject}</td>
                        <td className="py-1.5 px-3 text-center font-mono font-bold text-[#0e4b38]">
                          {row.marksObtained} / {row.maxMarks}
                        </td>
                        <td className="py-1.5 px-3">{row.term}</td>
                        <td className="py-1.5 px-3 text-[#50685e] truncate max-w-[150px]">{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowCsvModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcessCsvImport}
              disabled={csvPreviewRows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641] disabled:opacity-50 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Import {csvPreviewRows.length} Records into Gradebook</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
