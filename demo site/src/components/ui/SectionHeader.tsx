import { cn } from '../../lib/utils'

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-12 max-w-3xl space-y-3',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {badge && (
        <span className="inline-flex items-center rounded-full border border-[#c4e0d2] bg-[#eaf5ef] px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#0e4b38]">
          {badge}
        </span>
      )}
      <h2 className="font-editorial text-3xl font-normal tracking-tight text-[#14241e] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base leading-relaxed text-[#50685e]">{subtitle}</p>
      )}
    </div>
  )
}
