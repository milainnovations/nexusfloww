import {
  Target,
  Database,
  GraduationCap,
  MessageSquare,
  Megaphone,
  Users,
  Calendar,
  ClipboardCheck,
  Award,
  CreditCard,
  BookOpen,
  Home,
  Building,
  FolderGit2,
} from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { FeatureCard } from '../ui/FeatureCard'

const crmModules = [
  {
    icon: Target,
    title: 'Lead Management',
    description: 'Capture, qualify, and convert potential leads with intelligent scoring.',
    color: 'blue' as const,
  },
  {
    icon: Database,
    title: 'Student Database',
    description: 'Centralized profiles linking personal files, guardians, and medical logs.',
    color: 'purple' as const,
  },
  {
    icon: GraduationCap,
    title: 'Admissions Pipeline',
    description: 'Visual admissions workflow management with documentation and status checks.',
    color: 'emerald' as const,
  },
  {
    icon: MessageSquare,
    title: 'Parent Communication',
    description: 'Keep parents informed with real-time SMS, email, and mobile push notifications.',
    color: 'rose' as const,
  },
  {
    icon: Megaphone,
    title: 'Marketing Campaigns',
    description: 'Targeted email and WhatsApp campaigns to nurture potential student leads.',
    color: 'amber' as const,
  },
  {
    icon: Users,
    title: 'Counsellor Dashboard',
    description: 'Complete view of counselor activities, callbacks, and conversation logs.',
    color: 'cyan' as const,
  },
]

const erpModules = [
  {
    icon: Calendar,
    title: 'Academic Timetable',
    description: 'Clash-free visual schedules allocating courses, rooms, and faculty dynamically.',
    color: 'purple' as const,
  },
  {
    icon: ClipboardCheck,
    title: 'Smart Attendance',
    description: 'Daily classroom check-ins via biometric scanners, RFID tags, or QR codes.',
    color: 'emerald' as const,
  },
  {
    icon: Award,
    title: 'Examinations & Grading',
    description: 'Build question banks, entry sheet marks, and compile transcripts with QR validation.',
    color: 'amber' as const,
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Installment trackers, invoicing ledgers, and dynamic merit scholarship applications.',
    color: 'rose' as const,
  },
  {
    icon: BookOpen,
    title: 'LMS Student Portal',
    description: 'Access lecture videos, review syllabus logs, and submit interactive quizzes.',
    color: 'blue' as const,
  },
  {
    icon: Home,
    title: 'Hostel Allocations',
    description: 'Real-time room occupancy maps, visitor check-ins, and dormitory mesh lists.',
    color: 'cyan' as const,
  },
  {
    icon: Building,
    title: 'Helpdesk & Complaints',
    description: 'Infrastructure and academic incident tickets with automated SLA routing rules.',
    color: 'amber' as const,
  },
  {
    icon: FolderGit2,
    title: 'HR & Faculty Directory',
    description: 'Complete staff roster, leave request managers, payroll calculations, and compliance.',
    color: 'blue' as const,
  },
]

export function EducationEdition() {
  return (
    <section id="education" className="py-20 lg:py-28 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Education Edition"
            title="Education CRM & ERP"
            subtitle="Digitize your institution from admissions to graduation with specialized education workflows."
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
