import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { EducationEdition } from '../components/sections/EducationEdition'
import { CTABanner } from '../components/sections/CTABanner'

export function EducationPage() {
  return (
    <PageWrapper>
      {/* 1. HERO BANNER: BLUKE CAMPUS OFFICE INTEGRATION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#f2f7f4] via-[#fbfbfa] to-white border-b border-[#e2ece6]">
        {/* Subtle decorative dot pattern */}
        <div className="absolute inset-0 dot-grid-subtle opacity-40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Copy */}
            <div className="max-w-2xl space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c4e0d2] bg-[#eaf5ef] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#0e4b38]">
                <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                HIGHER EDUCATION ERP • POWERED BY NEXUSFLOW
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#14241e] leading-[1.12]">
                The day-to-day work of a college,{' '}
                <span className="italic font-serif text-[#0e4b38]">in one orderly place.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#4e645b] leading-relaxed font-light max-w-xl mx-auto lg:mx-0">
                Attendance registers, academic cohorts, fee demand ledgers, residential housing,
                and HR records—engineered specifically for the staff who keep campus moving.
              </p>

              {/* Action Triggers */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[#0e4b38] px-6 py-3.5 text-sm font-semibold text-white shadow-bluke-md hover:bg-[#125641] transition-all"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#cbdcd2] bg-white px-5 py-3.5 text-sm font-semibold text-[#0e4b38] shadow-bluke-sm hover:bg-[#f3f7f4] transition-all"
                >
                  <ShieldCheck className="h-4 w-4 text-[#0e4b38]" />
                  <span>Staff Access Portal</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#e2ece6] text-xs font-medium text-[#50685e]">
                <div className="flex items-center justify-center lg:justify-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                  <span>Tenant-aware</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                  <span>Academic records</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                  <span>Role controlled</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Live Card Preview */}
            <div className="w-full max-w-lg">
              <div className="rounded-2xl border border-[#d6e5dc] bg-white p-6 shadow-bluke-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e4b38] text-white font-serif font-bold text-sm">
                      N
                    </div>
                    <div>
                      <div className="font-editorial font-semibold text-sm text-[#14241e]">
                        DEMO / Campus desk
                      </div>
                      <div className="text-[10px] text-[#71877e]">Dr. Rajesh Kumar • Super Admin</div>
                    </div>
                  </div>
                  <Link
                    to="/login"
                    className="flex items-center gap-1 rounded-lg bg-[#f4f8f5] px-2.5 py-1 text-[11px] font-semibold text-[#0e4b38] hover:bg-[#e4efe9]"
                  >
                    <span>Open Live App</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Mini Stat Cards preview */}
                <div className="grid grid-cols-2 gap-2.5 text-left">
                  <Link
                    to="/app/students"
                    className="rounded-xl border border-[#e2ece6] bg-[#fbfdfc] p-3 hover:border-[#b8cfc3] transition-colors"
                  >
                    <div className="text-[11px] text-[#71877e]">Enrolled students</div>
                    <div className="font-editorial text-2xl font-semibold text-[#14241e]">8</div>
                  </Link>

                  <Link
                    to="/app/faculty"
                    className="rounded-xl border border-[#e2ece6] bg-[#fbfdfc] p-3 hover:border-[#b8cfc3] transition-colors"
                  >
                    <div className="text-[11px] text-[#71877e]">Faculty & staff</div>
                    <div className="font-editorial text-2xl font-semibold text-[#14241e]">4</div>
                  </Link>

                  <Link
                    to="/app/fees"
                    className="rounded-xl border border-[#e2ece6] bg-[#fbfdfc] p-3 hover:border-[#b8cfc3] transition-colors"
                  >
                    <div className="text-[11px] text-[#71877e]">Fees outstanding</div>
                    <div className="font-editorial text-xl font-semibold text-[#14241e]">₹8,00,000</div>
                  </Link>

                  <Link
                    to="/app/attendance"
                    className="rounded-xl border border-[#fde68a] bg-[#fef7ec] p-3 hover:border-[#fcd34d] transition-colors"
                  >
                    <div className="text-[11px] text-[#b45309]">Attendance watch</div>
                    <div className="font-editorial text-2xl font-semibold text-[#b45309]">6 alert</div>
                  </Link>
                </div>

                {/* Quick module links */}
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                  <Link to="/app/students" className="rounded-lg bg-[#f0f5f2] px-2.5 py-1 text-[#0e4b38] hover:bg-[#e2ede6]">
                    Academic Registry
                  </Link>
                  <Link to="/app/timetable" className="rounded-lg bg-[#f0f5f2] px-2.5 py-1 text-[#0e4b38] hover:bg-[#e2ede6]">
                    Weekly Timetable
                  </Link>
                  <Link to="/app/fees" className="rounded-lg bg-[#f0f5f2] px-2.5 py-1 text-[#0e4b38] hover:bg-[#e2ede6]">
                    Fee Invoices
                  </Link>
                  <Link to="/app/hostel" className="rounded-lg bg-[#f0f5f2] px-2.5 py-1 text-[#0e4b38] hover:bg-[#e2ede6]">
                    Hostel Beds
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE COMPREHENSIVE EDUCATION SUITE */}
      <EducationEdition />

      {/* 3. CTA */}
      <CTABanner />
    </PageWrapper>
  )
}
