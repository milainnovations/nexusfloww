import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { cn } from '../../lib/utils'

const faqs = [
  {
    question: 'What is NexusFlow?',
    answer:
      'NexusFlow is a unified cloud-based CRM & ERP platform designed for both businesses and educational institutions. It combines relationship management, operational enterprise resource planning, and real-time registers into one clean, orderly platform.',
  },
  {
    question: 'Can I use NexusFlow for Higher Education institutions?',
    answer:
      'Yes! NexusFlow includes our specialized Campus Office edition with purpose-built registers for roll-call attendance, fee ledgers, master timetables, academic cohorts, and hostel facilities.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Absolutely. We offer a 14-day free trial with full access to all modules and live sandbox test data. No credit card required to get started.',
  },
  {
    question: 'How secure is institutional and student data?',
    answer:
      'Security is our primary commitment. We enforce role-based access control (RBAC), multi-tenant isolation, encrypted data transmission, and automated daily backups.',
  },
  {
    question: 'Can I migrate data from legacy spreadsheets or old ERPs?',
    answer:
      'Yes, we provide built-in CSV/Excel import tools and dedicated migration support for student records, faculty rosters, syllabus codes, and financial ledger data.',
  },
  {
    question: 'What kind of support is provided?',
    answer:
      'Standard plans include email and desk support. Professional and Enterprise tiers receive dedicated implementation leads and priority SLA coverage.',
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
            title="Frequently asked questions"
            subtitle="Answers to common queries about platform implementation, tenant setup, and features."
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
