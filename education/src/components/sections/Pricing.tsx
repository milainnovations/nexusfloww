import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const plans = [
  {
    name: 'School Essential',
    price: '₹12,500',
    period: '/month',
    description: 'Ideal for K-10 single campus schools.',
    features: [
      'Up to 500 Students',
      'Student Roster & Attendance',
      'Fee Receipts & Invoicing',
      'Progress Reports & Marks',
      'Parent WhatsApp Alerts',
      'Standard Timetable Builder',
    ],
    highlighted: false,
  },
  {
    name: 'Campus Pro',
    price: '₹28,000',
    period: '/month',
    description: 'For growing senior secondary schools & colleges.',
    features: [
      'Up to 2,500 Students',
      'Full Academics & ERP Suite',
      'Transport & Bus Tracking',
      'Hostel Dorm Allocations',
      'CBSE Transcripts & QR Verification',
      'Biometric / RFID Attendance',
      'Library Management System',
      'Multi-Role Portal Access',
    ],
    highlighted: true,
  },
  {
    name: 'University & Group',
    price: 'Custom',
    period: '',
    description: 'For multi-campus educational trusts & universities.',
    features: [
      'Unlimited Students & Staff',
      'Multi-Campus Central Governance',
      'Dedicated Account Manager',
      'Custom ERP Workflows & APIs',
      'On-Premise / Hybrid Cloud Support',
      'White-Label Parent & Student App',
      '24/7 SLA Priority Desk',
    ],
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#fbfbfa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Institutional Pricing"
            title="Simple, transparent plans for schools"
            subtitle="Choose the edition that fits your institution's size and academic requirements."
          />
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border p-8 shadow-bluke-sm transition-all bg-white',
                  plan.highlighted
                    ? 'border-[#0e4b38] ring-2 ring-[#0e4b38]/15 shadow-bluke-md'
                    : 'border-[#e2ece6] hover:border-[#b8cfc3] hover:shadow-bluke-md',
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#0e4b38] px-4 py-1 text-xs font-bold text-white shadow-sm">
                    <Sparkles className="h-3 w-3 text-[#34d399]" />
                    Most Popular
                  </span>
                )}

                <h3 className="font-editorial text-2xl font-semibold text-[#14241e]">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-[#71877e]">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-editorial text-4xl font-normal text-[#14241e]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs font-medium text-[#71877e]">{plan.period}</span>
                  )}
                </div>

                <ul className="mt-8 flex-1 space-y-3 border-t border-[#edf3ef] pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-xs">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10b981] font-bold" />
                      <span className="text-[#485c54] font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.highlighted ? '/login' : '/contact'} className="block mt-8">
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className={cn(
                      'w-full',
                      plan.highlighted
                        ? 'bg-[#0e4b38] text-white hover:bg-[#125641]'
                        : 'border-[#c9ded4] bg-white text-[#0e4b38] hover:bg-[#f2f7f4]',
                    )}
                  >
                    {plan.highlighted ? 'Launch ERP App' : 'Contact School Desk'}
                  </Button>
                </Link>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
