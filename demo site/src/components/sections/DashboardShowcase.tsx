import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Package,
  Users,
  Calendar,
  FileText,
  Activity,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

const revenueData = [
  { month: 'Jan', revenue: 45000, target: 40000 },
  { month: 'Feb', revenue: 52000, target: 45000 },
  { month: 'Mar', revenue: 48000, target: 50000 },
  { month: 'Apr', revenue: 61000, target: 55000 },
  { month: 'May', revenue: 72000, target: 60000 },
  { month: 'Jun', revenue: 84000, target: 70000 },
]

const admissionsData = [
  { month: 'Jan', admissions: 120 },
  { month: 'Feb', admissions: 180 },
  { month: 'Mar', admissions: 240 },
  { month: 'Apr', admissions: 310 },
  { month: 'May', admissions: 280 },
  { month: 'Jun', admissions: 420 },
]

const attendanceData = [
  { name: 'Present', value: 87, color: '#0e4b38' },
  { name: 'Absent', value: 8, color: '#ef4444' },
  { name: 'On Leave', value: 5, color: '#f59e0b' },
]

const inventoryData = [
  { category: 'LT Halls', stock: 420 },
  { category: 'Labs', stock: 680 },
  { category: 'Hostel', stock: 340 },
  { category: 'Library', stock: 210 },
]

const performanceData = [
  { subject: 'Data Structures', score: 85 },
  { subject: 'Electronics', score: 78 },
  { subject: 'Algorithms', score: 92 },
  { subject: 'Databases', score: 74 },
]

const recentActivities = [
  { text: 'Campus Desk roll call synced for CS301', time: '5 min ago', icon: Package },
  { text: 'Fee Invoice #2024-001 issued', time: '12 min ago', icon: FileText },
  { text: 'Student attendance verified by Dr. Anita', time: '25 min ago', icon: ClipboardCheck },
  { text: 'Hostel room block B allocated', time: '1 hour ago', icon: DollarSign },
]

const tabs = [
  { id: 'business', label: 'Business Operations View' },
  { id: 'education', label: 'Higher Education (Campus Desk) View' },
] as const

type TabId = (typeof tabs)[number]['id']

function BusinessDashboard() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[#e2ece6] bg-[#fbfdfc] p-5 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-editorial text-lg font-semibold text-[#14241e]">Revenue & Invoicing Trend</span>
          <Badge variant="success">+18.2% vs target</Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e4b38" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0e4b38" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf3ef" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71877e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#71877e' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2ece6', borderRadius: 8 }} />
            <Area type="monotone" dataKey="revenue" stroke="#0e4b38" fill="url(#revGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-[#e2ece6] bg-[#fbfdfc] p-5">
        <span className="font-editorial text-lg font-semibold text-[#14241e] block mb-2">Facility Capacity</span>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={inventoryData}>
            <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#71877e' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2ece6', borderRadius: 8 }} />
            <Bar dataKey="stock" fill="#0e4b38" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:col-span-3">
        {[
          { icon: DollarSign, label: 'Ledger Inflow', value: '₹84.2L', color: 'text-[#0e4b38]' },
          { icon: Package, label: 'Registered Assets', value: '1,650', color: 'text-[#10b981]' },
          { icon: FileText, label: 'Processed Receipts', value: '247', color: 'text-[#0e4b38]' },
          { icon: Users, label: 'Authorized Staff', value: '28 Users', color: 'text-[#10b981]' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#e2ece6] bg-white p-4 shadow-2xs">
            <Icon className={`mb-2 h-5 w-5 ${color}`} />
            <p className="font-editorial text-2xl font-semibold text-[#14241e]">{value}</p>
            <p className="text-[11px] text-[#71877e] font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EducationDashboard() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[#e2ece6] bg-[#fbfdfc] p-5 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-editorial text-lg font-semibold text-[#14241e]">Admissions Inflow</span>
          <Badge variant="success">+32% YoY</Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={admissionsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf3ef" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71877e' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#71877e' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2ece6', borderRadius: 8 }} />
            <Line type="monotone" dataKey="admissions" stroke="#0e4b38" strokeWidth={2} dot={{ fill: '#0e4b38' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-[#e2ece6] bg-[#fbfdfc] p-5">
        <span className="font-editorial text-lg font-semibold text-[#14241e] block mb-2">Daily Roll Call</span>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={4}>
              {attendanceData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2ece6', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 text-xs font-semibold text-[#14241e]">
          {attendanceData.map((d) => (
            <span key={d.name} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2ece6] bg-[#fbfdfc] p-5 lg:col-span-2">
        <span className="font-editorial text-lg font-semibold text-[#14241e] block mb-2">Subject Performance Evaluation</span>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={performanceData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#71877e' }} />
            <YAxis dataKey="subject" type="category" tick={{ fontSize: 10, fill: '#71877e' }} width={90} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2ece6', borderRadius: 8 }} />
            <Bar dataKey="score" fill="#0e4b38" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-[#e2ece6] bg-[#fbfdfc] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#0e4b38]" />
          <span className="text-xs font-bold text-[#14241e] uppercase tracking-wider">Campus Desk Schedule</span>
        </div>
        <ul className="space-y-2.5">
          {['Academic Senate Meeting', 'Semester Fee Ledger Due', 'Timetable Clash Validator'].map((task) => (
            <li key={task} className="flex items-center gap-2 text-xs font-medium text-[#485c54]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
              {task}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>('business')

  return (
    <section id="dashboard" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Interactive Analytics"
            title="Powerful dashboards for every operation"
            subtitle="Real-time analytics at your fingertips. Switch seamlessly between business and education views."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-md">
            <div className="flex border-b border-[#e2ece6] bg-[#fbfdfc]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex-1 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors',
                    activeTab === tab.id
                      ? 'text-[#0e4b38] bg-white'
                      : 'text-[#71877e] hover:text-[#14241e]',
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="dashboard-tab"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0e4b38]"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeTab === 'business' ? <BusinessDashboard /> : <EducationDashboard />}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t border-[#edf3ef] bg-[#f4f8f5] px-6 py-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#485c54]">
                <Activity className="h-4 w-4 text-[#10b981]" />
                Live Desk Audit Log
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {recentActivities.map(({ text, time, icon: Icon }) => (
                  <div
                    key={text}
                    className="flex items-start gap-2.5 rounded-xl border border-[#e2ece6] bg-white p-3 shadow-2xs"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0e4b38]" />
                    <div>
                      <p className="text-xs font-semibold text-[#14241e]">{text}</p>
                      <p className="text-[10px] text-[#71877e]">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
