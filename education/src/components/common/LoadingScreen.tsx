import React from 'react'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading School Data…' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#061d15]">
      {/* Animated background dots */}
      <div className="pointer-events-none absolute inset-0 dot-grid-dark opacity-40" />

      {/* Glow effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0e4b38]/40 via-transparent to-[#125641]/20" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo mark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <span className="font-serif font-bold text-3xl text-white">G</span>
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-[#34d399] animate-spin" />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-white/90">{message}</p>
          <p className="text-xs text-[#a3c2b5]">Greenwood School Office</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-[#34d399] animate-pulse rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}
