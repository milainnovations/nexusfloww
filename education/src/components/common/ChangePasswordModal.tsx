import React, { useState } from 'react'
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  isForced?: boolean
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isForced = false,
}) => {
  const { changePassword, user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  // Password rules validation
  const hasMinLength = newPassword.length >= 6
  const hasNumberOrSpecial = /[0-9!@#$%^&*()]/.test(newPassword)
  const matchesConfirm = newPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!newPassword) {
      setErrorMsg('Please enter a new password.')
      return
    }

    if (!hasMinLength) {
      setErrorMsg('New password must be at least 6 characters long.')
      return
    }

    if (newPassword === 'School@1234' || newPassword === 'Demo@1234') {
      setErrorMsg('Please choose a password different from the initial default password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.')
      return
    }

    setLoading(true)
    const effectiveCurrentPwd = currentPassword || (user?.email.endsWith('@demo.com') ? 'Demo@1234' : 'School@1234')
    const res = await changePassword(effectiveCurrentPwd, newPassword)
    setLoading(false)

    if (res.success) {
      setSuccessMsg(res.message || 'Password updated successfully!')
      setTimeout(() => {
        setSuccessMsg(null)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        onClose()
      }, 1000)
    } else {
      setErrorMsg(res.message || 'Failed to update password.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#d6e3dc] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ee] text-[#0e4b38]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-semibold text-[#14241e]">
                {isForced ? 'Set Your New Password' : 'Change Account Password'}
              </h3>
              <p className="text-xs text-[#50685e]">
                {isForced
                  ? 'First-time login detected. Please create your secure account password.'
                  : `Update password for ${user?.email}`}
              </p>
            </div>
          </div>
          {!isForced && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[#71877e] hover:bg-[#f0f5f2] hover:text-[#14241e]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Banners */}
        {isForced && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Temporary Password Active: </span>
              Your account currently uses default credentials. Please create your new password to secure your account.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Current / Default Password {isForced && <span className="text-xs text-[#71877e] font-normal">(Default: School@1234)</span>}
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={isForced ? 'School@1234 (Optional)' : 'Enter current password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa39b] hover:text-[#14241e]"
              >
                {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              New Secure Password *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Enter new password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Confirm New Password *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          {/* Validation Checklist */}
          <div className="rounded-xl bg-[#f7faf8] p-3 text-[11px] space-y-1.5 border border-[#e5ebe7]">
            <div className="font-semibold text-[#50685e]">Password Requirements:</div>
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-[#82968e]'}`}>
              <CheckCircle2 className={`h-3 w-3 ${hasMinLength ? 'text-emerald-600' : 'text-[#b0c2b9]'}`} />
              <span>At least 6 characters long</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumberOrSpecial ? 'text-emerald-700 font-medium' : 'text-[#82968e]'}`}>
              <CheckCircle2 className={`h-3 w-3 ${hasNumberOrSpecial ? 'text-emerald-600' : 'text-[#b0c2b9]'}`} />
              <span>Includes numbers or symbols</span>
            </div>
            <div className={`flex items-center gap-1.5 ${matchesConfirm ? 'text-emerald-700 font-medium' : 'text-[#82968e]'}`}>
              <CheckCircle2 className={`h-3 w-3 ${matchesConfirm ? 'text-emerald-600' : 'text-[#b0c2b9]'}`} />
              <span>Passwords match</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#edf3ef]">
            {!isForced && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#d6e3dc] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f4f8f5]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#125641] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{loading ? 'Updating Password…' : 'Save New Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
