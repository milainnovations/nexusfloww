import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { routes } from '../../lib/routes'

const exploreCards = [
  {
    title: 'Business CRM & ERP',
    description: 'Lead management, sales pipeline, inventory, finance, and automated workflows.',
    to: routes.business,
    color: 'from-[#0e4b38] to-[#125641]',
  },
  {
    title: 'Education CRM & ERP',
    description: 'Admissions, student registry, master timetable, fee ledgers, and campus desk.',
    to: routes.education,
    color: 'from-[#08281d] to-[#0e4b38]',
  },
  {
    title: 'Interactive Dashboards',
    description: 'Real-time metrics for revenue, admissions, attendance, and continuous evaluation.',
    to: routes.dashboard,
    color: 'from-[#10b981] to-[#059669]',
  },
  {
    title: 'Industry Solutions',
    description: 'Tailored operational workflows for retail, institutions, manufacturing, and tech.',
    to: routes.industries,
    color: 'from-[#0f3d2f] to-[#185c46]',
  },
]

export function ExploreSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#fbfbfa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Platform Overview"
            title="Everything you need, unified"
            subtitle="Navigate dedicated suites designed for modern enterprise & educational efficiency."
          />
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2">
          {exploreCards.map((card, i) => (
            <FadeIn key={card.title} delay={i * 0.08}>
              <Link
                to={card.to}
                className="group flex h-full flex-col rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm transition-all hover:-translate-y-1 hover:border-[#b8cfc3] hover:shadow-bluke-md"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm`}
                >
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="font-editorial text-2xl font-medium text-[#14241e]">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#50685e]">
                  {card.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0e4b38] group-hover:text-[#125641]">
                  <span>Explore module</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
