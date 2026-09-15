import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Landmark,
  Shield,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useErpData } from '../../context/ErpDataContext'
import type { UserProfile } from '../../context/AuthContext'
import {
  generateProfileScopedAnswer,
  getRoleQuickSuggestions,
  type ChatResponse,
} from '../../services/aiProfileEngine'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: string
  isSecurityViolation?: boolean
  violationReason?: string
  suggestedFollowUps?: string[]
  dataHighlights?: { label: string; value: string; color?: string }[]
}

export const ProfileChatbot: React.FC = () => {
  const { user, switchRole, activeInstitution } = useAuth()
  const erpData = useErpData()

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initial welcome message generator based on current profile
  const getInitialMessage = (currentUser: UserProfile | null): Message => {
    if (!currentUser) {
      return {
        id: 'msg-welcome-guest',
        sender: 'assistant',
        content:
          '👋 **Welcome to Bluke Campus AI!** Please sign in to access your profile-specific data and personalized school assistance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    }

    const suggestions = getRoleQuickSuggestions(currentUser.role)

    let roleGreeting = ''
    switch (currentUser.role) {
      case 'Student':
        roleGreeting = `Hi **${currentUser.name}**! I am your personal student academic assistant for **Class 8-A** (Roll: \`${
          currentUser.rollNumber || 'SCH-8A-01'
        }\`).\n\nI can answer your questions regarding your **attendance, exam grades, timetable schedule, fee dues, bus route, and library books**.`
        break
      case 'Parent':
        roleGreeting = `Welcome **${currentUser.name}**! I am connected to the parent portal for your ward **Rahul Sharma (Class 8-A)**.\n\nAsk me about Rahul's **attendance, term marks, pending fee invoices, bus transport, or class timetable**.`
        break
      case 'Teacher':
        roleGreeting = `Good day, **${currentUser.name}**! Faculty intelligence assistant active for **${
          currentUser.assignedClass || 'Class 8-A'
        }**.\n\nI can help check your **teaching timetable, Class 8-A low attendance watchlist, syllabus completion status, and student grading**.`
        break
      case 'Library Admin':
        roleGreeting = `Hello **${currentUser.name}**! Central Library management AI ready.\n\nAsk about **overdue books, circulation ledgers, student borrowing history, and available catalog titles**.`
        break
      case 'Administration':
        roleGreeting = `Welcome **${currentUser.name}**! Administration & Accounts AI active.\n\nI can provide insights into **school fee collection, expense vouchers, budget utilization by category, and student admissions pipeline**.`
        break
      case 'Principal':
      case 'Super Admin':
      default:
        roleGreeting = `Greetings, **${currentUser.name}**! Executive Campus Intelligence system online for **${
          currentUser.institutionName || 'Greenwood International School'
        }**.\n\nYou have unrestricted administrative clearance to query **school-wide attendance, fee revenue, faculty rosters, department budgets, and admissions**.`
        break
    }

    return {
      id: `msg-welcome-${currentUser.id}`,
      sender: 'assistant',
      content: `${roleGreeting}\n\n> 🔒 **Data Privacy Firewall Active:** Cross-profile data access is prohibited. All queries are strictly verified against your authorized profile.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: suggestions.slice(0, 4),
    }
  }

  const [messages, setMessages] = useState<Message[]>(() => [getInitialMessage(user)])

  // Reset or update conversation when user role or identity changes
  useEffect(() => {
    setMessages([getInitialMessage(user)])
  }, [user?.id, user?.role])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
    }
  }, [isOpen, messages, isTyping])

  // Handle Send Query
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim()
    if (!query || isTyping) return

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputQuery('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response: ChatResponse = generateProfileScopedAnswer(query, user, erpData)

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSecurityViolation: response.isSecurityViolation,
        violationReason: response.violationReason,
        suggestedFollowUps: response.suggestedFollowUps,
        dataHighlights: response.dataHighlights,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    }, 550)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageId(id)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const handleClearChat = () => {
    setMessages([getInitialMessage(user)])
  }

  const getRoleIcon = (role?: UserProfile['role']) => {
    switch (role) {
      case 'Student':
        return <GraduationCap className="h-3.5 w-3.5" />
      case 'Teacher':
        return <Briefcase className="h-3.5 w-3.5" />
      case 'Parent':
        return <User className="h-3.5 w-3.5" />
      case 'Library Admin':
        return <BookOpen className="h-3.5 w-3.5" />
      case 'Administration':
        return <Landmark className="h-3.5 w-3.5" />
      default:
        return <Shield className="h-3.5 w-3.5" />
    }
  }

  const quickSwitchOptions: { role: UserProfile['role']; label: string; sub: string }[] = [
    { role: 'Student', label: 'Rahul Sharma (Student)', sub: 'Class 8-A • Roll #SCH-8A-01' },
    { role: 'Teacher', label: 'Prof. Vikram Singh (Teacher)', sub: 'Maths Dept • Class 8-A Teacher' },
    { role: 'Parent', label: 'Mr. Suresh Sharma (Parent)', sub: 'Guardian of Rahul Sharma' },
    { role: 'Library Admin', label: 'Mrs. Meenakshi (Library)', sub: 'Central Library Head' },
    { role: 'Administration', label: 'Mrs. Priya Desai (Admin Head)', sub: 'Accounts & Operations' },
    { role: 'Principal', label: 'Dr. Anita Sharma (Principal)', sub: 'Executive Academic Head' },
    { role: 'Super Admin', label: 'Dr. Rajesh Kumar (Admin)', sub: 'System Administrator' },
  ]

  // Render Markdown tables, bold text, code, lists, and quotes
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inTable = false
    let tableHeader: string[] = []
    let tableRows: string[][] = []

    const flushTable = (key: number) => {
      if (tableHeader.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-lg border border-[#e2ece6] bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f8f5] text-[11px] font-bold text-[#0e4b38] border-b border-[#e2ece6]">
                <tr>
                  {tableHeader.map((th, idx) => (
                    <th key={idx} className="px-3 py-2 whitespace-nowrap">
                      {parseInlineFormatting(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f5f2]">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#fbfdfc] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-[#2d4037] whitespace-normal">
                        {parseInlineFormatting(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      tableHeader = []
      tableRows = []
      inTable = false
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())

        // Separator line (e.g. | :--- | :--- |)
        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          return
        }

        if (!inTable) {
          inTable = true
          tableHeader = cells
        } else {
          tableRows.push(cells)
        }
        return
      } else if (inTable) {
        flushTable(idx)
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="font-editorial text-base font-semibold text-[#14241e] mt-3 mb-1.5 flex items-center gap-1.5">
            {parseInlineFormatting(trimmed.replace('### ', ''))}
          </h3>
        )
        return
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="text-xs font-bold uppercase tracking-wider text-[#0e4b38] mt-2.5 mb-1">
            {parseInlineFormatting(trimmed.replace('#### ', ''))}
          </h4>
        )
        return
      }

      // Blockquote / Alerts
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.replace('> ', '')
        const isWarning = quoteText.includes('⚠️') || quoteText.includes('Alert') || quoteText.includes('Notice') || quoteText.includes('Restricted')
        const isSuccess = quoteText.includes('✅') || quoteText.includes('Excellent') || quoteText.includes('All Clear')

        elements.push(
          <div
            key={idx}
            className={`my-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
              isWarning
                ? 'border-[#fde68a] bg-[#fffbeb] text-[#92400e]'
                : isSuccess
                ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
                : 'border-[#e2ece6] bg-[#f7faf8] text-[#334b40]'
            }`}
          >
            {parseInlineFormatting(quoteText)}
          </div>
        )
        return
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs text-[#2c3e36] my-1 ml-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
            <span className="leading-relaxed">{parseInlineFormatting(trimmed.slice(2))}</span>
          </div>
        )
        return
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={idx} className="h-1" />)
        return
      }

      // Normal paragraph
      elements.push(
        <p key={idx} className="text-xs leading-relaxed text-[#2c3e36] my-1">
          {parseInlineFormatting(line)}
        </p>
      )
    })

    if (inTable) {
      flushTable(lines.length)
    }

    return elements
  }

  const parseInlineFormatting = (text: string) => {
    // Process **bold**, `code`, and [badges]
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[#14241e]">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1)
        const isBad = codeText.includes('OVERDUE') || codeText.includes('PENDING') || codeText.includes('REJECTED')
        const isGood = codeText.includes('PAID') || codeText.includes('A1') || codeText.includes('ADMITTED')
        return (
          <span
            key={i}
            className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-medium ${
              isBad
                ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]'
                : isGood
                ? 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]'
                : 'bg-[#eaf2ed] text-[#0e4b38] border border-[#d2e5db]'
            }`}
          >
            {codeText}
          </span>
        )
      }
      return part
    })
  }

  return (
    <>
      {/* 1. FLOATING CHAT TRIGGER BUTTON (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="group hidden sm:flex cursor-pointer items-center gap-2 rounded-full border border-[#d6e3dc] bg-white/95 px-3.5 py-2 shadow-bluke-md backdrop-blur-md transition-all hover:scale-105 hover:border-[#0e4b38]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eaf4ee] text-[#0e4b38] text-[10px] font-bold">
              {user?.avatarText || 'AI'}
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-[#14241e] flex items-center gap-1">
                <span>Ask Campus AI</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <div className="text-[9px] text-[#71877e]">
                {user ? `${user.role} Profile Guard` : 'School AI'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Campus AI Chatbot"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#0e4b38] via-[#125641] to-[#10b981] text-white shadow-bluke-lg transition-all duration-300 hover:scale-110 active:scale-95 glow-primary"
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
          ) : (
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-[#a7f3d0] animate-bounce" />
            </div>
          )}

          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-bold text-white border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. CHATBOT WINDOW (FLOATING MODAL) */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-[#d6e3dc] bg-[#fafcfb] shadow-bluke-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[82vh] sm:h-[720px] max-h-[85vh]'
              : 'w-[92vw] sm:w-[420px] h-[78vh] sm:h-[620px] max-h-[80vh]'
          }`}
        >
          {/* A. HEADER */}
          <div className="flex items-center justify-between border-b border-[#e2ece6] bg-white px-4 py-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0e4b38] to-[#156d52] text-white shadow-2xs">
                <Sparkles className="h-4 w-4" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-sm font-semibold text-[#14241e]">
                    Campus AI Assistant
                  </span>
                  <button
                    onClick={() => setShowSecurityModal(true)}
                    title="Strict RBAC Profile Isolation Active"
                    className="flex items-center gap-0.5 rounded-full bg-[#f0fdf4] px-1.5 py-0.5 text-[9px] font-bold text-[#166534] border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors"
                  >
                    <ShieldCheck className="h-3 w-3 text-[#16a34a]" />
                    <span>RBAC Lock</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-[#637a71]">
                  <span className="truncate max-w-[110px]" title={activeInstitution}>{activeInstitution.split('(')[0]}</span>
                  <span>•</span>
                  <span>{user?.name || 'Guest User'}</span>
                  <span>•</span>
                  <div className="relative inline-block">
                    <button
                      onClick={() => setShowRoleMenu(!showRoleMenu)}
                      className="font-semibold text-[#0e4b38] hover:underline flex items-center gap-0.5"
                    >
                      <span>{user?.role}</span>
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>

                    {/* Quick Role Switcher Dropdown */}
                    {showRoleMenu && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-[#d6e3dc] bg-white p-1.5 shadow-bluke-dropdown z-50 text-left">
                        <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#82968e]">
                          Test Profile Switch (Live RBAC)
                        </div>
                        {quickSwitchOptions.map((opt) => (
                          <button
                            key={opt.role}
                            onClick={() => {
                              switchRole(opt.role)
                              setShowRoleMenu(false)
                            }}
                            className={`flex w-full flex-col rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              user?.role === opt.role
                                ? 'bg-[#f4f8f5] text-[#0e4b38] font-bold'
                                : 'text-[#334b40] hover:bg-[#f7faf8]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {getRoleIcon(opt.role)}
                              <span>{opt.label}</span>
                            </span>
                            <span className="text-[10px] text-[#71877e] pl-5">{opt.sub}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="rounded-lg p-1.5 text-[#71877e] hover:bg-[#f0f5f2] hover:text-[#14241e] transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand panel'}
                className="hidden sm:block rounded-lg p-1.5 text-[#71877e] hover:bg-[#f0f5f2] hover:text-[#14241e] transition-colors"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="rounded-lg p-1.5 text-[#71877e] hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* B. PROFILE ISOLATION CONTEXT BANNER */}
          <div className="flex items-center justify-between border-b border-[#e5ebe7] bg-[#f4f8f5] px-3.5 py-1.5 text-[10.5px] text-[#334b40]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-[#0e4b38] flex items-center gap-1">
                {getRoleIcon(user?.role)}
                <span>Active Scope:</span>
              </span>
              <span className="truncate">
                {user?.role === 'Student' && `Rahul Sharma • Class 8-A (Roll: ${user.rollNumber || 'SCH-8A-01'})`}
                {user?.role === 'Parent' && `Ward: Rahul Sharma (Class 8-A)`}
                {user?.role === 'Teacher' && `Maths Dept • Teaching: Class 8-A, 9-B, 10-A`}
                {user?.role === 'Library Admin' && `Central Library Catalog & Issues`}
                {user?.role === 'Administration' && `Finance, Admissions & Bus Logistics`}
                {(user?.role === 'Principal' || user?.role === 'Super Admin') && `Full Campus Management Clearance`}
              </span>
            </div>
            <span className="shrink-0 text-[9.5px] font-bold uppercase text-[#10b981] bg-white px-1.5 py-0.5 rounded border border-[#d6e3dc]">
              Isolated
            </span>
          </div>

          {/* C. MESSAGES CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[92%] rounded-2xl p-3.5 text-xs shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0e4b38] text-white rounded-br-xs'
                      : msg.isSecurityViolation
                      ? 'border border-[#fecaca] bg-[#fef2f2] text-[#991b1b] rounded-bl-xs'
                      : 'border border-[#e2ece6] bg-white text-[#14241e] rounded-bl-xs'
                  }`}
                >
                  {/* Security Violation Callout Header */}
                  {msg.isSecurityViolation && (
                    <div className="flex items-center gap-1.5 font-bold text-[#b91c1c] mb-2 pb-1.5 border-b border-[#fecaca] text-xs">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-[#dc2626]" />
                      <span>Security Notice: Cross-Profile Firewall Block</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="space-y-1">{renderFormattedContent(msg.content)}</div>

                  {/* Highlights Card */}
                  {msg.dataHighlights && msg.dataHighlights.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-[#e2ece6] pt-2.5">
                      {msg.dataHighlights.map((hl, idx) => (
                        <div key={idx} className="rounded-lg bg-[#f7faf8] border border-[#e2ece6] p-2 text-center">
                          <div className="text-[10px] font-medium text-[#71877e] truncate">{hl.label}</div>
                          <div className="text-xs font-bold mt-0.5" style={{ color: hl.color || '#0e4b38' }}>
                            {hl.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Bar (Timestamp & Copy) */}
                  <div
                    className={`mt-2.5 flex items-center justify-between text-[10px] ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-[#82968e]'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{msg.timestamp}</span>
                    </span>

                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-[#0e4b38] transition-colors"
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-[#16a34a]" />
                            <span className="text-[#16a34a]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggested Follow-Ups Pills */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                    {msg.suggestedFollowUps.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="rounded-full border border-[#d6e3dc] bg-white px-2.5 py-1 text-[10.5px] font-medium text-[#334b40] shadow-2xs hover:border-[#0e4b38] hover:bg-[#f4f8f5] hover:text-[#0e4b38] transition-all text-left"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#e2ece6] bg-white p-3.5 shadow-2xs w-fit">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf4ee] text-[#0e4b38]">
                  <Sparkles className="h-3 w-3 animate-spin" />
                </div>
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-[#71877e]">Querying profile database...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* D. QUICK PROMPTS CHIPS (STICKY AT BOTTOM) */}
          <div className="border-t border-[#edf3ef] bg-[#fafcfb] px-3 py-2">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#82968e] mb-1.5 flex items-center justify-between">
              <span>Suggested for {user?.role || 'User'}</span>
              <span className="text-[9px] text-[#0e4b38] font-normal">Click to ask ➔</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {getRoleQuickSuggestions(user?.role).map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendMessage(sug)}
                  className="shrink-0 rounded-lg border border-[#d6e3dc] bg-white px-2.5 py-1 text-[11px] font-medium text-[#2d4037] hover:border-[#0e4b38] hover:bg-[#f4f8f5] hover:text-[#0e4b38] transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* E. INPUT BAR */}
          <div className="border-t border-[#e2ece6] bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  user?.role === 'Student'
                    ? 'Ask about your grades, attendance, fees, timetable...'
                    : user?.role === 'Teacher'
                    ? 'Ask about your schedule, Class 8-A attendance, syllabus...'
                    : user?.role === 'Parent'
                    ? "Ask about Rahul's report card, fees, attendance..."
                    : user?.role === 'Library Admin'
                    ? 'Ask about overdue books, shelf catalog, borrow logs...'
                    : user?.role === 'Administration'
                    ? 'Ask about expenses, budget utilization, admissions...'
                    : 'Ask any campus overview, fee collection, student question...'
                }
                className="flex-1 rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] px-3.5 py-2.5 text-xs text-[#14241e] placeholder:text-[#82968e] focus:border-[#0e4b38] focus:bg-white focus:outline-hidden"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isTyping}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                  inputQuery.trim() && !isTyping
                    ? 'bg-[#0e4b38] text-white hover:bg-[#125641] shadow-2xs'
                    : 'bg-[#e5ebe7] text-[#9ab0a6] cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-[#82968e]">
              <span>🔒 Profile Isolation Active • No cross-profile leakage</span>
              <span>Press Enter ↵</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECURITY POLICY EXPLANATION MODAL */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#d6e3dc] bg-white p-6 shadow-bluke-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2ece6]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dcfce7] text-[#166534]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-editorial text-base font-semibold text-[#14241e]">
                    RBAC Profile Isolation Policy
                  </h4>
                  <div className="text-[10px] text-[#71877e]">Campus Data Protection & Privacy Firewall</div>
                </div>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="rounded-lg p-1 text-[#71877e] hover:bg-[#f0f5f2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs text-[#334b40] leading-relaxed">
              <div className="rounded-xl bg-[#f4f8f5] p-3 border border-[#e2ece6]">
                <strong className="text-[#0e4b38] block mb-1">🔐 Strict Profile Authorization:</strong>
                Each authenticated user session operates in a hard-isolated sandbox. A student or parent can only access their own grades, attendance, and fee invoices.
              </div>

              <div className="rounded-xl bg-[#fffbeb] p-3 border border-[#fde68a] text-[#92400e]">
                <strong className="block mb-1 font-bold">🚫 Prohibited Cross-Profile Actions:</strong>
                - Querying other students&apos; marks, attendance, or home addresses.
                - Querying faculty payroll, salaries, or internal teacher appraisal remarks.
                - Accessing administrative financial accounts or bank transfer records without clearance.
              </div>

              <p className="text-[11px] text-[#637a71]">
                To test how different roles experience this isolation, use the role switcher in the chatbot header or top navigation bar.
              </p>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              className="w-full rounded-xl bg-[#0e4b38] py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  )
}
