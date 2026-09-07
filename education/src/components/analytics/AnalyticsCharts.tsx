import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from 'recharts'

/* -------------------------------------------------------------
   1. ACADEMIC PERFORMANCE COMPARISON BAR CHART
------------------------------------------------------------- */
export interface AcademicBarData {
  classGrade: string
  avgPercentage: number
  passRate: number
}

const defaultAcademicData: AcademicBarData[] = [
  { classGrade: 'Class 6-A', avgPercentage: 78.4, passRate: 95 },
  { classGrade: 'Class 7-B', avgPercentage: 82.1, passRate: 98 },
  { classGrade: 'Class 8-A', avgPercentage: 86.5, passRate: 100 },
  { classGrade: 'Class 9-A', avgPercentage: 81.2, passRate: 96 },
  { classGrade: 'Class 10-A', avgPercentage: 89.0, passRate: 100 },
]

export const AcademicPerformanceBarChart: React.FC<{ data?: AcademicBarData[]; title?: string }> = ({
  data = defaultAcademicData,
  title = 'Class-wise Academic Average & Pass Rate (%)',
}) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
            ACADEMIC BENCHMARK
          </span>
          <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
        </div>
      </div>
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="classGrade" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
                color: '#14241e',
              }}
              formatter={(val: any) => [`${val}%`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar dataKey="avgPercentage" name="Avg Percentage" fill="#0e4b38" radius={[6, 6, 0, 0]} barSize={28} />
            <Bar dataKey="passRate" name="Pass Rate (%)" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   2. FEE COLLECTION & CLEARANCE DONUT CHART
------------------------------------------------------------- */
export interface FeeDonutData {
  name: string
  value: number
  color: string
}

const defaultFeeData: FeeDonutData[] = [
  { name: 'Collected', value: 125000, color: '#0e4b38' },
  { name: 'Pending', value: 35000, color: '#d97706' },
  { name: 'Overdue', value: 15000, color: '#dc2626' },
]

export const FeeCollectionDonutChart: React.FC<{ data?: FeeDonutData[]; title?: string }> = ({
  data = defaultFeeData,
  title = 'Fee Recovery & Settlement Breakdown',
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          FINANCIAL ANALYTICS
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-56 w-full text-xs relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#c9dcd2',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-[#7e948c]">Total Dues</span>
            <span className="font-editorial text-base font-bold text-[#14241e]">
              ₹{(total / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item) => {
            const pct = Math.round((item.value / total) * 100)
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-[#14241e]">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#14241e]">₹{item.value.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-[#7e948c]">{pct}% of total</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   3. MONTHLY ATTENDANCE TREND AREA CHART
------------------------------------------------------------- */
export interface AttendanceAreaData {
  month: string
  attendancePct: number
  targetPct: number
}

const defaultAttendanceData: AttendanceAreaData[] = [
  { month: 'Jun', attendancePct: 91.2, targetPct: 90 },
  { month: 'Jul', attendancePct: 88.5, targetPct: 90 },
  { month: 'Aug', attendancePct: 94.1, targetPct: 90 },
  { month: 'Sep', attendancePct: 92.8, targetPct: 90 },
  { month: 'Oct', attendancePct: 96.0, targetPct: 90 },
]

export const AttendanceTrendAreaChart: React.FC<{ data?: AttendanceAreaData[]; title?: string }> = ({
  data = defaultAttendanceData,
  title = 'Monthly Attendance Consistency & Compliance (%)',
}) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
            ATTENDANCE TRAJECTORY
          </span>
          <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
        </div>
        <span className="rounded-lg bg-[#e8f6ed] px-2.5 py-1 text-[11px] font-semibold text-[#0e4b38]">
          Target: 90%
        </span>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0e4b38" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0e4b38" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[70, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val}%`, 'Attendance']}
            />
            <Area
              type="monotone"
              dataKey="attendancePct"
              name="Attendance Rate"
              stroke="#0e4b38"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#attendanceColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   4. SUBJECT PROFICIENCY & SKILL RADAR CHART
------------------------------------------------------------- */
export interface SubjectRadarData {
  subject: string
  studentScore: number
  classAvg: number
}

const defaultRadarData: SubjectRadarData[] = [
  { subject: 'Mathematics', studentScore: 88, classAvg: 76 },
  { subject: 'General Science', studentScore: 84, classAvg: 78 },
  { subject: 'English Lit.', studentScore: 92, classAvg: 80 },
  { subject: 'Social Studies', studentScore: 78, classAvg: 75 },
  { subject: 'Computer Apps', studentScore: 95, classAvg: 82 },
]

export const SubjectRadarChart: React.FC<{ data?: SubjectRadarData[]; title?: string }> = ({
  data = defaultRadarData,
  title = 'Subject Proficiency vs Class Average',
}) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          SKILL & ACADEMIC MAP
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#eef4f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#14241e', fontSize: 11, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#7e948c', fontSize: 10 }} />
            <Radar
              name="Student Score"
              dataKey="studentScore"
              stroke="#0e4b38"
              fill="#0e4b38"
              fillOpacity={0.4}
            />
            <Radar
              name="Class Average"
              dataKey="classAvg"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val}/100`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   5. GRADE DISTRIBUTION BAR CHART (A+, A, B, C, F)
------------------------------------------------------------- */
export interface GradeDistributionData {
  grade: string
  count: number
  color: string
}

const defaultGradeDistribution: GradeDistributionData[] = [
  { grade: 'A+ (90-100%)', count: 12, color: '#0e4b38' },
  { grade: 'A (80-89%)', count: 18, color: '#16a34a' },
  { grade: 'B (70-79%)', count: 8, color: '#2563eb' },
  { grade: 'C (60-69%)', count: 4, color: '#d97706' },
  { grade: 'F (<60%)', count: 1, color: '#dc2626' },
]

export const GradeDistributionBarChart: React.FC<{ data?: GradeDistributionData[]; title?: string }> = ({
  data = defaultGradeDistribution,
  title = 'Student Grade Distribution Breakdown',
}) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          EVALUATION DISTRIBUTION
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="grade"
              type="category"
              tick={{ fill: '#14241e', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val} Students`, 'Count']}
            />
            <Bar dataKey="count" name="Students" radius={[0, 6, 6, 0]} barSize={20}>
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   6. LIBRARY BOOK CIRCULATION BAR CHART
------------------------------------------------------------- */
export interface LibraryCirculationData {
  month: string
  issued: number
  returned: number
}

const defaultLibraryCirculation: LibraryCirculationData[] = [
  { month: 'Jun', issued: 120, returned: 110 },
  { month: 'Jul', issued: 145, returned: 138 },
  { month: 'Aug', issued: 180, returned: 165 },
  { month: 'Sep', issued: 210, returned: 195 },
  { month: 'Oct', issued: 160, returned: 152 },
]

export const BookCirculationBarChart: React.FC<{ data?: LibraryCirculationData[]; title?: string }> = ({
  data = defaultLibraryCirculation,
  title = 'Monthly Library Circulation (Issued vs Returned)',
}) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          CIRCULATION TRENDS
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
            <Bar dataKey="issued" name="Books Issued" fill="#0e4b38" radius={[6, 6, 0, 0]} barSize={22} />
            <Bar dataKey="returned" name="Books Returned" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   7. STUDENT ATTENDANCE VS PERFORMANCE CORRELATION CHART
------------------------------------------------------------- */
export interface AttendanceVsPerformanceData {
  studentName: string
  attendancePct: number
  academicScore: number
}

const defaultCorrelationData: AttendanceVsPerformanceData[] = [
  { studentName: 'Rahul Sharma', attendancePct: 88, academicScore: 86.4 },
  { studentName: 'Priya Patel', attendancePct: 94, academicScore: 92.0 },
  { studentName: 'Aarav Mehta', attendancePct: 72, academicScore: 68.5 },
  { studentName: 'Ananya Roy', attendancePct: 96, academicScore: 94.2 },
  { studentName: 'Karan Singh', attendancePct: 82, academicScore: 79.0 },
]

export const StudentAttendanceVsPerformanceChart: React.FC<{
  data?: AttendanceVsPerformanceData[]
  title?: string
}> = ({ data = defaultCorrelationData, title = 'Student Attendance vs Academic Score Correlation' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          TEACHER INSIGHTS
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="studentName" tick={{ fill: '#50685e', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val}%`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
            <Bar dataKey="attendancePct" name="Attendance Rate (%)" fill="#0e4b38" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="academicScore" name="Academic Score (%)" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   8. TEACHER CLASS ACADEMIC STANDING DONUT CHART
------------------------------------------------------------- */
export interface ClassStandingData {
  standing: string
  count: number
  color: string
}

const defaultClassStandingData: ClassStandingData[] = [
  { standing: 'Distinction (>85%)', count: 14, color: '#0e4b38' },
  { standing: 'Merit (75-85%)', count: 18, color: '#16a34a' },
  { standing: 'Pass (60-75%)', count: 8, color: '#2563eb' },
  { standing: 'Needs Focus (<60%)', count: 3, color: '#d97706' },
]

export const TeacherClassStatusDonutChart: React.FC<{
  data?: ClassStandingData[]
  title?: string
}> = ({ data = defaultClassStandingData, title = 'Class 8-A Academic Standing Breakdown' }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          CLASS ACADEMIC PROFILE
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-56 w-full text-xs relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} Students`, 'Count']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#c9dcd2',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-[#7e948c]">Enrolled</span>
            <span className="font-editorial text-base font-bold text-[#14241e]">{total}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {data.map((item) => (
            <div key={item.standing} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-[#14241e]">{item.standing}</span>
              </div>
              <span className="font-bold text-[#14241e]">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   9. MULTI-TERM SCORE PROGRESSION LINE CHART
------------------------------------------------------------- */
export interface TermProgressData {
  term: string
  scorePct: number
  classAvgPct: number
}

const defaultTermProgressData: TermProgressData[] = [
  { term: 'Unit Test 1', scorePct: 82.0, classAvgPct: 75.0 },
  { term: 'Term 1 Midterm', scorePct: 86.4, classAvgPct: 78.2 },
  { term: 'Unit Test 2', scorePct: 88.5, classAvgPct: 79.0 },
  { term: 'Term 2 Target', scorePct: 91.0, classAvgPct: 81.5 },
]

export const StudentTermProgressLineChart: React.FC<{
  data?: TermProgressData[]
  title?: string
}> = ({ data = defaultTermProgressData, title = 'Multi-Term Score Growth & Trajectory' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          PROGRESS TRAJECTORY
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="term" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val}%`, 'Score']}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
            <Line
              type="monotone"
              dataKey="scorePct"
              name="My Score (%)"
              stroke="#0e4b38"
              strokeWidth={3}
              dot={{ fill: '#0e4b38', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="classAvgPct"
              name="Class Avg (%)"
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ fill: '#2563eb', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   10. LIBRARY BOOK CATEGORY PIE CHART
------------------------------------------------------------- */
export interface LibraryCategoryPieData {
  category: string
  count: number
  color: string
}

const defaultCategoryPieData: LibraryCategoryPieData[] = [
  { category: 'Science & Nature', count: 420, color: '#0e4b38' },
  { category: 'Mathematics', count: 310, color: '#16a34a' },
  { category: 'Literature & Fiction', count: 540, color: '#2563eb' },
  { category: 'History & Civics', count: 280, color: '#d97706' },
  { category: 'Encyclopedias', count: 150, color: '#8b5cf6' },
]

export const LibraryCategoryPieChart: React.FC<{
  data?: LibraryCategoryPieData[]
  title?: string
}> = ({ data = defaultCategoryPieData, title = 'Library Catalog Volume by Genre & Category' }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          CATALOG GENRE BREAKDOWN
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-56 w-full text-xs relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} Books`, 'Volume']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#c9dcd2',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 text-xs">
          {data.map((item) => {
            const pct = Math.round((item.count / total) * 100)
            return (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-[#14241e] truncate max-w-[130px]">{item.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#14241e]">{item.count}</span>
                  <span className="text-[10px] text-[#7e948c] ml-1">({pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   11. TRANSPORT BUS ROUTE CAPACITY BAR CHART
------------------------------------------------------------- */
export interface TransportRouteData {
  route: string
  capacity: number
  enrolled: number
}

const defaultTransportData: TransportRouteData[] = [
  { route: 'Route 01 (Sarjapur)', capacity: 40, enrolled: 38 },
  { route: 'Route 02 (Indiranagar)', capacity: 40, enrolled: 35 },
  { route: 'Route 03 (Whitefield)', capacity: 40, enrolled: 39 },
  { route: 'Route 04 (Koramangala)', capacity: 40, enrolled: 32 },
]

export const TransportUtilizationBarChart: React.FC<{
  data?: TransportRouteData[]
  title?: string
}> = ({ data = defaultTransportData, title = 'School Bus Route Occupancy vs Seating Capacity' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          FLEET & TRANSPORT LOGISTICS
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="route" tick={{ fill: '#50685e', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 45]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
            <Bar dataKey="enrolled" name="Enrolled Passengers" fill="#0e4b38" radius={[6, 6, 0, 0]} barSize={22} />
            <Bar dataKey="capacity" name="Max Bus Capacity" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   12. FEE CATEGORY REVENUE BREAKDOWN BAR CHART
------------------------------------------------------------- */
export interface FeeCategoryRevenueData {
  category: string
  amount: number
}

const defaultFeeCategoryData: FeeCategoryRevenueData[] = [
  { category: 'Tuition Fee', amount: 85000 },
  { category: 'Transport', amount: 25000 },
  { category: 'Activity & Lab', amount: 18000 },
  { category: 'Books & Kits', amount: 12000 },
]

export const FeeCategoryBreakdownBarChart: React.FC<{
  data?: FeeCategoryRevenueData[]
  title?: string
}> = ({ data = defaultFeeCategoryData, title = 'Fee Collections by Category Component' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          REVENUE COMPONENTS
        </span>
        <h3 className="font-editorial text-lg font-medium text-[#14241e]">{title}</h3>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#c9dcd2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="amount" name="Collected Amount" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   13. REPORT CARD — SUBJECT SCORE COMPONENT BREAKDOWN (STACKED BAR)
   Shows HOW marks were earned: Theory vs Practical vs Internal
------------------------------------------------------------- */
export interface ReportCardSubjectBreakdown {
  subject: string
  theory: number
  practical: number
  internal: number
}

const defaultReportCardBreakdown: ReportCardSubjectBreakdown[] = [
  { subject: 'Math', theory: 52, practical: 18, internal: 18 },
  { subject: 'Science', theory: 48, practical: 16, internal: 16 },
  { subject: 'English', theory: 55, practical: 14, internal: 18 },
  { subject: 'Soc. St.', theory: 46, practical: 14, internal: 14 },
  { subject: 'Comp.', theory: 50, practical: 19, internal: 19 },
]

export const ReportCardMarkBreakdownChart: React.FC<{
  data?: ReportCardSubjectBreakdown[]
  title?: string
}> = ({ data = defaultReportCardBreakdown, title = 'Subject Score Breakdown by Evaluation Component' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          MARKS COMPOSITION
        </span>
        <h3 className="font-editorial text-base font-medium text-[#14241e]">{title}</h3>
        <p className="text-[10px] text-[#7e948c] mt-0.5">How were the marks earned? Theory + Practical + Internal Assessment</p>
      </div>

      <div className="h-52 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="subject" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#c9dcd2', borderRadius: '10px', fontSize: '11px' }}
              formatter={(val: any) => [`${val} marks`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
            <Bar dataKey="theory" name="Written Theory" stackId="a" fill="#0e4b38" />
            <Bar dataKey="practical" name="Practical / Lab" stackId="a" fill="#16a34a" />
            <Bar dataKey="internal" name="Internal Assessment" stackId="a" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 pt-1 flex-wrap">
        {[
          { color: '#0e4b38', label: 'Written Theory (60 marks)', desc: 'End-term exam score' },
          { color: '#16a34a', label: 'Practical / Lab (20 marks)', desc: 'Lab sessions & experiments' },
          { color: '#2563eb', label: 'Internal Assessment (20 marks)', desc: 'Projects, assignments & quiz' },
        ].map((k) => (
          <div key={k.label} className="flex items-start gap-1.5">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: k.color }} />
            <div>
              <div className="text-[10px] font-bold text-[#14241e]">{k.label}</div>
              <div className="text-[9px] text-[#7e948c]">{k.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   14. REPORT CARD — HOLISTIC COMPETENCY RADIAL CHART
   360-degree learning habit profile for parent insight
------------------------------------------------------------- */
export interface CompetencyRadialData {
  name: string
  score: number
  fill: string
}

const defaultCompetencyData: CompetencyRadialData[] = [
  { name: 'Conceptual Clarity', score: 88, fill: '#0e4b38' },
  { name: 'Problem Solving', score: 82, fill: '#16a34a' },
  { name: 'Class Participation', score: 75, fill: '#2563eb' },
  { name: 'Project Execution', score: 90, fill: '#d97706' },
  { name: 'Homework Consistency', score: 78, fill: '#8b5cf6' },
]

export const ReportCardSkillCompetencyRadialChart: React.FC<{
  data?: CompetencyRadialData[]
  title?: string
}> = ({ data = defaultCompetencyData, title = 'Holistic Learning & Competency Profile' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          360° LEARNER PROFILE
        </span>
        <h3 className="font-editorial text-base font-medium text-[#14241e]">{title}</h3>
        <p className="text-[10px] text-[#7e948c] mt-0.5">Beyond scores — how your child learns, engages, and grows</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="h-52 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={data}
              startAngle={180}
              endAngle={-180}
            >
              <RadialBar
                dataKey="score"
                cornerRadius={6}
                background={{ fill: '#f0f7f3' }}
                label={{ fill: '#14241e', fontSize: 9, position: 'insideStart' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderColor: '#c9dcd2', borderRadius: '10px', fontSize: '11px' }}
                formatter={(val: any) => [`${val}/100`, 'Competency Score']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.fill }} />
                  <span className="font-medium text-[#14241e]">{item.name}</span>
                </div>
                <span className="font-bold text-[#14241e]">{item.score}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%`, backgroundColor: item.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   15. REPORT CARD — SUBJECT PEER BENCHMARK COMPARISON CHART
   Child Score vs Class Average vs Highest in Class
------------------------------------------------------------- */
export interface SubjectBenchmarkData {
  subject: string
  myScore: number
  classAvg: number
  classHighest: number
}

const defaultBenchmarkData: SubjectBenchmarkData[] = [
  { subject: 'Math', myScore: 88, classAvg: 76, classHighest: 96 },
  { subject: 'Science', myScore: 80, classAvg: 74, classHighest: 92 },
  { subject: 'English', myScore: 87, classAvg: 79, classHighest: 95 },
  { subject: 'Soc. St.', myScore: 74, classAvg: 71, classHighest: 88 },
  { subject: 'Comp.', myScore: 95, classAvg: 82, classHighest: 98 },
]

export const ReportCardBenchmarkComparisonChart: React.FC<{
  data?: SubjectBenchmarkData[]
  title?: string
  studentName?: string
}> = ({ data = defaultBenchmarkData, title = 'Peer Benchmark — My Score vs Class Average vs Top Score', studentName = 'Student' }) => {
  return (
    <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 space-y-3">
      <div className="border-b border-[#edf3ef] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e948c]">
          PEER BENCHMARK ANALYSIS
        </span>
        <h3 className="font-editorial text-base font-medium text-[#14241e]">{title}</h3>
        <p className="text-[10px] text-[#7e948c] mt-0.5">Where does {studentName} stand among classmates in each subject?</p>
      </div>

      <div className="h-56 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef4f0" vertical={false} />
            <XAxis dataKey="subject" tick={{ fill: '#50685e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#50685e', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#c9dcd2', borderRadius: '10px', fontSize: '11px' }}
              formatter={(val: any) => [`${val}/100`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
            <Bar dataKey="myScore" name={`${studentName}'s Score`} fill="#0e4b38" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="classAvg" name="Class Average" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="classHighest" name="Class Highest" fill="#d97706" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight callout */}
      {data.filter(d => d.myScore >= d.classAvg).length >= 3 && (
        <div className="rounded-lg bg-[#e8f6ed] border border-[#bbf7d0] px-3 py-2 text-[10px] font-semibold text-[#14532d]">
          ✅ {studentName} is performing <strong>above class average</strong> in {data.filter(d => d.myScore >= d.classAvg).length} out of {data.length} subjects — excellent peer standing!
        </div>
      )}
      {data.filter(d => d.myScore < d.classAvg).length >= 3 && (
        <div className="rounded-lg bg-[#fff7ed] border border-[#fed7aa] px-3 py-2 text-[10px] font-semibold text-[#92400e]">
          ⚠️ {studentName} is below class average in {data.filter(d => d.myScore < d.classAvg).length} subjects. Focused revision recommended.
        </div>
      )}
    </div>
  )
}
