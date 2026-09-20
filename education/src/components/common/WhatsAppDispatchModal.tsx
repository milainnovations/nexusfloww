import React, { useState } from 'react'
import { Modal } from './Modal'
import { MessageSquare, Send, CheckCircle2, ShieldCheck, Phone, Check, ShieldAlert } from 'lucide-react'
import { sendWhatsAppMessage, WhatsAppMessageLog } from '../../services/whatsappService'
import { useAuth } from '../../context/AuthContext'

interface WhatsAppDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  studentName?: string
  studentRoll?: string
  guardianName?: string
  guardianPhone?: string
  classGrade?: string
  defaultTemplate?: WhatsAppMessageLog['templateType']
  amount?: number
  feeType?: string
}

export const WhatsAppDispatchModal: React.FC<WhatsAppDispatchModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Rahul Sharma',
  studentRoll = 'SCH-8A-01',
  guardianName = 'Alok Dixit',
  guardianPhone = '+91 98765 43210',
  classGrade = 'Class 8-A',
  defaultTemplate = 'Fee Receipt',
  amount = 25000,
  feeType = 'Term 1 Tuition Fee',
}) => {
  const { user } = useAuth()
  const role = user?.role || 'Principal'
  const isStudentOrParent = role === 'Student' || role === 'Parent'
  const canSendFinancial = role === 'Principal' || role === 'Super Admin' || role === 'Administration'
  const canSendAcademic = role === 'Principal' || role === 'Super Admin' || role === 'Teacher'

  const [templateType, setTemplateType] = useState<WhatsAppMessageLog['templateType']>(defaultTemplate)
  const [customMsg, setCustomMsg] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [successLog, setSuccessLog] = useState<WhatsAppMessageLog | null>(null)

  const generateDefaultMessage = () => {
    switch (templateType) {
      case 'Fee Receipt':
        return `✅ *GREENWOOD INT. SCHOOL — FEE RECEIPT*\n\nDear ${guardianName},\nPayment of *₹${amount.toLocaleString('en-IN')}* for *${feeType}* has been successfully received.\n\n*Student:* ${studentName} (${classGrade})\n*Roll No:* ${studentRoll}\n*Receipt No:* REC-${Date.now().toString().slice(-5)}\n\nThank you for choosing Greenwood School!`
      case 'Fee Reminder':
        return `🔔 *GREENWOOD INT. SCHOOL — FEE DUES NOTICE*\n\nDear ${guardianName},\nThis is a polite reminder that *₹${amount.toLocaleString('en-IN')}* for *${feeType}* is due for payment.\n\n*Student:* ${studentName} (${classGrade})\n*Roll No:* ${studentRoll}\n\nPlease click here to pay online: https://greenwood.edu/pay?roll=${studentRoll}`
      case 'Attendance Alert':
        return `⚠️ *GREENWOOD INT. SCHOOL — ATTENDANCE ALERT*\n\nDear ${guardianName},\nYour ward *${studentName}* (${classGrade}, Roll: ${studentRoll}) was marked *ABSENT* for morning assembly today.\n\nIf this was planned, please submit a leave note via your Parent Portal.`
      case 'Report Card':
        return `📜 *GREENWOOD INT. SCHOOL — OFFICIAL REPORT CARD*\n\nDear ${guardianName},\nOfficial Term 1 Progress Card for *${studentName}* (${classGrade}) is now ready.\n\n*Overall Grade:* A2 (86.4%)\n*Attendance:* 81.4%\n\nView Card: https://greenwood.edu/report-card?roll=${studentRoll}`
      case 'Class Announcement':
        return `📢 *GREENWOOD INT. SCHOOL — CLASS ANNOUNCEMENT*\n\nNotice for Guardians of *${classGrade}*:\nParent-Teacher Meeting (PTM) is scheduled for Saturday, 28th September at 09:30 AM in Main Auditorium.`
      default:
        return ''
    }
  }

  const activeText = customMsg || generateDefaultMessage()

  const handleSend = async () => {
    if (isStudentOrParent) return
    if ((templateType === 'Fee Receipt' || templateType === 'Fee Reminder') && !canSendFinancial) return
    if ((templateType === 'Attendance Alert' || templateType === 'Report Card' || templateType === 'Class Announcement') && !canSendAcademic) return

    setIsSending(true)
    const result = await sendWhatsAppMessage({
      phone: guardianPhone,
      recipientName: `${guardianName} (Guardian of ${studentName})`,
      studentRoll,
      templateType,
      messageText: activeText,
    })
    setIsSending(false)
    setSuccessLog(result.log)
    setTimeout(() => {
      setSuccessLog(null)
      onClose()
    }, 2200)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meta WhatsApp Official Dispatch"
      subtitle="Send Meta-verified WhatsApp notifications directly to parent phone numbers."
    >
      <div className="space-y-5 text-xs">
        {isStudentOrParent && (
          <div className="flex items-center gap-2.5 rounded-xl bg-[#fff5f5] border border-[#fca5a5] p-4 text-xs text-[#991b1b]">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#dc2626]" />
            <div>
              <span className="font-bold block">Access Restricted (Role: {role})</span>
              <span>Students and Parents are not authorized to dispatch official school WhatsApp notifications.</span>
            </div>
          </div>
        )}

        {successLog && (
          <div className="flex items-center gap-2 rounded-xl bg-[#e8f6ed] border border-[#bbf7d0] p-4 text-xs font-semibold text-[#166534] animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-[#16a34a]" />
            <span>WhatsApp notification dispatched successfully to {guardianPhone}!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Form Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">
                Select WhatsApp Template
              </label>
              <select
                disabled={isStudentOrParent}
                value={templateType}
                onChange={(e) => {
                  setTemplateType(e.target.value as WhatsAppMessageLog['templateType'])
                  setCustomMsg('')
                }}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden disabled:bg-[#f4f8f5] disabled:cursor-not-allowed"
              >
                {canSendFinancial && <option value="Fee Receipt">Fee Receipt Confirmation</option>}
                {canSendFinancial && <option value="Fee Reminder">Fee Dues Payment Reminder</option>}
                {canSendAcademic && <option value="Attendance Alert">Daily Absence Alert</option>}
                {canSendAcademic && <option value="Report Card">Term Report Card Link</option>}
                {canSendAcademic && <option value="Class Announcement">Class Announcement</option>}
              </select>
            </div>

            <div className="rounded-xl border border-[#edf3ef] bg-[#fafcfb] p-3 space-y-1.5">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#7e948c]">Recipient Dossier</div>
              <div className="flex justify-between text-xs">
                <span className="text-[#71877e]">Guardian:</span>
                <span className="font-semibold text-[#14241e]">{guardianName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#71877e]">Phone Number:</span>
                <span className="font-mono font-semibold text-[#0e4b38] flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {guardianPhone}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#71877e]">Student & Class:</span>
                <span className="font-semibold text-[#14241e]">{studentName} ({classGrade})</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">
                Customize Message Body (Optional)
              </label>
              <textarea
                disabled={isStudentOrParent}
                rows={5}
                value={activeText}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] p-3 text-xs text-[#14241e] font-sans focus:border-[#0e4b38] focus:outline-hidden disabled:bg-[#f4f8f5] disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Right Column: Live WhatsApp Phone Frame Preview */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[280px] rounded-3xl border-4 border-[#25D366] bg-[#efeae2] overflow-hidden shadow-bluke-md">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] px-4 py-3 text-white flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-xs text-white">
                  GW
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    Greenwood School
                    <ShieldCheck className="h-3.5 w-3.5 text-[#25D366]" />
                  </div>
                  <div className="text-[9.5px] text-[#aebac1]">Official Business Account</div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="p-3 min-h-[220px] flex flex-col justify-end">
                <div className="rounded-xl bg-white p-3 text-[11px] text-[#111b21] shadow-2xs space-y-2 border border-[#d1d7db] relative">
                  <div className="whitespace-pre-wrap leading-relaxed">{activeText}</div>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-[#667781] pt-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <Check className="h-3 w-3 text-[#53bdeb]" />
                    <Check className="h-3 w-3 text-[#53bdeb] -ml-2" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-[#71877e] font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-[#25D366]" /> Meta Cloud API Instant Delivery
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSending || isStudentOrParent}
            onClick={handleSend}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-5 py-2 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#1eb957] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSending ? 'Dispatching...' : 'Send WhatsApp Message'}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
