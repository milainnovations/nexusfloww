import { Hero } from '../components/sections/Hero'
import { TrustedBy } from '../components/sections/TrustedBy'
import { ExploreSection } from '../components/sections/ExploreSection'
import { Statistics } from '../components/sections/Statistics'
import { Testimonials } from '../components/sections/Testimonials'
import { CTABanner } from '../components/sections/CTABanner'

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ExploreSection />
      <Statistics />
      <Testimonials />
      <CTABanner />
    </>
  )
}
