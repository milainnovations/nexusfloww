import React, { useState } from 'react'
import {
  Save,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useErpData } from '../context/ErpDataContext'
import { ChangePasswordModal } from '../components/common/ChangePasswordModal'

export const SettingsPage: React.FC = () => {
  const { user, activeInstitution, setInstitution } = useAuth()
  const { resetData } = useErpData()

  const [schoolName, setSchoolName] = useState(activeInstitution)
  const [academicYear, setAcademicYear] = useState('2024–2025 (Annual Session)')
  const [affiliationBoard, setAffiliationBoard] = useState('Central Board of Secondary Education (CBSE)')
  const [affiliationNumber, setAffiliationNumber] = useState('83042')
  const [attendanceThreshold, setAttendanceThreshold] = useState('75')
  const [gradingSystem, setGradingSystem] = useState('9-Point Grading Scale (A1, A2, B1, B2, C1, C2, D, E)')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setInstitution(schoolName)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to restore the default initial school records?')) {
      resetData()
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD SCHOOL CONFIGURATION
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            School & Institutional Settings
          </h1>
          <p className="text-sm text-[#50685e]">
            Global academic calendar, CBSE affiliation parameters, statutory thresholds, and security preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 rounded-xl bg-[#e8f6ed] px-3.5 py-2 text-xs font-semibold text-[#0e4b38]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Settings updated!</span>
            </div>
          )}

          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#dce7e1] bg-white px-4 py-2.5 text-xs font-semibold text-[#60736c] hover:bg-[#f3f7f4] transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-5">
          <h3 className="font-editorial text-xl font-normal text-[#14241e]">
            General School Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#32453e]">
                School / Institution Name
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#32453e]">
                Current Academic Session
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#32453e]">
                Affiliation Board
              </label>
              <select
                value={affiliationBoard}
                onChange={(e) => setAffiliationBoard(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Central Board of Secondary Education (CBSE)</option>
                <option>Council for the Indian School Certificate Examinations (ICSE)</option>
                <option>State Education Board</option>
                <option>International Baccalaureate (IB)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#32453e]">
                Affiliation / School Code
              </label>
              <input
                type="text"
                value={affiliationNumber}
                onChange={(e) => setAffiliationNumber(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-5">
          <h3 className="font-editorial text-xl font-normal text-[#14241e]">
            Academic & Attendance Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#32453e]">
                Statutory Attendance Minimum (%)
              </label>
              <input
                type="number"
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
              <p className="text-[11px] text-[#71877e]">
                Pupils falling below 75% trigger alerts on the Principal and Teacher desks.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#32453e]">
                Grading System
              </label>
              <select
                value={gradingSystem}
                onChange={(e) => setGradingSystem(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3.5 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>9-Point Grading Scale (A1, A2, B1, B2, C1, C2, D, E)</option>
                <option>Percentage Scale with Grade Descriptors</option>
                <option>Letter Grades (A, B, C, D, F)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Password Reset Section */}
        <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ee] text-[#0e4b38]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-normal text-[#14241e]">
                Account Security & Password Control
              </h3>
              <p className="text-xs text-[#50685e]">
                Update login credentials for active user ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#edf3ef]">
            <div className="text-xs text-[#50685e]">
              Default initial password for newly created student accounts is <code>School@1234</code> with mandatory first-login reset.
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0e4b38] px-5 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all shrink-0"
            >
              <KeyRound className="h-4 w-4" />
              <span>Change My Password</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0e4b38] px-6 py-2.5 text-xs font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save School Configuration</span>
          </button>
        </div>
      </form>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
