import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Share2,
  Globe,
  MessageSquare,
  Video,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { footerLinks, routes } from '../../lib/routes'

const socialLinks = [
  { icon: Share2, href: '#', label: 'Social' },
  { icon: Globe, href: '#', label: 'Website' },
  { icon: MessageSquare, href: '#', label: 'Community' },
  { icon: Video, href: '#', label: 'Videos' },
]

export function Footer() {
  return (
    <footer className="border-t border-[#123d2f] bg-[#072218] text-[#a3c9ba]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-4">
            <Link to={routes.home} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981] text-[#072218] font-serif font-bold text-lg shadow-sm">
                N
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-xl font-bold tracking-tight text-white leading-none">
                  NexusFlow
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#a3c9ba] uppercase mt-0.5">
                  ENTERPRISE CLOUD
                </span>
              </div>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-[#8cb8a6]">
              The unified CRM & ERP platform for modern businesses and educational
              institutions. Built for efficiency, scale, and clarity.
            </p>

            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold text-white uppercase tracking-wider">
                Subscribe for platform updates
              </p>
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter signup"
              >
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter institutional email"
                  className="flex-1 rounded-xl border border-[#1b4e3d] bg-[#0c3123] px-3.5 py-2 text-xs text-white placeholder-[#6a9785] outline-hidden focus:border-[#10b981]"
                />
                <Button type="submit" size="sm" className="bg-[#10b981] hover:bg-[#34d399] text-[#072218] font-bold shrink-0" aria-label="Subscribe">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-xs font-bold text-white uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs text-[#8cb8a6] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-[#123d2f] pt-8 sm:flex-row">
          <p className="text-xs text-[#6a9785]">
            © {new Date().getFullYear()} NexusFlow Cloud Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="rounded-lg p-2 text-[#8cb8a6] transition-colors hover:bg-[#0c3123] hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
