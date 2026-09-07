import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { Button } from '../ui/Button'
import { routes } from '../../lib/routes'

export function CTABanner() {
  return (
    <section className="py-20 bg-[#fbfbfa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#092c20] via-[#0e4b38] to-[#125641] px-8 py-16 text-center shadow-bluke-lg sm:px-16 text-white border border-[#1b6b52]/40">
            {/* Subtle dot pattern */}
            <div className="absolute inset-0 dot-grid-dark opacity-30 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#9ae0c3] backdrop-blur-xs border border-white/15">
                NexusFlow Cloud Platform
              </span>
              <h2 className="font-editorial text-3xl font-normal text-white sm:text-5xl tracking-tight">
                Ready to transform your operations?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[#d0ebdE] text-base sm:text-lg font-light leading-relaxed">
                Join thousands of businesses and educational institutions streamlining their workflows with NexusFlow.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
                <Link to={routes.pricing}>
                  <Button
                    size="lg"
                    className="bg-white text-[#0e4b38] hover:bg-[#eaf5ef] font-bold shadow-md"
                  >
                    View Pricing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={routes.contact}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/50 text-white hover:bg-white/10 font-semibold"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
