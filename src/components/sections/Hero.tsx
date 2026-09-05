import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { Button } from '../ui/Button'
import { DashboardMockup } from '../dashboard/DashboardMockup'
import { routes } from '../../lib/routes'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-b from-[#f2f7f4] via-[#fbfbfa] to-white">
      <div className="gradient-bg absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <FadeIn>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c4e0d2] bg-[#eaf5ef] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0e4b38] shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
                </span>
                Trusted by 10,000+ organizations worldwide
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-editorial text-4xl font-normal leading-[1.12] tracking-tight text-[#14241e] sm:text-5xl lg:text-6xl">
                One Platform.{' '}
                <span className="gradient-text italic font-serif">
                  Complete CRM & ERP
                </span>{' '}
                for Business and Education.
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#4e645b]">
                Manage customers, inventory, sales, finance, students, admissions,
                fees, attendance, and operations—all from one intelligent, unified cloud
                platform.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link to="/login">
                  <Button size="lg" className="bg-[#0e4b38] hover:bg-[#125641] text-white shadow-bluke-md">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={routes.contact}>
                  <Button variant="secondary" size="lg" className="border border-[#c9ded4] bg-white text-[#0e4b38] hover:bg-[#f2f7f4] shadow-2xs">
                    <Play className="h-4 w-4" />
                    Book Demo
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-10 flex items-center gap-6 text-xs font-medium text-[#71877e]">
                <span>No credit card required</span>
                <span className="h-1 w-1 rounded-full bg-[#cbdcd3]" />
                <span>14-day free trial</span>
                <span className="h-1 w-1 rounded-full bg-[#cbdcd3]" />
                <span>Cancel anytime</span>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} direction="left">
            <DashboardMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
