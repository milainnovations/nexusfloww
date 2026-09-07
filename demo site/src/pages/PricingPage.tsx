import { PageWrapper } from '../components/layout/PageWrapper'
import { Pricing } from '../components/sections/Pricing'
import { FAQ } from '../components/sections/FAQ'

export function PricingPage() {
  return (
    <PageWrapper>
      <Pricing />
      <FAQ />
    </PageWrapper>
  )
}
