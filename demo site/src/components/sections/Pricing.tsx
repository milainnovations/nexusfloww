import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { routes } from '../../lib/routes'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams getting started.',
    features: [
      'Up to 5 users',
      'Basic CRM modules',
      'Email support',
      '1 GB storage',
      'Mobile app access',
      'Standard reports',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing businesses and institutions.',
    features: [
      'Up to 25 users',
      'Full CRM & ERP modules',
      'Priority support',
      '50 GB storage',
      'API access',
      'Advanced analytics',
      'Custom workflows',
      'Multi-branch support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with advanced needs.',
    features: [
      'Unlimited users',
      'All modules + AI features',
      'Dedicated account manager',
      'Unlimited storage',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
      'White-label available',
      'Advanced security & SSO',
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
            title="Simple, transparent pricing"
            subtitle="Choose the plan that fits your organization. All plans include a 14-day free trial."
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

                <Link to={plan.highlighted ? '/login' : routes.contact} className="block mt-8">
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className={cn(
                      'w-full',
                      plan.highlighted
                        ? 'bg-[#0e4b38] text-white hover:bg-[#125641]'
                        : 'border-[#c9ded4] bg-white text-[#0e4b38] hover:bg-[#f2f7f4]',
                    )}
                  >
                    {plan.highlighted ? 'Start Free Trial' : 'Contact Sales'}
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
