import { Mail, Phone, MapPin, MessageCircle, Headphones, FileText } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@nexusflow.io', href: 'mailto:hello@nexusflow.io' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { icon: MapPin, label: 'Address', value: '100 Innovation Drive, San Francisco, CA 94105', href: '#' },
]

const supportLinks = [
  { icon: MessageCircle, label: 'Live Desk Chat', description: 'Chat with an enterprise onboarding advisor' },
  { icon: Headphones, label: 'Help Center', description: 'Browse documentation & campus setup guides' },
  { icon: FileText, label: 'Submit Ticket', description: 'Create a priority technical support ticket' },
]

export function Contact() {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#fbfbfa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Direct Inquiries"
            title="Get in touch with our team"
            subtitle="Have questions about deploying NexusFlow for your institution or enterprise? We respond promptly."
          />
        </FadeIn>

        <div className="grid gap-12 lg:grid-cols-2">
          <FadeIn delay={0.1}>
            <form
              className="rounded-2xl border border-[#e2ece6] bg-white p-8 shadow-bluke-sm space-y-4"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Contact form"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="mb-1 block text-xs font-semibold text-[#32453e]">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 text-xs text-[#14241e] outline-hidden focus:border-[#0e4b38] focus:ring-1 focus:ring-[#0e4b38]"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="mb-1 block text-xs font-semibold text-[#32453e]">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 text-xs text-[#14241e] outline-hidden focus:border-[#0e4b38] focus:ring-1 focus:ring-[#0e4b38]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold text-[#32453e]">
                  Institutional / Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 text-xs text-[#14241e] outline-hidden focus:border-[#0e4b38] focus:ring-1 focus:ring-[#0e4b38]"
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-1 block text-xs font-semibold text-[#32453e]">
                  Edition of Interest
                </label>
                <select
                  id="subject"
                  className="w-full rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 text-xs text-[#14241e] outline-hidden focus:border-[#0e4b38] focus:ring-1 focus:ring-[#0e4b38]"
                >
                  <option>Higher Education ERP (Campus Office)</option>
                  <option>Business Enterprise CRM & ERP</option>
                  <option>General Institutional Inquiry</option>
                  <option>Architecture & Data Migration Walkthrough</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-xs font-semibold text-[#32453e]">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-[#c9dcd2] bg-white px-3.5 py-2.5 text-xs text-[#14241e] outline-hidden focus:border-[#0e4b38] focus:ring-1 focus:ring-[#0e4b38]"
                />
              </div>

              <Button type="submit" className="mt-2 w-full bg-[#0e4b38] text-white hover:bg-[#125641] shadow-bluke-md py-3 text-xs font-bold">
                Send Message
              </Button>
            </form>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <div className="space-y-3">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-4 rounded-xl border border-[#e2ece6] bg-white p-4 transition-colors hover:border-[#b8cfc3] shadow-2xs"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ef] text-[#0e4b38] border border-[#cbe1d5]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#71877e] uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-[#14241e]">{value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm">
                <h3 className="mb-3 text-xs font-bold text-[#0e4b38] uppercase tracking-wider">
                  Support & Implementation Resources
                </h3>
                <div className="space-y-2">
                  {supportLinks.map(({ icon: Icon, label, description }) => (
                    <a
                      key={label}
                      href="#"
                      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#f4f8f5]"
                    >
                      <Icon className="h-4 w-4 text-[#10b981]" />
                      <div>
                        <p className="text-xs font-semibold text-[#14241e]">
                          {label}
                        </p>
                        <p className="text-[11px] text-[#71877e]">{description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
