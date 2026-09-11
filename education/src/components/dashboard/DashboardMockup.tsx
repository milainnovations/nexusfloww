import { motion } from 'framer-motion'
import {
  Users,
  Package,
  Bell,
  BarChart3,
  GraduationCap,
  DollarSign,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { Badge } from '../ui/Badge'

const chartData = [
  { name: 'Jan', sales: 4200, students: 2400 },
  { name: 'Feb', sales: 5100, students: 2800 },
  { name: 'Mar', sales: 4800, students: 3200 },
  { name: 'Apr', sales: 6200, students: 3600 },
  { name: 'May', sales: 7100, students: 4100 },
  { name: 'Jun', sales: 8400, students: 4500 },
]

const notifications = [
  { text: 'Campus Desk roll call verified', time: '2m ago', type: 'success' as const },
  { text: 'Fee Invoice #2024-001 collected', time: '15m ago', type: 'success' as const },
  { text: '6 learners on attendance watch', time: '1h ago', type: 'warning' as const },
]

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#0e4b38]/15 via-[#10b981]/15 to-[#34d399]/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-[#dce8e1] bg-white shadow-bluke-lg">
        <div className="flex items-center justify-between border-b border-[#edf3ef] bg-[#fbfdfc] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
            </div>
            <span className="ml-2 text-xs font-semibold text-[#14241e]">Greenwood ERP Live Desk</span>
          </div>
          <span className="rounded-full bg-[#e8f6ed] px-2.5 py-0.5 text-[10px] font-bold text-[#0e4b38]">
            Connected
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: DollarSign, label: 'Fee Revenue', value: '₹84.2L', change: '+12.5%', color: 'text-[#0e4b38]' },
            { icon: Users, label: 'Faculty', value: '4 Active', change: '+100%', color: 'text-[#0e4b38]' },
            { icon: Package, label: 'Hostel Beds', value: '92.4%', change: 'Optimal', color: 'text-[#10b981]' },
            { icon: GraduationCap, label: 'Enrollment', value: '8 Cohort', change: '+15.3%', color: 'text-[#0e4b38]' },
          ].map(({ icon: Icon, label, value, change, color }) => (
            <div
              key={label}
              className="rounded-xl border border-[#e2ece6] bg-[#fbfdfc] p-3"
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${color}`} />
                <Badge variant={change.startsWith('+') ? 'success' : 'default'}>
                  {change}
                </Badge>
              </div>
              <p className="mt-2 font-editorial text-xl font-semibold text-[#14241e]">{value}</p>
              <p className="text-[10px] text-[#71877e] uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 px-4 pb-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[#e2ece6] bg-[#fbfdfc] p-3 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#14241e]">
                Academic Attendance & Registration Flow
              </span>
              <BarChart3 className="h-4 w-4 text-[#0e4b38]" />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e4b38" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0e4b38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71877e' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, backgroundColor: '#ffffff', border: '1px solid #dce8e1', color: '#14241e' }} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0e4b38"
                  strokeWidth={2}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-[#e2ece6] bg-[#fbfdfc] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#14241e]">Live Activity</span>
              <Bell className="h-3.5 w-3.5 text-[#8fa39b]" />
            </div>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.text}
                  className="rounded-lg bg-white p-2 text-xs shadow-2xs border border-[#edf3ef]"
                >
                  <p className="font-semibold text-[11px] text-[#14241e] leading-tight">{n.text}</p>
                  <p className="text-[10px] text-[#71877e] mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#edf3ef] bg-[#f4f8f5] px-4 py-2.5 text-xs text-[#50685e]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-[#10b981]" /> Live System Audit
            </span>
            <span>Zero Clashes</span>
            <span>RBAC Secured</span>
          </div>
          <span className="font-semibold text-[#0e4b38]">Greenwood ERP</span>
        </div>
      </div>
    </motion.div>
  )
}
