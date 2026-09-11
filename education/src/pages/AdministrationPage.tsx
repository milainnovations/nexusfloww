import React, { useState } from 'react'
import {
  Briefcase,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  UserPlus,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react'
import { useErpData } from '../context/ErpDataContext'
import { StatCard } from '../components/common/StatCard'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import {
  ExpenseCategoryBarChart,
  BudgetUtilisationDonutChart,
  MonthlyExpenseTrendChart,
  AdmissionsStatusDonutChart,
  FeeCollectionDonutChart,
  FeeRecoveryTrendAreaChart,
} from '../components/analytics/AnalyticsCharts'
import type { ExpenseRecord, AdmissionRecord } from '../data/mockData'

export const AdministrationPage: React.FC = () => {
  const {
    invoices,
    expenses,
    budgetAllocations,
    admissions,
    students,
    totalFeesCollected,
    totalFeesOutstanding,
    overdueCount,
    addExpense,
    updateExpenseStatus,
    addAdmission,
    updateAdmissionStatus,
  } = useErpData()

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'fees' | 'admissions'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('Stationery & Supplies')
  const [expDescription, setExpDescription] = useState('')
  const [expVendor, setExpVendor] = useState('')
  const [expAmount, setExpAmount] = useState('10000')
  const [expDate, setExpDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
  const [expPaymentMode, setExpPaymentMode] = useState<ExpenseRecord['paymentMode']>('Bank Transfer')
  const [expRemarks, setExpRemarks] = useState('')

  // Admission Modal State
  const [showAdmissionModal, setShowAdmissionModal] = useState(false)
  const [admApplicantName, setAdmApplicantName] = useState('')
  const [admClass, setAdmClass] = useState('Class 6-A')
  const [admGuardianName, setAdmGuardianName] = useState('')
  const [admGuardianPhone, setAdmGuardianPhone] = useState('')
  const [admRemarks, setAdmRemarks] = useState('')

  // ---- Computed KPIs ----
  const totalBudget = budgetAllocations.reduce((a, b) => a + b.allocatedAmount, 0)
  const totalSpent = budgetAllocations.reduce((a, b) => a + b.spentAmount, 0)
  const budgetUtilPct = Math.round((totalSpent / totalBudget) * 100)

  const pendingExpenses = expenses.filter((e) => e.status === 'Pending Approval')
  const approvedExpenses = expenses.filter((e) => e.status === 'Approved')
  const totalApprovedSpend = approvedExpenses.reduce((a, b) => a + b.amount, 0)

  const admittedCount = admissions.filter((a) => a.status === 'Admitted').length
  const pendingAdmissions = admissions.filter((a) => a.status === 'Under Review' || a.status === 'Shortlisted').length

  const todayFormatted = new Date()
    .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()

  // ---- Filtered Expenses ----
  const filteredExpenses = expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'All' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  // ---- Filtered Admissions ----
  const filteredAdmissions = admissions.filter((a) => {
    const matchSearch =
      a.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    addExpense({
      category: expCategory,
      description: expDescription,
      vendor: expVendor,
      amount: Number(expAmount),
      approvedBy: 'Mrs. Priya Desai (Admin Head)',
      date: expDate,
      status: 'Pending Approval',
      paymentMode: expPaymentMode,
      remarks: expRemarks || undefined,
    })
    setShowExpenseModal(false)
    setExpDescription('')
    setExpVendor('')
    setExpAmount('10000')
    setExpRemarks('')
  }

  const handleAddAdmission = (e: React.FormEvent) => {
    e.preventDefault()
    addAdmission({
      applicantName: admApplicantName,
      applyingForClass: admClass,
      guardianName: admGuardianName,
      guardianPhone: admGuardianPhone,
      applicationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Under Review',
      remarks: admRemarks || 'Documents submitted; pending review.',
    })
    setShowAdmissionModal(false)
    setAdmApplicantName('')
    setAdmGuardianName('')
    setAdmGuardianPhone('')
    setAdmRemarks('')
  }

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Approved' || status === 'Admitted') return 'green'
    if (status === 'Rejected') return 'neutral'
    return 'amber'
  }

  const getExpenseStatusIcon = (status: ExpenseRecord['status']) => {
    if (status === 'Approved') return <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
    if (status === 'Rejected') return <XCircle className="h-4 w-4 text-[#dc2626]" />
    return <Clock className="h-4 w-4 text-[#d97706]" />
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-[#dfeae3] bg-[#f4f8f5] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b857a]">
              {todayFormatted} • GREENWOOD ADMINISTRATION DESK
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#122b22] tracking-tight">
              Administration & Finance Control
            </h1>
            <p className="text-sm text-[#50685e] leading-relaxed">
              Manage school expenses, monitor budget allocations, track fee collections, and handle admissions — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveTab('expenses'); setShowExpenseModal(true) }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>+ Log Expense</span>
            </button>
            <button
              onClick={() => { setActiveTab('admissions'); setShowAdmissionModal(true) }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5d8cd] bg-white px-5 py-2.5 text-xs font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#eef5f1] transition-all shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>New Admission</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Annual Budget Utilised"
          value={`${budgetUtilPct}%`}
          subtext={`₹${(totalSpent / 100000).toFixed(1)}L of ₹${(totalBudget / 100000).toFixed(1)}L spent`}
          icon={TrendingUp}
          iconColor={budgetUtilPct > 90 ? 'amber' : 'green'}
        />
        <StatCard
          label="Fee Revenue Collected"
          value={`₹${(totalFeesCollected / 1000).toFixed(0)}k`}
          subtext={`₹${(totalFeesOutstanding / 1000).toFixed(0)}k outstanding (${overdueCount} invoices)`}
          icon={IndianRupee}
          iconColor="green"
        />
        <StatCard
          label="Pending Expense Approvals"
          value={pendingExpenses.length}
          subtext={`₹${(pendingExpenses.reduce((a, b) => a + b.amount, 0) / 1000).toFixed(0)}k awaiting sign-off`}
          icon={AlertCircle}
          iconColor={pendingExpenses.length > 0 ? 'amber' : 'green'}
        />
        <StatCard
          label="Admissions This Session"
          value={admittedCount}
          subtext={`${pendingAdmissions} applications under review`}
          icon={Briefcase}
          iconColor="green"
        />
      </div>

      {/* ── TAB NAVIGATION ───────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-[#e2ece6] bg-[#f8faf9] p-1 w-fit">
        {(['overview', 'expenses', 'fees', 'admissions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(''); setStatusFilter('All') }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#0e4b38] text-white shadow-xs'
                : 'text-[#485c54] hover:text-[#0e4b38]'
            }`}
          >
            {tab === 'overview' ? 'Overview & Analytics' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExpenseCategoryBarChart title="Expenditure by Category vs Allocated Budget" />
            <BudgetUtilisationDonutChart title="Annual Budget Utilisation Distribution" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MonthlyExpenseTrendChart title="Monthly Revenue vs Expenses Trajectory (2024–25)" />
            <FeeRecoveryTrendAreaChart title="Monthly Fee Collection & Outstanding Dues Trend" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FeeCollectionDonutChart title="Term Fee Recovery & Settlement Breakdown" />
            <AdmissionsStatusDonutChart title="Admissions Applications Status Distribution" />
          </div>

          {/* Budget Allocation Health Table */}
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                BUDGET HEALTH MONITOR
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                Department-wise Budget vs Expenditure
              </h3>
            </div>

            <div className="space-y-3">
              {budgetAllocations.map((b) => {
                const pct = Math.round((b.spentAmount / b.allocatedAmount) * 100)
                const isOverBudget = pct > 90
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="font-semibold text-[#14241e]">{b.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#50685e]">
                          ₹{(b.spentAmount / 100000).toFixed(1)}L / ₹{(b.allocatedAmount / 100000).toFixed(1)}L
                        </span>
                        <span className={`font-bold ${isOverBudget ? 'text-[#d97706]' : 'text-[#0e4b38]'}`}>
                          {pct}%
                        </span>
                        {isOverBudget ? (
                          <TrendingUp className="h-3.5 w-3.5 text-[#d97706]" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-[#16a34a]" />
                        )}
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf3ef]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: pct > 90 ? '#d97706' : b.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── EXPENSES TAB ─────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#14241e]">Status:</span>
              {(['All', 'Approved', 'Pending Approval', 'Rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s ? 'bg-[#0e4b38] text-white' : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description, vendor..."
                  className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641] transition-all shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Expense</span>
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                    <th className="py-3.5 px-5">EXPENSE #</th>
                    <th className="py-3.5 px-5">CATEGORY</th>
                    <th className="py-3.5 px-5">DESCRIPTION & VENDOR</th>
                    <th className="py-3.5 px-5">AMOUNT</th>
                    <th className="py-3.5 px-5">DATE</th>
                    <th className="py-3.5 px-5">PAYMENT</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ef]">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#f7faf8] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#14241e] text-[11px]">
                        {exp.expenseNumber}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center rounded-lg bg-[#eaf4ee] px-2 py-0.5 text-[10px] font-semibold text-[#0e4b38]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#14241e] max-w-[220px] truncate">{exp.description}</div>
                        <div className="text-[11px] text-[#71877e]">{exp.vendor}</div>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-sm text-[#0e4b38]">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 text-[#50685e]">{exp.date}</td>
                      <td className="py-3.5 px-5 text-[#50685e]">{exp.paymentMode}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          {getExpenseStatusIcon(exp.status)}
                          <Badge
                            variant={
                              exp.status === 'Approved' ? 'green' : exp.status === 'Rejected' ? 'neutral' : 'amber'
                            }
                            size="sm"
                          >
                            {exp.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {exp.status === 'Pending Approval' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateExpenseStatus(exp.id, 'Approved')}
                              className="rounded-lg bg-[#0e4b38] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#125641] transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateExpenseStatus(exp.id, 'Rejected')}
                              className="rounded-lg border border-[#fbd5d5] bg-[#fff8f8] px-2.5 py-1.5 text-[11px] font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {exp.status !== 'Pending Approval' && (
                          <span className="text-[11px] text-[#82968e] italic">
                            {exp.approvedBy.split(' ').slice(0, 2).join(' ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── FEES TAB ─────────────────────────────────────────── */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-1">
              <span className="text-xs font-semibold text-[#667a73]">Total Collected (Session)</span>
              <div className="font-editorial text-3xl font-semibold text-[#0e4b38]">
                ₹{(totalFeesCollected / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-[#16a34a] font-medium flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> {Math.round((totalFeesCollected / (totalFeesCollected + totalFeesOutstanding)) * 100)}% recovery rate
              </div>
            </div>
            <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-1">
              <span className="text-xs font-semibold text-[#667a73]">Outstanding Dues</span>
              <div className="font-editorial text-3xl font-semibold text-[#d97706]">
                ₹{(totalFeesOutstanding / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-[#71877e]">{overdueCount} invoices pending / overdue</div>
            </div>
            <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-1">
              <span className="text-xs font-semibold text-[#667a73]">Students with Dues</span>
              <div className="font-editorial text-3xl font-semibold text-[#14241e]">
                {students.filter((s) => s.dues > 0).length}
              </div>
              <div className="text-xs text-[#71877e]">of {students.length} enrolled students</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FeeCollectionDonutChart title="Term Fee Recovery & Settlement Breakdown" />
            <FeeRecoveryTrendAreaChart title="Monthly Collection & Outstanding Trend" />
          </div>

          {/* Dues by Student */}
          <div className="rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm overflow-hidden">
            <div className="border-b border-[#edf3ef] p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
                OUTSTANDING DUES REGISTER
              </span>
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                Students with Pending Fee Balances
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                    <th className="py-3.5 px-5">STUDENT & ROLL</th>
                    <th className="py-3.5 px-5">CLASS</th>
                    <th className="py-3.5 px-5">GUARDIAN</th>
                    <th className="py-3.5 px-5">DUE AMOUNT</th>
                    <th className="py-3.5 px-5">INVOICE STATUS</th>
                    <th className="py-3.5 px-5 text-right">QUICK ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ef]">
                  {students
                    .filter((s) => s.dues > 0)
                    .sort((a, b) => b.dues - a.dues)
                    .map((student) => {
                      const studentInvoices = invoices.filter(
                        (inv) => inv.studentRoll === student.rollNumber && inv.status !== 'Paid'
                      )
                      return (
                        <tr key={student.id} className="hover:bg-[#f7faf8] transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-[#14241e]">{student.name}</div>
                            <div className="text-[11px] text-[#71877e] font-mono">{student.rollNumber}</div>
                          </td>
                          <td className="py-3.5 px-5 text-[#50685e]">{student.classGrade}</td>
                          <td className="py-3.5 px-5">
                            <div className="font-medium text-[#14241e]">{student.guardianName}</div>
                            <div className="text-[11px] text-[#71877e]">{student.guardianPhone}</div>
                          </td>
                          <td className="py-3.5 px-5 font-mono font-bold text-sm text-[#b91c1c]">
                            ₹{student.dues.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-5">
                            {studentInvoices.length > 0 ? (
                              <Badge
                                variant={studentInvoices[0].status === 'Overdue' ? 'neutral' : 'amber'}
                                size="sm"
                              >
                                {studentInvoices[0].status} ({studentInvoices.length} bills)
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-[#82968e]">No active invoice</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button className="inline-flex items-center gap-1 rounded-xl border border-[#c5d8cd] px-3 py-1.5 text-xs font-semibold text-[#0e4b38] hover:bg-[#eef5f1] transition-all">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Send Reminder</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMISSIONS TAB ───────────────────────────────────── */}
      {activeTab === 'admissions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#14241e]">Status:</span>
              {(['All', 'Under Review', 'Shortlisted', 'Admitted', 'Waitlisted', 'Rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s ? 'bg-[#0e4b38] text-white' : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applicant, ID..."
                  className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => setShowAdmissionModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641] transition-all shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>New Application</span>
              </button>
            </div>
          </div>

          {/* Admissions Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdmissionsStatusDonutChart title="Admissions Applications Status Distribution" />

            {/* Quick Pipeline Summary */}
            <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">ADMISSION PIPELINE</span>
                <h3 className="font-editorial text-lg font-medium text-[#14241e]">Current Session Snapshot</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Total Applications', count: admissions.length, color: '#0e4b38' },
                  { label: 'Admitted (Confirmed)', count: admissions.filter(a => a.status === 'Admitted').length, color: '#16a34a' },
                  { label: 'Shortlisted (Interview)', count: admissions.filter(a => a.status === 'Shortlisted').length, color: '#2563eb' },
                  { label: 'Under Review', count: admissions.filter(a => a.status === 'Under Review').length, color: '#d97706' },
                  { label: 'Waitlisted', count: admissions.filter(a => a.status === 'Waitlisted').length, color: '#7c3aed' },
                  { label: 'Rejected', count: admissions.filter(a => a.status === 'Rejected').length, color: '#dc2626' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-[#14241e]">{item.label}</span>
                    </div>
                    <span className="font-bold text-[#14241e]">{item.count}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.print()}
                className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#0e4b38] hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Admissions Report</span>
              </button>
            </div>
          </div>

          {/* Admissions Table */}
          <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                    <th className="py-3.5 px-5">APPLICATION #</th>
                    <th className="py-3.5 px-5">APPLICANT</th>
                    <th className="py-3.5 px-5">CLASS APPLIED</th>
                    <th className="py-3.5 px-5">GUARDIAN</th>
                    <th className="py-3.5 px-5">APPLIED ON</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ef]">
                  {filteredAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-[#f7faf8] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[11px] text-[#14241e]">
                        {adm.applicationNumber}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#14241e]">{adm.applicantName}</div>
                        {adm.remarks && (
                          <div className="text-[11px] text-[#71877e] max-w-[200px] truncate">{adm.remarks}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-[#14241e]">{adm.applyingForClass}</td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-[#14241e]">{adm.guardianName}</div>
                        <div className="text-[11px] text-[#71877e]">{adm.guardianPhone}</div>
                      </td>
                      <td className="py-3.5 px-5 text-[#50685e]">{adm.applicationDate}</td>
                      <td className="py-3.5 px-5">
                        <Badge variant={getStatusBadgeVariant(adm.status)} size="sm">
                          {adm.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {adm.status === 'Under Review' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateAdmissionStatus(adm.id, 'Shortlisted')}
                              className="rounded-lg bg-[#0e4b38] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#125641] transition-all"
                            >
                              Shortlist
                            </button>
                          </div>
                        )}
                        {adm.status === 'Shortlisted' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateAdmissionStatus(adm.id, 'Admitted', 'Admitted after successful interview.')}
                              className="rounded-lg bg-[#0e4b38] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#125641] transition-all"
                            >
                              Admit
                            </button>
                            <button
                              onClick={() => updateAdmissionStatus(adm.id, 'Rejected', 'Did not meet requirements.')}
                              className="rounded-lg border border-[#fbd5d5] bg-[#fff8f8] px-2.5 py-1.5 text-[11px] font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {(adm.status === 'Admitted' || adm.status === 'Rejected' || adm.status === 'Waitlisted') && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#82968e]">
                            <ChevronRight className="h-3.5 w-3.5" />
                            {adm.status === 'Admitted' ? 'Enrolled' : adm.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Log Expense ───────────────────────────────── */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Log New Expense"
        subtitle="Record a school expenditure for approval and budget tracking."
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Expense Category</label>
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value as ExpenseRecord['category'])}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              <option value="Salaries & Staff">Salaries & Staff</option>
              <option value="Infrastructure & Maintenance">Infrastructure & Maintenance</option>
              <option value="Utilities & Bills">Utilities & Bills</option>
              <option value="Stationery & Supplies">Stationery & Supplies</option>
              <option value="Transport & Fleet">Transport & Fleet</option>
              <option value="Events & Activities">Events & Activities</option>
              <option value="Technology & IT">Technology & IT</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Description</label>
            <input
              type="text"
              required
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="e.g. Monthly electricity bill — October"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Vendor / Payee</label>
              <input
                type="text"
                required
                value={expVendor}
                onChange={(e) => setExpVendor(e.target.value)}
                placeholder="Vendor name"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Payment Mode</label>
              <select
                value={expPaymentMode}
                onChange={(e) => setExpPaymentMode(e.target.value as ExpenseRecord['paymentMode'])}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Date</label>
              <input
                type="text"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Remarks (optional)</label>
            <textarea
              value={expRemarks}
              onChange={(e) => setExpRemarks(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: New Admission ─────────────────────────────── */}
      <Modal
        isOpen={showAdmissionModal}
        onClose={() => setShowAdmissionModal(false)}
        title="Register New Admission Application"
        subtitle="Log a new applicant to the admissions pipeline."
      >
        <form onSubmit={handleAddAdmission} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Applicant Full Name</label>
            <input
              type="text"
              required
              value={admApplicantName}
              onChange={(e) => setAdmApplicantName(e.target.value)}
              placeholder="e.g. Arjun Rao"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Applying for Class</label>
            <select
              value={admClass}
              onChange={(e) => setAdmClass(e.target.value)}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              {['Class 6-A', 'Class 6-B', 'Class 7-A', 'Class 8-A', 'Class 9-A', 'Class 10-A'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Name</label>
              <input
                type="text"
                required
                value={admGuardianName}
                onChange={(e) => setAdmGuardianName(e.target.value)}
                placeholder="Parent / Guardian"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Phone</label>
              <input
                type="text"
                required
                value={admGuardianPhone}
                onChange={(e) => setAdmGuardianPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Initial Remarks</label>
            <textarea
              value={admRemarks}
              onChange={(e) => setAdmRemarks(e.target.value)}
              placeholder="Notes about the application..."
              rows={2}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowAdmissionModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Register Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
