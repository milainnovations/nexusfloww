import {
  Target,
  Database,
  TrendingUp,
  Headphones,
  Megaphone,
  Gift,
  UserCircle,
  Boxes,
  ShoppingCart,
  Truck,
  Calculator,
  Receipt,
  Warehouse,
  Users,
  FolderKanban,
} from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { FeatureCard } from '../ui/FeatureCard'

const crmModules = [
  { icon: Target, title: 'Lead Management', description: 'Capture, qualify, and convert leads with intelligent scoring.', color: 'blue' as const },
  { icon: Database, title: 'Customer Database', description: 'Centralized customer profiles with complete interaction history.', color: 'purple' as const },
  { icon: TrendingUp, title: 'Sales Pipeline', description: 'Visual pipeline management with forecasting and automation.', color: 'emerald' as const },
  { icon: Headphones, title: 'Customer Support', description: 'Ticketing, live chat, and knowledge base in one place.', color: 'cyan' as const },
  { icon: Megaphone, title: 'Marketing Automation', description: 'Email campaigns, drip sequences, and audience segmentation.', color: 'rose' as const },
  { icon: Gift, title: 'Loyalty Programs', description: 'Reward customers and increase retention with loyalty tools.', color: 'amber' as const },
  { icon: UserCircle, title: 'Customer 360', description: 'Complete view of every customer touchpoint and transaction.', color: 'blue' as const },
]

const erpModules = [
  { icon: Boxes, title: 'Inventory Management', description: 'Real-time stock tracking across warehouses and locations.', color: 'emerald' as const },
  { icon: ShoppingCart, title: 'Purchase Management', description: 'Streamline procurement from requisition to payment.', color: 'blue' as const },
  { icon: Truck, title: 'Vendor Management', description: 'Manage supplier relationships and performance metrics.', color: 'purple' as const },
  { icon: Calculator, title: 'Finance & Accounting', description: 'General ledger, P&L, balance sheets, and financial reports.', color: 'amber' as const },
  { icon: Receipt, title: 'Billing & Tax', description: 'Automated invoicing, tax calculations, and compliance.', color: 'rose' as const },
  { icon: Warehouse, title: 'Warehouse Management', description: 'Optimize storage, picking, and fulfillment operations.', color: 'cyan' as const },
  { icon: Users, title: 'Employee Management', description: 'HR, payroll, attendance, and performance tracking.', color: 'blue' as const },
  { icon: FolderKanban, title: 'Project Management', description: 'Plan, track, and deliver projects on time and budget.', color: 'purple' as const },
]

export function BusinessEdition() {
  return (
    <section id="business" className="py-20 lg:py-28 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Business Edition"
            title="Business CRM & ERP"
            subtitle="Everything your business needs to scale operations smoothly."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <h3 className="mb-6 text-xl font-bold text-slate-900">
            CRM Modules
          </h3>
        </FadeIn>
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {crmModules.map((mod, i) => (
            <FadeIn key={mod.title} delay={i * 0.04}>
              <FeatureCard {...mod} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.1}>
          <h3 className="mb-6 text-xl font-bold text-slate-900">
            ERP Modules
          </h3>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {erpModules.map((mod, i) => (
            <FadeIn key={mod.title} delay={i * 0.04}>
              <FeatureCard {...mod} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
