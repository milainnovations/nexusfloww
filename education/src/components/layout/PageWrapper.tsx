import React from 'react'

export const PageWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`min-h-screen bg-[#fbfbfa] text-[#14241e] pt-16 ${className}`}>{children}</div>
}
