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
    title: 'Smart Analytics',
    description: 'Attendance watch, grade performance trends, and student risk alerts.',
    color: 'purple' as const,
  },
  {
    icon: Cloud,
    title: 'Cloud Native',
    description: '100% cloud-hosted with 99.9% uptime and zero server maintenance.',
    color: 'blue' as const,
  },
  {
    icon: Shield,
    title: 'CBSE / ICSE Secure',
    description: 'Compliant with Indian board grading scales and student privacy norms.',
    color: 'emerald' as const,
  },
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'Import student rosters via Excel and go live in under 24 hours.',
    color: 'amber' as const,
  },
  {
    icon: Smartphone,
    title: 'Parent & Student App',
    description: 'Responsive mobile interface for progress reports, fees, and notices.',
    color: 'cyan' as const,
  },
  {
    icon: GitBranch,
    title: 'Multi Campus',
    description: 'Manage multiple school branches under one central managing board.',
    color: 'rose' as const,
  },
  {
    icon: Users,
    title: 'Multi Role',
    description: 'Tailored desk views for Admins, Principals, Teachers, Students & Parents.',
    color: 'blue' as const,
  },
  {
    icon: Lock,
    title: 'Role Based Access',
    description: 'Strict privacy isolation between student records, grades, and fee data.',
    color: 'purple' as const,
  },
  {
    icon: BarChart3,
    title: 'Fee Ledgers',
    description: 'Track term installments, outstanding dues, and paid receipt histories.',
    color: 'emerald' as const,
  },
  {
    icon: Plug,
    title: 'Biometric & Bus API',
    description: 'Integrate with RFID attendance gates and bus GPS tracking hardware.',
    color: 'amber' as const,
  },
]

export function WhyChooseUs() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Institutional Core"
            title="Purpose-built for educational excellence"
            subtitle="Everything required to run a high-performing modern school or college."
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
