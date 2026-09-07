import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'brand'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0e4b38] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[#0e4b38] text-white shadow-bluke-sm hover:bg-[#125641] active:scale-[0.98]':
              variant === 'primary' || variant === 'brand',
            'border border-[#c9ded4] bg-white text-[#0e4b38] shadow-2xs hover:bg-[#f2f7f4] hover:border-[#b4d2c2]':
              variant === 'secondary',
            'text-[#384e45] hover:bg-[#f2f7f4] hover:text-[#0e4b38]':
              variant === 'ghost',
            'border border-[#0e4b38] text-[#0e4b38] hover:bg-[#eaf5ef]':
              variant === 'outline',
            'px-3.5 py-1.5 text-xs': size === 'sm',
            'px-5 py-2.5 text-xs font-semibold': size === 'md',
            'px-6 py-3 text-sm font-semibold': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
