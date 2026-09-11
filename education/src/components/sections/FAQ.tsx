import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { cn } from '../../lib/utils'

const faqs = [
  {
    question: 'What is Greenwood Education ERP?',
    answer:
      'Greenwood Education ERP is a dedicated, standalone cloud platform designed specifically for K-12 schools, colleges, and educational institutes. It manages admissions, student registers, attendance, exams, grading, fee collections, bus transport, library, and hostel rooming in one place.',
  },
  {
    question: 'Does it support role-based dashboards for Teachers, Students, and Parents?',
    answer:
      'Yes! The system includes specialized role views for Super Admin, Principal, Teachers, Students, and Parents. Each user sees only their relevant data and tools.',
  },
  {
    question: 'Is Greenwood ERP compliant with CBSE / ICSE grading standards?',
    answer:
      'Yes, it supports standard grading scales (A1, A2, B1, etc.), term exam evaluation sheets, mark compilation, and instant PDF transcript generation with QR validation.',
  },
  {
    question: 'How does the attendance system work?',
    answer:
      'Teachers can mark daily attendance directly from their mobile or desktop desk. The system automatically calculates student attendance percentages and alerts administrators if attendance falls below 75%.',
  },
  {
    question: 'Can parents track fee dues and receipts?',
    answer:
      'Parent users can view outstanding fee invoices, payment due dates, and paid fee receipts directly from their portal with downloadable invoice summaries.',
  },
  {
    question: 'How easy is it to migrate existing student & teacher data?',
    answer:
      'We provide built-in CSV/Excel import tools to instantly load student rosters, teacher profiles, timetable slots, and fee structures during onboarding.',
  },
]

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-[#edf3ef] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-[#0e4b38]"
        aria-expanded={isOpen}
      >
        <span className="pr-4 font-editorial text-lg font-medium text-[#14241e]">
          {question}
        </span>
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
            isOpen
              ? 'bg-[#0e4b38] text-white'
              : 'bg-[#f4f8f5] text-[#50685e]',
          )}
        >
          {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-xs leading-relaxed text-[#50685e] font-normal">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#fbfbfa]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Knowledge & FAQ"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about setting up and running Greenwood Education ERP."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 sm:p-8 shadow-bluke-sm divide-y divide-[#edf3ef]">
            {faqs.map((faq, i) => (
              <FAQItem
                key={faq.question}
                {...faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
