import { motion } from 'framer-motion'
import {
  Store,
  ShoppingBag,
  Warehouse,
  Truck,
  Factory,
  Briefcase,
  Globe,
  Rocket,
  Building,
  School,
  GraduationCap,
  BookOpen,
  Target,
  Award,
} from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { cn } from '../../lib/utils'

const businessIndustries = [
  { icon: Store, label: 'Retail Stores', color: 'from-blue-600 to-blue-700' },
  { icon: ShoppingBag, label: 'Supermarkets', color: 'from-emerald-600 to-emerald-700' },
  { icon: Warehouse, label: 'Wholesalers', color: 'from-purple-600 to-purple-700' },
  { icon: Truck, label: 'Distributors', color: 'from-amber-600 to-amber-700' },
  { icon: Factory, label: 'Manufacturers', color: 'from-rose-600 to-rose-700' },
  { icon: Briefcase, label: 'Service Companies', color: 'from-cyan-600 to-cyan-700' },
  { icon: Globe, label: 'E-commerce Businesses', color: 'from-indigo-600 to-indigo-700' },
  { icon: Rocket, label: 'Startups', color: 'from-orange-600 to-orange-700' },
  { icon: Building, label: 'SMEs', color: 'from-teal-600 to-teal-700' },
]

const educationIndustries = [
  { icon: School, label: 'K-12 Schools', color: 'from-blue-600 to-blue-700' },
  { icon: GraduationCap, label: 'Colleges & Institutes', color: 'from-purple-600 to-purple-700' },
  { icon: Building, label: 'Universities', color: 'from-emerald-600 to-emerald-700' },
  { icon: BookOpen, label: 'Coaching Institutes', color: 'from-amber-600 to-amber-700' },
  { icon: Target, label: 'Training Centers', color: 'from-rose-600 to-rose-700' },
  { icon: Award, label: 'Skill Development Academies', color: 'from-cyan-600 to-cyan-700' },
]

function IndustryGrid({
  title,
  items,
}: {
  title: string
  items: typeof businessIndustries
}) {
  return (
    <div>
      <h3 className="mb-6 text-xl font-bold text-slate-900">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, label, color }, i) => (
          <FadeIn key={label} delay={i * 0.04}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={cn(
                  'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                  color,
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="font-bold text-slate-900">{label}</p>
              <div
                className={cn(
                  'absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10',
                  color,
                )}
              />
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}

export function IndustrySolutions() {
  return (
    <section id="industries" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Industry Solutions"
            title="Built for your industry"
            subtitle="Tailored solutions for businesses and educational institutions of every size."
          />
        </FadeIn>

        <div className="space-y-16">
          <FadeIn delay={0.1}>
            <IndustryGrid title="Business Verticals" items={businessIndustries} />
          </FadeIn>
          <FadeIn delay={0.2}>
            <IndustryGrid title="Education Verticals" items={educationIndustries} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
