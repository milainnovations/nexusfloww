import React, { useState } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { StatCard } from '../components/common/StatCard'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { FeeCollectionDonutChart, FeeCategoryBreakdownBarChart } from '../components/analytics/AnalyticsCharts'
import type { Invoice } from '../data/mockData'

export const FeesPage: React.FC = () => {
  const { user } = useAuth()
  const {
    students,
    invoices,
    totalFeesOutstanding,
    totalFeesCollected,
    overdueCount,
    addInvoice,
    markInvoicePaid,
  } = useErpData()

  const role = user?.role || 'Principal'
  const isStudentOrParent = role === 'Student' || role === 'Parent'
  const isManagement = role === 'Principal' || role === 'Super Admin'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Overdue'>('All')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null)

  // Invoice Form State
  const [invStudentRoll, setInvStudentRoll] = useState(students[0]?.rollNumber || '')
  const [invAmount, setInvAmount] = useState('25000')
  const [invDueDate, setInvDueDate] = useState('30 Sep 2024')
  const [invType, setInvType] = useState<Invoice['feeType']>('Term 1 Tuition Fee')

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (isStudentOrParent) {
      return inv.studentRoll === 'SCH-8A-01'
    }

    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.classGrade.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    const st = students.find((s) => s.rollNumber === invStudentRoll)
    if (st) {
      addInvoice({
        studentRoll: st.rollNumber,
        studentName: st.name,
        classGrade: st.classGrade,
        amount: Number(invAmount),
        dueDate: invDueDate,
        status: 'Pending',
        feeType: invType,
      })
    }
    setShowIssueModal(false)
  }

  const handlePay = (inv: Invoice) => {
    markInvoicePaid(inv.id)
    setSelectedReceipt({
      ...inv,
      status: 'Paid',
      paidDate: new Date().toLocaleDateString('en-GB'),
    })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD SCHOOL ACCOUNTS & BURSAR
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            {isStudentOrParent ? 'My School Fees & Receipts' : 'Fee Collections & Dues'}
          </h1>
          <p className="text-sm text-[#50685e]">
            {isStudentOrParent
              ? 'Review term tuition fees, bus transport charges, online payments, and download official receipts.'
              : 'School fee management, installment tracking, bus fee collection, and recovery ledgers.'}
          </p>
        </div>

        {isManagement && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Issue Fee Bill</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={isStudentOrParent ? 'My Outstanding Dues' : 'Total Fees Outstanding'}
          value={`₹${totalFeesOutstanding.toLocaleString('en-IN')}`}
          subtext={isStudentOrParent ? 'Due before term exams' : `${invoices.filter((i) => i.status !== 'Paid').length} pending bills across school`}
          icon={CreditCard}
          iconColor={totalFeesOutstanding > 0 ? 'amber' : 'green'}
        />
        <StatCard
          label={isStudentOrParent ? 'Total Fees Paid' : 'Total Collected (Session 24–25)'}
          value={`₹${totalFeesCollected.toLocaleString('en-IN')}`}
          subtext="Verified official collections"
          icon={CheckCircle2}
          iconColor="green"
        />
        <StatCard
          label="Overdue Invoices"
          value={overdueCount}
          subtext="Bills requiring reminder notifications"
          icon={AlertCircle}
          iconColor={overdueCount > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Financial Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FeeCollectionDonutChart title={isStudentOrParent ? "My Fee Installment Clearance & Distribution" : "School Financial Clearance & Dues Settlement Breakdown"} />
        <FeeCategoryBreakdownBarChart title="Fee Collections by Category Component" />
      </div>

      {/* Filter / Search Bar */}
      {!isStudentOrParent && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#e2ece6] bg-white p-4 shadow-bluke-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#14241e]">Status:</span>
            {(['All', 'Pending', 'Paid', 'Overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0e4b38] text-white'
                    : 'bg-[#f4f8f5] text-[#485c54] hover:bg-[#e8f2ec]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, invoice #, class..."
              className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3.5 px-6">INVOICE NUMBER</th>
                <th className="py-3.5 px-6">STUDENT & CLASS</th>
                <th className="py-3.5 px-6">FEE COMPONENT</th>
                <th className="py-3.5 px-6">AMOUNT</th>
                <th className="py-3.5 px-6">DUE DATE</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef]">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#f7faf8] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#14241e]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#14241e]">{inv.studentName}</div>
                    <div className="text-[11px] text-[#71877e]">
                      {inv.classGrade} • {inv.studentRoll}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-[#14241e]">{inv.feeType}</td>
                  <td className="py-4 px-6 font-mono font-bold text-sm text-[#0e4b38]">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-[#50685e]">{inv.dueDate}</td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        inv.status === 'Paid'
                          ? 'green'
                          : inv.status === 'Overdue'
                          ? 'neutral'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {inv.status !== 'Paid' ? (
                      <button
                        onClick={() => handlePay(inv)}
                        className="rounded-lg bg-[#0e4b38] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#125641] transition-all"
                      >
                        {isStudentOrParent ? 'Pay Online' : 'Mark as Paid'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedReceipt(inv)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#c5d8cd] px-3 py-1.5 text-xs font-semibold text-[#0e4b38] hover:bg-[#eef5f1] transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Receipt</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Issue Invoice */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title="Issue School Fee Bill"
        subtitle="Debit a fee installment against a student's register."
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Student</label>
            <select
              value={invStudentRoll}
              onChange={(e) => setInvStudentRoll(e.target.value)}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.rollNumber}>
                  {s.name} ({s.classGrade} • {s.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Fee Type</label>
              <select
                value={invType}
                onChange={(e) => setInvType(e.target.value as any)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option value="Term 1 Tuition Fee">Term 1 Tuition Fee</option>
                <option value="School Bus & Transport">School Bus & Transport</option>
                <option value="Annual Activity & Lab">Annual Activity & Lab</option>
                <option value="Uniform & Books Kit">Uniform & Books Kit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Amount (₹)</label>
              <input
                type="number"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">Due Date</label>
            <input
              type="text"
              value={invDueDate}
              onChange={(e) => setInvDueDate(e.target.value)}
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={() => setShowIssueModal(false)}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Official Receipt Preview */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official School Fee Receipt"
        subtitle={selectedReceipt ? `Receipt #${selectedReceipt.invoiceNumber}` : ''}
      >
        {selectedReceipt && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-[#0e4b38] pb-4 text-center">
              <div className="font-editorial text-lg font-bold text-[#0e4b38]">
                Greenwood International School
              </div>
              <div className="text-[10px] text-[#71877e]">
                CBSE Affiliation #83042 • Official Bursar Receipt
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#f8faf9] p-4 rounded-xl border border-[#edf3ef]">
              <div>
                <span className="text-[#71877e] block">Student:</span>
                <span className="font-bold text-[#14241e]">{selectedReceipt.studentName}</span>
              </div>
              <div>
                <span className="text-[#71877e] block">Roll Number:</span>
                <span className="font-mono font-bold text-[#14241e]">{selectedReceipt.studentRoll}</span>
              </div>
              <div>
                <span className="text-[#71877e] block">Class:</span>
                <span className="font-semibold text-[#14241e]">{selectedReceipt.classGrade}</span>
              </div>
              <div>
                <span className="text-[#71877e] block">Payment Date:</span>
                <span className="font-semibold text-[#0e4b38]">
                  {selectedReceipt.paidDate || '08 Aug 2024'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#edf3ef] p-4 flex justify-between items-center bg-[#fafcfb]">
              <div>
                <div className="font-bold text-[#14241e] text-sm">{selectedReceipt.feeType}</div>
                <div className="text-[11px] text-[#71877e]">Payment Method: Online UPI / NetBanking</div>
              </div>
              <div className="font-mono font-bold text-lg text-[#0e4b38]">
                ₹{selectedReceipt.amount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#71877e] pt-2 border-t border-[#edf3ef]">
              <span>Authorized Signature: Greenwood Bursar Desk</span>
              <span className="text-[#0e4b38] font-bold">★ SEAL VERIFIED ★</span>
            </div>

            <button
              onClick={() => {
                setSelectedReceipt(null)
                window.print()
              }}
              className="w-full rounded-xl bg-[#0e4b38] py-2.5 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Print Receipt
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
