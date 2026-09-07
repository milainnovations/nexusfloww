import {
  Brain,
  Cloud,
  Shield,
  Zap,
  Smartphone,
  GitBranch,
  Users,
  Lock,
  BarChart3,
  Plug,
} from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { FeatureCard } from '../ui/FeatureCard'

const features = [
  {
    icon: Brain,
    title: 'AI Powered',
    description: 'Smart insights, predictive analytics, and automated workflows powered by AI.',
    color: 'purple' as const,
  },
  {
    icon: Cloud,
    title: 'Cloud Native',
    description: 'Built for the cloud with 99.9% uptime and automatic scaling.',
    color: 'blue' as const,
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Enterprise-grade security with encryption, SSO, and compliance.',
    color: 'emerald' as const,
  },
  {
    icon: Zap,
    title: 'Fast',
    description: 'Lightning-fast performance optimized for teams of any size.',
    color: 'amber' as const,
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Full-featured mobile apps for iOS and Android.',
    color: 'cyan' as const,
  },
  {
    icon: GitBranch,
    title: 'Multi Branch',
    description: 'Manage multiple locations from a single unified dashboard.',
    color: 'rose' as const,
  },
  {
    icon: Users,
    title: 'Multi User',
    description: 'Collaborate seamlessly with unlimited team members.',
    color: 'blue' as const,
  },
  {
    icon: Lock,
    title: 'Role Based Access',
    description: 'Granular permissions and custom roles for every team.',
    color: 'purple' as const,
  },
  {
    icon: BarChart3,
    title: 'Real Time Analytics',
    description: 'Live dashboards and reports updated in real time.',
    color: 'emerald' as const,
  },
  {
    icon: Plug,
    title: 'API Integration',
    description: 'Connect with 200+ tools via REST API and webhooks.',
    color: 'amber' as const,
  },
]

export function WhyChooseUs() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Why Choose Us"
            title="Built for modern enterprises"
            subtitle="Everything you need to run your business or institution at scale."
          />
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.05}>
              <FeatureCard {...feature} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
