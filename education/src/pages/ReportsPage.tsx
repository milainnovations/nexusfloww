import React from 'react'
import { Download } from 'lucide-react'
import { useErpData } from '../context/ErpDataContext'
import {
  AcademicPerformanceBarChart,
  FeeCollectionDonutChart,
  GradeDistributionBarChart,
  AttendanceTrendAreaChart,
} from '../components/analytics/AnalyticsCharts'

export const ReportsPage: React.FC = () => {
  const { students, facultyList, lowAttendanceStudents, totalFeesCollected, totalFeesOutstanding } = useErpData()

  const avgAttendance = (
    students.reduce((acc, s) => acc + s.attendancePct, 0) / (students.length || 1)
  ).toFixed(1)

  const avgTermScore = (
    students.reduce((acc, s) => acc + s.termPercentage, 0) / (students.length || 1)
  ).toFixed(1)

  const feeCollectionRate = Math.round(
    (totalFeesCollected / (totalFeesCollected + totalFeesOutstanding || 1)) * 100
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD MANAGERIAL & BOARD ANALYTICS
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            School Academic & Operational Analytics
          </h1>
          <p className="text-sm text-[#50685e]">
            Official compliance metrics for Principal oversight, CBSE Board benchmarks, and term performance reports.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export School Analytics Report</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm">
          <span className="text-xs font-semibold text-[#667a73]">Pupil-Teacher Ratio (PTR)</span>
          <div className="mt-2 font-editorial text-3xl font-semibold text-[#14241e]">
            {students.length} : {facultyList.length}
          </div>
          <div className="mt-1 text-xs text-[#10b981] font-medium">✓ Compliant with CBSE 25:1 standard</div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm">
          <span className="text-xs font-semibold text-[#667a73]">School Average Attendance</span>
          <div className="mt-2 font-editorial text-3xl font-semibold text-[#14241e]">
            {avgAttendance}%
          </div>
          <div className="mt-1 text-xs text-[#71877e]">{lowAttendanceStudents.length} students under watch</div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm">
          <span className="text-xs font-semibold text-[#667a73]">Term 1 Average Score</span>
          <div className="mt-2 font-editorial text-3xl font-semibold text-[#14241e]">
            {avgTermScore}% <span className="text-xs font-normal text-[#71877e]">(Grade A2)</span>
          </div>
          <div className="mt-1 text-xs text-[#10b981] font-medium">Distinction Rate: 88%</div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm">
          <span className="text-xs font-semibold text-[#667a73]">Fee Recovery Rate</span>
          <div className="mt-2 font-editorial text-3xl font-semibold text-[#0e4b38]">
            {feeCollectionRate}% <span className="text-xs font-normal text-[#71877e]">Collected</span>
          </div>
          <div className="mt-1 text-xs text-[#71877e]">Session 2024–25 Term 1</div>
        </div>
      </div>

      {/* MANAGERIAL COMPLIANCE & PERFORMANCE CHARTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AcademicPerformanceBarChart title="Class-Wise Average Scores & Pass Rates" />
        <FeeCollectionDonutChart title="Term 1 Financial Clearance & Dues Distribution" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GradeDistributionBarChart title="School-Wide Student Grade Distribution" />
        <AttendanceTrendAreaChart title="Monthly Institutional Attendance Stability" />
      </div>

      {/* CBSE Quality Benchmarks */}
      <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
        <h3 className="font-editorial text-xl font-normal text-[#14241e]">
          CBSE Board Accreditation & Academic Standards
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-[#14241e] mb-1">
              <span>Standard 1: Curriculum Coverage & Periodic Assessments</span>
              <span className="text-[#0e4b38]">94%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#edf3ef]">
              <div className="h-2 rounded-full bg-[#0e4b38]" style={{ width: '94%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-[#14241e] mb-1">
              <span>Standard 2: Teacher-Led Continuous Comprehensive Evaluation (CCE)</span>
              <span className="text-[#0e4b38]">90%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#edf3ef]">
              <div className="h-2 rounded-full bg-[#0e4b38]" style={{ width: '90%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-[#14241e] mb-1">
              <span>Standard 3: Student Transport Safety & Bus GPS Compliance</span>
              <span className="text-[#0e4b38]">98%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#edf3ef]">
              <div className="h-2 rounded-full bg-[#0e4b38]" style={{ width: '98%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-[#14241e] mb-1">
              <span>Standard 4: Science Laboratories & Digital Smart Classroom Readiness</span>
              <span className="text-[#0e4b38]">92%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#edf3ef]">
              <div className="h-2 rounded-full bg-[#0e4b38]" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
