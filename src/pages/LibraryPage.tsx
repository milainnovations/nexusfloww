import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useErpData } from '../context/ErpDataContext'
import { Badge } from '../components/common/Badge'

export const LibraryPage: React.FC = () => {
  const { libraryBooks, issueLibraryBook, returnLibraryBook } = useErpData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBooks = libraryBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD LEARNING RESOURCE CENTRE
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            School Library Repository
          </h1>
          <p className="text-sm text-[#50685e]">
            Junior and senior library books, science encyclopedias, literature classics, and student issue ledger.
          </p>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-[#e2ece6] bg-white shadow-bluke-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#edf3ef] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#14241e]">Registered Titles:</span>
            <span className="rounded-full bg-[#e8f6ed] px-2.5 py-0.5 text-xs font-semibold text-[#0e4b38]">
              {filteredBooks.length} titles
            </span>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa39b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ISBN, book title, author..."
              className="w-full rounded-xl border border-[#c9dcd2] bg-[#fbfdfc] py-2 pl-9 pr-3.5 text-xs text-[#14241e] placeholder-[#8fa39b] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf3ef] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6c8279]">
                <th className="py-3 px-6">ISBN / CODE</th>
                <th className="py-3 px-6">TITLE & AUTHOR</th>
                <th className="py-3 px-6">CATEGORY</th>
                <th className="py-3 px-6">SHELF STACK</th>
                <th className="py-3 px-6">AVAILABILITY</th>
                <th className="py-3 px-6">CIRCULATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ef] text-xs">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-[#f7faf8] transition-colors">
                  <td className="py-4 px-6 font-mono font-medium text-[#14241e]">
                    {book.isbn}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#14241e]">{book.title}</div>
                    <div className="text-[11px] text-[#71877e]">{book.author}</div>
                  </td>
                  <td className="py-4 px-6 text-[#485c54]">{book.category}</td>
                  <td className="py-4 px-6 font-medium text-[#14241e]">
                    {book.shelfLocation}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={book.copiesAvailable > 0 ? 'green' : 'amber'} size="sm">
                      {book.copiesAvailable} / {book.totalCopies} Available
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => issueLibraryBook(book.id)}
                        disabled={book.copiesAvailable <= 0}
                        className="rounded-lg bg-[#0e4b38] px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-[#125641] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        Issue
                      </button>
                      <button
                        onClick={() => returnLibraryBook(book.id)}
                        disabled={book.copiesAvailable >= book.totalCopies}
                        className="rounded-lg border border-[#dce7e1] px-3 py-1.5 text-[11px] font-semibold text-[#485c54] hover:bg-[#f3f7f4] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
