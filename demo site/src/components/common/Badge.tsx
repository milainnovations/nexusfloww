import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'neutral' | 'blue' | 'purple' | 'red'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  const variantClasses = {
    green: 'bg-[#e8f6ed] text-[#0d593f] border border-[#c4e6d3]',
    amber: 'bg-[#fef7ec] text-[#b45309] border border-[#fde68a]',
    neutral: 'bg-[#f1f5f3] text-[#4b5e56] border border-[#d8e4dd]',
    blue: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]',
    purple: 'bg-[#faf5ff] text-[#7e22ce] border border-[#e9d5ff]',
    red: 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]',
  }[variant]

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md tracking-tight ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  )
}
