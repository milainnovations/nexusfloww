import { cn } from '../../lib/utils'

export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('pt-24', className)}>{children}</div>
}
