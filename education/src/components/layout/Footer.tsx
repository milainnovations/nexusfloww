import { Link } from 'react-router-dom'
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'
import { footerLinks } from '../../lib/routes'

export function Footer() {
  return (
    <footer className="border-t border-[#e2ece6] bg-[#f4f8f5] pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0e4b38] text-white font-serif font-bold text-lg shadow-xs">
                G
              </div>
              <span className="font-editorial text-2xl font-semibold text-[#14241e]">
                Greenwood School ERP
              </span>
            </div>
            <p className="text-xs text-[#50685e] leading-relaxed max-w-sm">
              Comprehensive institutional management platform for school administration, academic tracking, student registries, exams, fees, transport, and parent communication.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#50685e]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0e4b38]" />
                <span>CBSE Affiliation #83042 • Main Campus, Bengaluru</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#0e4b38]" />
                <span>support@greenwood-erp.edu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#0e4b38]" />
                <span>+91 80 2847 9000</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h4 className="font-editorial text-sm font-semibold uppercase tracking-wider text-[#0e4b38]">
                {title}
              </h4>
              <ul className="space-y-2 text-xs">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[#50685e] transition-colors hover:text-[#0e4b38]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#d8e6de] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#71877e]">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#0e4b38]" />
            <span>© {new Date().getFullYear()} Greenwood Education Systems. Powered by NexusFlow Architecture.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[#0e4b38]">Staff Login</Link>
            <Link to="/app/desk" className="hover:text-[#0e4b38]">Principal Portal</Link>
            <span className="flex items-center gap-1 text-[#10b981] font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> ISO 27001 Certified Security
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
