import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses} overflow-hidden rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-lg transition-all animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#edf3ef]">
          <div>
            <h3 className="font-editorial text-xl font-semibold text-[#14241e]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[#60736c]">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71877e] hover:bg-[#f0f5f2] hover:text-[#14241e] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
