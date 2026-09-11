import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Users,
  CalendarCheck,
  Award,
  CreditCard,
  Bus,
  Library,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMegaOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass-nav shadow-soft' : 'bg-white/90 backdrop-blur-md border-b border-[#edf3ef]',
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0e4b38] text-white shadow-sm font-serif font-bold text-lg">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#14241e] font-editorial leading-none">
              Greenwood ERP
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[#71877e] uppercase mt-0.5">
              EDUCATION OPERATING SYSTEM
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-[#384e45] transition-colors hover:bg-[#f2f7f4] hover:text-[#0e4b38]"
              aria-expanded={megaOpen}
            >
              Academic Modules
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', megaOpen && 'rotate-180')}
              />
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full pt-2"
                >
                  <div className="glass w-[480px] rounded-2xl p-6 shadow-soft-lg bg-white border border-[#e2ece6]">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#71877e]">
                          Academics & Roster
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>
                            <Link to="/app/students" className="flex items-center gap-2 rounded-lg p-2 text-[#14241e] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
                              <Users className="h-4 w-4 text-[#0e4b38]" />
                              Student Registry
                            </Link>
                          </li>
                          <li>
                            <Link to="/app/attendance" className="flex items-center gap-2 rounded-lg p-2 text-[#14241e] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
                              <CalendarCheck className="h-4 w-4 text-[#10b981]" />
                              Attendance Tracker
                            </Link>
                          </li>
                          <li>
                            <Link to="/app/exams-grades" className="flex items-center gap-2 rounded-lg p-2 text-[#14241e] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
                              <Award className="h-4 w-4 text-[#0e4b38]" />
                              Exams & Report Cards
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#71877e]">
                          School Administration
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>
                            <Link to="/app/fees" className="flex items-center gap-2 rounded-lg p-2 text-[#14241e] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
                              <CreditCard className="h-4 w-4 text-[#10b981]" />
                              Fees & Invoicing
                            </Link>
                          </li>
                          <li>
                            <Link to="/app/hostel" className="flex items-center gap-2 rounded-lg p-2 text-[#14241e] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
                              <Bus className="h-4 w-4 text-[#0e4b38]" />
                              Hostel & Transport
                            </Link>
                          </li>
                          <li>
                            <Link to="/app/library" className="flex items-center gap-2 rounded-lg p-2 text-[#14241e] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
                              <Library className="h-4 w-4 text-[#10b981]" />
                              Library Repo
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/#features" className="rounded-xl px-3 py-2 text-xs font-semibold text-[#384e45] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
            Key Features
          </Link>
          <Link to="/#pricing" className="rounded-xl px-3 py-2 text-xs font-semibold text-[#384e45] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
            Editions & Pricing
          </Link>
          <Link to="/#faq" className="rounded-xl px-3 py-2 text-xs font-semibold text-[#384e45] hover:bg-[#f2f7f4] hover:text-[#0e4b38]">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2.5 sm:flex">
            <Link to="/login">
              <button className="rounded-xl border border-[#c9ded4] bg-white px-4 py-2 text-xs font-semibold text-[#0e4b38] hover:bg-[#f2f7f4] transition-all shadow-2xs flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Staff Portal
              </button>
            </Link>
            <Link to="/login">
              <button className="rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641] transition-all shadow-sm flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                Launch Live App
              </button>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-[#384e45] hover:bg-[#f2f7f4] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-[#e2ece6] overflow-hidden lg:hidden shadow-lg"
          >
            <div className="space-y-1 px-4 py-4 text-xs font-semibold">
              <Link to="/app/desk" className="block rounded-xl px-3 py-2 text-[#14241e] hover:bg-[#f2f7f4]">
                School Overview Desk
              </Link>
              <Link to="/app/students" className="block rounded-xl px-3 py-2 text-[#14241e] hover:bg-[#f2f7f4]">
                Student Registry
              </Link>
              <Link to="/app/faculty" className="block rounded-xl px-3 py-2 text-[#14241e] hover:bg-[#f2f7f4]">
                Faculty & Staff
              </Link>
              <Link to="/app/attendance" className="block rounded-xl px-3 py-2 text-[#14241e] hover:bg-[#f2f7f4]">
                Attendance Register
              </Link>
              <Link to="/app/exams-grades" className="block rounded-xl px-3 py-2 text-[#14241e] hover:bg-[#f2f7f4]">
                Exams & Report Cards
              </Link>
              <Link to="/app/fees" className="block rounded-xl px-3 py-2 text-[#14241e] hover:bg-[#f2f7f4]">
                Fees & Accounts
              </Link>

              <div className="flex flex-col gap-2 pt-4 border-t border-[#edf3ef] mt-2">
                <Link to="/login">
                  <button className="w-full rounded-xl border border-[#c9ded4] bg-white px-4 py-2.5 text-xs font-semibold text-[#0e4b38]">
                    Staff Login Portal
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full rounded-xl bg-[#0e4b38] px-4 py-2.5 text-xs font-semibold text-white">
                    Launch School ERP App
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
