import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { type LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan'
  className?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group rounded-2xl border border-[#e2ece6] bg-white p-5 shadow-bluke-sm transition-all hover:border-[#b8cfc3] hover:shadow-bluke-md',
        className,
      )}
    >
      <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ef] text-[#0e4b38] border border-[#cbe1d5] shadow-2xs">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-editorial text-xl font-medium text-[#14241e] group-hover:text-[#0e4b38] transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-[#50685e]">
        {description}
      </p>
    </motion.div>
  )
}
