import React, { useState } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Trash2,
  Edit,
  X,
  BookPlus,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { Badge } from '../components/common/Badge'
import { BookCirculationBarChart, LibraryCategoryPieChart } from '../components/analytics/AnalyticsCharts'
import type { LibraryBook } from '../data/mockData'

export const LibraryPage: React.FC = () => {
  const { user } = useAuth()
  const {
    libraryBooks,
    bookIssues,
    students,
    addLibraryBook,
    updateLibraryBook,
    deleteLibraryBook,
    issueBookToStudent,
    processBookReturn,
  } = useErpData()

  const isLibraryAdmin =
    user?.role === 'Library Admin' || user?.role === 'Super Admin' || user?.role === 'Principal'

  // Tab State
  const [activeTab, setActiveTab] = useState<'catalog' | 'ledger'>('catalog')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [ledgerFilter, setLedgerFilter] = useState<'All' | 'Issued' | 'Overdue' | 'Returned'>('All')

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<LibraryBook | null>(null)

  // Add/Edit Book Form State
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    category: 'Science & Nature' as LibraryBook['category'],
    totalCopies: 5,
    shelfLocation: '',
  })

  // Issue Book Form State
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    dueDateDays: 14,
  })

  // Filtered Data
  const categories = ['All', 'Science & Nature', 'Mathematics', 'Literature & Fiction', 'History & Civics', 'Encyclopedias']

  const filteredBooks = libraryBooks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredLedger = bookIssues.filter((i) => {
    const matchesSearch =
      i.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.isbn.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = ledgerFilter === 'All' || i.status === ledgerFilter
    return matchesSearch && matchesStatus
  })

  // Metrics
  const totalTitles = libraryBooks.length
  const totalCopies = libraryBooks.reduce((acc, curr) => acc + curr.totalCopies, 0)
  const activeIssuesCount = bookIssues.filter((i) => i.status === 'Issued' || i.status === 'Overdue').length
  const overdueCount = bookIssues.filter((i) => i.status === 'Overdue').length

  // Handlers
  const handleOpenAddModal = () => {
    setEditingBook(null)
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      category: 'Science & Nature',
      totalCopies: 5,
      shelfLocation: '',
    })
    setIsAddBookModalOpen(true)
  }

  const handleOpenEditModal = (book: LibraryBook) => {
    setEditingBook(book)
    setBookForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      category: book.category,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation,
    })
    setIsAddBookModalOpen(true)
  }

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) return

    if (editingBook) {
      updateLibraryBook(editingBook.id, {
        isbn: bookForm.isbn,
        title: bookForm.title,
        author: bookForm.author,
        category: bookForm.category,
        totalCopies: Number(bookForm.totalCopies),
        copiesAvailable:
          editingBook.copiesAvailable + (Number(bookForm.totalCopies) - editingBook.totalCopies),
        shelfLocation: bookForm.shelfLocation,
      })
    } else {
      addLibraryBook({
        isbn: bookForm.isbn,
        title: bookForm.title,
        author: bookForm.author,
        category: bookForm.category,
        totalCopies: Number(bookForm.totalCopies),
        copiesAvailable: Number(bookForm.totalCopies),
        shelfLocation: bookForm.shelfLocation || 'Main Stack / Shelf 01',
      })
    }
    setIsAddBookModalOpen(false)
  }

  const handleOpenIssueModal = (book: LibraryBook) => {
    setSelectedBookForIssue(book)
    setIssueForm({
      studentId: students[0]?.id || '',
      dueDateDays: 14,
    })
    setIsIssueModalOpen(true)
  }

  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookForIssue || !issueForm.studentId) return

    const selectedStudent = students.find((s) => s.id === issueForm.studentId)
    if (!selectedStudent) return

    issueBookToStudent(
      selectedBookForIssue.id,
      selectedStudent.rollNumber,
      selectedStudent.name,
      selectedStudent.classGrade,
      issueForm.dueDateDays
    )

    setIsIssueModalOpen(false)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
              LEARNING RESOURCE CENTRE & LIBRARY MANAGEMENT
            </span>
            {isLibraryAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0e4b38] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                <ShieldCheck className="h-3 w-3" />
                Authorized Staff Access
              </span>
            )}
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            Library Catalog & Circulation Ledger
          </h1>
          <p className="text-sm text-[#50685e]">
            Manage books catalog, issue volumes to students, and verify timely book returns and overdue status.
          </p>
        </div>

        {isLibraryAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0e4b38] px-4 py-2.5 text-xs font-semibold text-white shadow-bluke hover:bg-[#125641] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Book</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71877e]">
              Total Book Titles
            </div>
            <div className="mt-1 text-2xl font-bold text-[#14241e]">{totalTitles}</div>
            <div className="text-[11px] text-[#71877e] mt-0.5">Distinct catalog records</div>
          </div>
          <div className="rounded-xl bg-[#eaf4ee] p-3 text-[#0e4b38]">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71877e]">
              Total Inventory Volume
            </div>
            <div className="mt-1 text-2xl font-bold text-[#14241e]">{totalCopies}</div>
            <div className="text-[11px] text-[#71877e] mt-0.5">Physical copies in library</div>
          </div>
          <div className="rounded-xl bg-[#f0f7f3] p-3 text-[#0e4b38]">
            <BookPlus className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71877e]">
              Books Currently Issued
            </div>
            <div className="mt-1 text-2xl font-bold text-[#14241e]">{activeIssuesCount}</div>
            <div className="text-[11px] text-[#71877e] mt-0.5">Borrowed by students</div>
          </div>
          <div className="rounded-xl bg-[#eff6ff] p-3 text-[#2563eb]">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71877e]">
              Overdue Returns
            </div>
            <div className="mt-1 text-2xl font-bold text-[#dc2626]">{overdueCount}</div>
            <div className="text-[11px] text-[#71877e] mt-0.5">Past return deadline</div>
          </div>
          <div className="rounded-xl bg-[#fef2f2] p-3 text-[#dc2626]">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Library Circulation & Genre Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BookCirculationBarChart title="Monthly Library Circulation Trends (Issued vs Returned Books)" />
        <LibraryCategoryPieChart title="Library Catalog Volume by Genre & Category" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[#e2ece6] pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#0e4b38] text-white shadow-2xs font-bold'
                : 'text-[#50685e] hover:bg-[#f3f7f4]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Book Catalog Repository ({filteredBooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#0e4b38] text-white shadow-2xs font-bold'
                : 'text-[#50685e] hover:bg-[#f3f7f4]'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Circulation & Return Ledger ({bookIssues.length})</span>
            {overdueCount > 0 && (
              <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white">
                {overdueCount} overdue
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: CATALOG REPOSITORY */}
      {activeTab === 'catalog' && (
        <div className="rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[#edf3ef] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#14241e]">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#e0f0e6] text-[#0e4b38] font-bold'
                        : 'bg-[#f4f8f5] text-[#50685e] hover:bg-[#eaf2ec]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ISBN, title, author, shelf..."
                className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                  <th className="py-3.5 px-6">ISBN / CODE</th>
                  <th className="py-3.5 px-6">TITLE & AUTHOR</th>
                  <th className="py-3.5 px-6">CATEGORY</th>
                  <th className="py-3.5 px-6">SHELF STACK</th>
                  <th className="py-3.5 px-6">STOCK AVAILABILITY</th>
                  <th className="py-3.5 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3ef] text-xs">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#f7faf8] transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-[#14241e]">
                      {book.isbn}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#14241e]">{book.title}</div>
                      <div className="text-[11px] text-[#71877e]">{book.author}</div>
                    </td>
                    <td className="py-4 px-6 text-[#485c54]">
                      <span className="rounded-md bg-[#f2f7f4] px-2 py-1 text-[11px] font-medium text-[#0e4b38]">
                        {book.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-[#14241e]">
                      {book.shelfLocation}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={book.copiesAvailable > 0 ? 'green' : 'amber'} size="sm">
                        {book.copiesAvailable} / {book.totalCopies} Available
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLibraryAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenIssueModal(book)}
                              disabled={book.copiesAvailable <= 0}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#0e4b38] px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#125641] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                            >
                              <BookPlus className="h-3.5 w-3.5" />
                              <span>Issue</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(book)}
                              className="rounded-lg border border-[#dce7e1] p-1.5 text-[#485c54] hover:bg-[#f3f7f4] transition-colors"
                              title="Edit Book Details"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => deleteLibraryBook(book.id)}
                              className="rounded-lg border border-[#fecaca] p-1.5 text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                              title="Delete Title"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CIRCULATION & ISSUE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm overflow-hidden space-y-0">
          <div className="flex flex-col gap-4 border-b border-[#edf3ef] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#14241e]">Filter Ledger Status:</span>
              <div className="flex gap-1.5">
                {(['All', 'Issued', 'Overdue', 'Returned'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLedgerFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                      ledgerFilter === st
                        ? 'bg-[#0e4b38] text-white font-bold'
                        : 'bg-[#f4f8f5] text-[#50685e] hover:bg-[#eaf2ec]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, roll, or book title..."
                className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                  <th className="py-3.5 px-6">STUDENT BORROWER</th>
                  <th className="py-3.5 px-6">BOOK TITLE & ISBN</th>
                  <th className="py-3.5 px-6">ISSUE DATE</th>
                  <th className="py-3.5 px-6">DUE DATE</th>
                  <th className="py-3.5 px-6">STATUS & FINE</th>
                  <th className="py-3.5 px-6 text-right">RETURN CHECK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3ef]">
                {filteredLedger.map((issue) => (
                  <tr key={issue.id} className="hover:bg-[#f7faf8] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#14241e]">{issue.studentName}</div>
                      <div className="text-[11px] text-[#71877e]">
                        {issue.studentRoll} • {issue.classGrade}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#14241e]">{issue.bookTitle}</div>
                      <div className="text-[11px] font-mono text-[#71877e]">{issue.isbn}</div>
                    </td>
                    <td className="py-4 px-6 text-[#50685e] font-medium">{issue.issueDate}</td>
                    <td className="py-4 px-6 font-semibold text-[#14241e]">{issue.dueDate}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <Badge
                          variant={
                            issue.status === 'Returned'
                              ? 'green'
                              : issue.status === 'Overdue'
                              ? 'red'
                              : 'blue'
                          }
                          size="sm"
                        >
                          {issue.status}
                        </Badge>
                        {issue.fineAmount > 0 && (
                          <div className="text-[11px] font-semibold text-[#dc2626]">
                            Fine: ₹{issue.fineAmount}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {issue.status !== 'Returned' ? (
                        <button
                          onClick={() => processBookReturn(issue.id)}
                          disabled={!isLibraryAdmin}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#0e4b38] bg-[#f0f7f3] px-3 py-1.5 text-xs font-semibold text-[#0e4b38] hover:bg-[#0e4b38] hover:text-white disabled:opacity-40 transition-all"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Check & Mark Returned</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Returned on {issue.returnDate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT BOOK */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
              <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                {editingBook ? 'Edit Book Record' : 'Add New Library Book'}
              </h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="rounded-lg p-1 text-[#6c8279] hover:bg-[#f2f7f4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#14241e] mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. Concise Physics for Class 8"
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14241e] mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="e.g. Dr. R. K. Gupta"
                    className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#14241e] mb-1">ISBN Code *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="978-..."
                    className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#14241e] mb-1">Category</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        category: e.target.value as LibraryBook['category'],
                      })
                    }
                    className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                  >
                    <option value="Science & Nature">Science & Nature</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Literature & Fiction">Literature & Fiction</option>
                    <option value="History & Civics">History & Civics</option>
                    <option value="Encyclopedias">Encyclopedias</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#14241e] mb-1">Total Copies Stocked</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#14241e] mb-1">Shelf Location / Stack</label>
                <input
                  type="text"
                  value={bookForm.shelfLocation}
                  onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                  placeholder="e.g. Science Stack / Shelf B-04"
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#edf3ef]">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="rounded-xl border border-[#dce7e1] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f3f7f4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
                >
                  {editingBook ? 'Update Book' : 'Save Book to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE BOOK TO STUDENT */}
      {isIssueModalOpen && selectedBookForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
              <div>
                <h3 className="font-editorial text-xl font-medium text-[#14241e]">
                  Issue Book to Student
                </h3>
                <div className="text-xs text-[#71877e]">{selectedBookForIssue.title}</div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="rounded-lg p-1 text-[#6c8279] hover:bg-[#f2f7f4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmIssue} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#14241e] mb-1">
                  Select Enrolled Student *
                </label>
                <select
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.rollNumber} — {st.classGrade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#14241e] mb-1">
                  Loan Period (Days)
                </label>
                <select
                  value={issueForm.dueDateDays}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDateDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
                >
                  <option value={7}>7 Days (Standard Term)</option>
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (Extended Research)</option>
                </select>
              </div>

              <div className="rounded-xl bg-[#f0f7f3] p-3 text-[11px] text-[#0e4b38] space-y-1">
                <div className="font-semibold">Issuing Confirmation:</div>
                <div>ISBN: {selectedBookForIssue.isbn}</div>
                <div>Available Copies Remaining: {selectedBookForIssue.copiesAvailable}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#edf3ef]">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="rounded-xl border border-[#dce7e1] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f3f7f4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
                >
                  Confirm & Issue Volume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
