import React, { useState } from 'react'
import { Key, ShieldAlert, Copy, Check } from 'lucide-react'
import { Modal } from './Modal'
import { useErpData } from '../../context/ErpDataContext'
import type { Student } from '../../data/mockData'

interface EnrolStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (createdStudent: Student) => void
}

export const EnrolStudentModal: React.FC<EnrolStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addStudent } = useErpData()

  // Form State
  const [name, setName] = useState('')
  const [classGrade, setClassGrade] = useState('Class 8-A')
  const [section, setSection] = useState('A')
  const [gender, setGender] = useState<'Male' | 'Female'>('Male')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianRelation, setGuardianRelation] = useState('Father')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [busRoute, setBusRoute] = useState('Day Scholar (Own Transport)')
  const [address, setAddress] = useState('')
  const [remarks, setRemarks] = useState('')

  // Newly Provisioned Credentials Popup State
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string
    roll: string
    email: string
    pass: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const resetForm = () => {
    setName('')
    setClassGrade('Class 8-A')
    setSection('A')
    setGender('Male')
    setDateOfBirth('')
    setBloodGroup('')
    setRollNumber('')
    setEmail('')
    setPhone('')
    setGuardianName('')
    setGuardianRelation('Father')
    setGuardianPhone('')
    setBusRoute('Day Scholar (Own Transport)')
    setAddress('')
    setRemarks('')
  }

  const handleModalClose = () => {
    resetForm()
    setCreatedCredentials(null)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const createdStudent = addStudent({
      name,
      rollNumber,
      email,
      gender,
      classGrade,
      section,
      academicYear: '2024–2025',
      phone: phone || '',
      busRoute,
      guardianName: guardianName || '',
      guardianRelation: guardianRelation || 'Father',
      guardianPhone: guardianPhone || '',
      address: address || '',
      dues: 0,
      dateOfBirth: dateOfBirth || '',
      bloodGroup: bloodGroup || '',
      remarks: remarks || 'Newly admitted student for academic session 2024–25.',
    })

    if (onSuccess) {
      onSuccess(createdStudent)
    }

    // Show newly created credentials popup
    setCreatedCredentials({
      name: createdStudent.name,
      roll: createdStudent.rollNumber,
      email: createdStudent.email,
      pass: 'School@1234',
    })
  }

  const handleFinishCredentials = () => {
    setCreatedCredentials(null)
    resetForm()
    onClose()
  }

  return (
    <>
      {/* 1. ENROLMENT FORM MODAL */}
      <Modal
        isOpen={isOpen && !createdCredentials}
        onClose={handleModalClose}
        title="Enrol New Student"
        subtitle="Complete pupil registration details to generate official roll number and portal credentials."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Student Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#14241e] mb-1">
              Student Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan Dixit"
              className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
            />
          </div>

          {/* Class, Section & Gender */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Class Grade *</label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Class 6-A</option>
                <option>Class 6-B</option>
                <option>Class 7-A</option>
                <option>Class 8-A</option>
                <option>Class 9-A</option>
                <option>Class 10-A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Section *</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* DOB & Blood Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Date of Birth</label>
              <input
                type="text"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="e.g. 15 Aug 2011"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>B+</option>
                <option>O+</option>
                <option>A+</option>
                <option>AB+</option>
                <option>O-</option>
                <option>A-</option>
              </select>
            </div>
          </div>

          {/* Custom Roll Number & Login Email (Optional) */}
          <div className="grid grid-cols-2 gap-3 bg-[#f8faf9] p-3 rounded-xl border border-[#e2ece6]">
            <div>
              <label className="block text-[11px] font-semibold text-[#3a5248] mb-1">
                Custom Roll Number <span className="text-[#80968e] font-normal">(Auto-generated if empty)</span>
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. SCH-8A-15"
                className="w-full rounded-lg border border-[#c9dcd2] bg-white px-2.5 py-1.5 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3a5248] mb-1">
                Custom Login Email <span className="text-[#80968e] font-normal">(Auto-generated if empty)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@demo.com"
                className="w-full rounded-lg border border-[#c9dcd2] bg-white px-2.5 py-1.5 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Guardian Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 sm:col-span-1">
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Name *</label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent's Name"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Relation</label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Guardian Phone *</label>
              <input
                type="text"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Transport Route & Student Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Transport Route</label>
              <select
                value={busRoute}
                onChange={(e) => setBusRoute(e.target.value)}
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              >
                <option>Bus Route 04 (North City)</option>
                <option>Bus Route 02 (Indiranagar)</option>
                <option>Bus Route 06 (Whitefield)</option>
                <option>Day Scholar (Own Transport)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Student Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Address & Remarks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bengaluru Campus"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14241e] mb-1">Admission Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Session 2024–25"
                className="w-full rounded-xl border border-[#c9dcd2] px-3 py-2 text-xs text-[#14241e] focus:border-[#0e4b38] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf3ef]">
            <button
              type="button"
              onClick={handleModalClose}
              className="rounded-xl border border-[#c9dcd2] px-4 py-2 text-xs font-semibold text-[#485c54] hover:bg-[#f7faf8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0e4b38] px-5 py-2 text-xs font-semibold text-white hover:bg-[#125641]"
            >
              Confirm Enrolment & Issue Credentials
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. CREDENTIALS PROVISIONED CONFIRMATION MODAL */}
      <Modal
        isOpen={!!createdCredentials}
        onClose={handleFinishCredentials}
        title="Student Portal Account Provisioned"
        subtitle="Provide these credentials to the student or guardian for portal access."
      >
        {createdCredentials && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
              <Key className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold">Student Record & User Login Created!</span>
                <p className="text-[11px] text-emerald-700">
                  Initial password has been generated with mandatory password change flag.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#d6e3dc] bg-[#f8faf9] p-4 space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-[#e2ece6]">
                <span className="text-[#6c8279] text-[11px] font-sans font-medium">Student Name:</span>
                <span className="font-bold text-[#14241e] font-sans">{createdCredentials.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6c8279] text-[11px] font-sans font-medium">Roll Number:</span>
                <span className="font-bold text-[#0e4b38]">{createdCredentials.roll}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6c8279] text-[11px] font-sans font-medium">Login Email:</span>
                <span className="font-bold text-[#14241e] text-[11px]">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#e2ece6]">
                <span className="text-[#6c8279] text-[11px] font-sans font-medium">Initial Password:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {createdCredentials.pass}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-[#f4f8f5] p-3 text-[11px] text-[#50685e]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#0e4b38] mt-0.5" />
              <span>
                <strong>First Login Security Policy:</strong> Upon first signing in with initial password <code>{createdCredentials.pass}</code>, the student will be prompted to update their password.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = `Greenwood ERP Student Credentials:\nName: ${createdCredentials.name}\nRoll Number: ${createdCredentials.roll}\nLogin Email: ${createdCredentials.email}\nInitial Password: ${createdCredentials.pass}`
                  navigator.clipboard.writeText(text)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="rounded-xl border border-[#0e4b38] bg-[#eef7f2] px-4 py-2 font-sans font-semibold text-[#0e4b38] hover:bg-[#dfede6] flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={handleFinishCredentials}
                className="rounded-xl bg-[#0e4b38] px-5 py-2 font-sans font-semibold text-white hover:bg-[#125641]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
