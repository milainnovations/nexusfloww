import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'purple' | 'blue'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-slate-100 text-slate-800 border border-slate-200':
            variant === 'default',
          'bg-emerald-50 text-emerald-800 border border-emerald-200':
            variant === 'success',
          'bg-amber-50 text-amber-800 border border-amber-200':
            variant === 'warning',
          'bg-purple-50 text-purple-800 border border-purple-200':
            variant === 'purple',
          'bg-blue-50 text-blue-800 border border-blue-200':
            variant === 'blue',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
