import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Building2,
  GraduationCap,
  BarChart3,
  Shield,
  BookOpen,
  LayoutGrid,
  DollarSign,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { navLinks, megaMenuItems, routes } from '../../lib/routes'

const productIcons = {
  Features: Sparkles,
  Dashboard: BarChart3,
  Pricing: DollarSign,
} as const

const solutionIcons = {
  'Business CRM & ERP': Building2,
  'Education CRM & ERP': GraduationCap,
  'Industry Solutions': BookOpen,
} as const

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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
      isActive
        ? 'bg-[#eaf5ef] text-[#0e4b38] font-bold'
        : 'text-[#384e45] hover:bg-[#f2f7f4] hover:text-[#0e4b38]',
    )

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
        <Link to={routes.home} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0e4b38] text-white shadow-sm font-serif font-bold text-lg">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#14241e] font-editorial leading-none">
              NexusFlow
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[#71877e] uppercase mt-0.5">
              ENTERPRISE CLOUD
            </span>
          </div>
        </Link>

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
              Product
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
                          Product
                        </p>
                        <ul className="space-y-1">
                          {megaMenuItems.product.map(({ label, to }) => {
                            const Icon = productIcons[label as keyof typeof productIcons] ?? LayoutGrid
                            return (
                              <li key={label}>
                                <Link
                                  to={to}
                                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#14241e] transition-colors hover:bg-[#f2f7f4] hover:text-[#0e4b38]"
                                >
                                  <Icon className="h-4 w-4 text-[#0e4b38]" />
                                  {label}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#71877e]">
                          Solutions
                        </p>
                        <ul className="space-y-1">
                          {megaMenuItems.solutions.map(({ label, to }) => {
                            const Icon =
                              solutionIcons[label as keyof typeof solutionIcons] ?? Shield
                            return (
                              <li key={label}>
                                <Link
                                  to={to}
                                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#14241e] transition-colors hover:bg-[#f2f7f4] hover:text-[#0e4b38]"
                                >
                                  <Icon className="h-4 w-4 text-[#10b981]" />
                                  {label}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2.5 sm:flex">
            <Link to={routes.contact}>
              <button className="rounded-xl border border-[#c9ded4] bg-white px-4 py-2 text-xs font-semibold text-[#0e4b38] hover:bg-[#f2f7f4] transition-all shadow-2xs">
                Book Demo
              </button>
            </Link>
            <Link to="/login">
              <button className="rounded-xl bg-[#0e4b38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#125641] transition-all shadow-sm">
                Start Free Trial
              </button>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-[#384e45] hover:bg-[#f2f7f4] lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-[#e2ece6] overflow-hidden lg:hidden shadow-lg"
          >
            <div className="space-y-1 px-4 py-4">
              <Link
                to={routes.home}
                className="block rounded-xl px-3 py-2 text-xs font-semibold text-[#14241e] hover:bg-[#f2f7f4]"
              >
                Home
              </Link>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-3 py-2 text-xs font-semibold',
                      isActive
                        ? 'bg-[#eaf5ef] text-[#0e4b38] font-bold'
                        : 'text-[#14241e] hover:bg-[#f2f7f4]',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-[#edf3ef] mt-2">
                <Link to={routes.contact}>
                  <button className="w-full rounded-xl border border-[#c9ded4] bg-white px-4 py-2.5 text-xs font-semibold text-[#0e4b38]">
                    Book Demo
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full rounded-xl bg-[#0e4b38] px-4 py-2.5 text-xs font-semibold text-white">
                    Start Free Trial
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
