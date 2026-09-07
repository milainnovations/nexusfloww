import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  subtext: string
  icon: LucideIcon
  iconColor?: 'green' | 'amber' | 'blue' | 'purple'
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = 'green',
  onClick,
}) => {
  const iconBgClasses = {
    green: 'bg-[#e8f6ed] text-[#0e4b38]',
    amber: 'bg-[#fef3c7] text-[#b45309]',
    blue: 'bg-[#eff6ff] text-[#1d4ed8]',
    purple: 'bg-[#faf5ff] text-[#7e22ce]',
  }[iconColor]

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border border-[#e2ece6] bg-white p-5 transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:border-[#b8cfc3] hover:shadow-bluke-md'
          : 'shadow-bluke-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-[#667a73] tracking-wide">
            {label}
          </span>
          <div className="mt-2 font-editorial text-3xl font-medium text-[#14241e] tracking-tight">
            {value}
          </div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClasses} transition-transform group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 text-xs text-[#71877e] leading-normal">{subtext}</div>
    </div>
  )
}
