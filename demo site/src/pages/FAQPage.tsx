import { PageWrapper } from '../components/layout/PageWrapper'
import { FAQ } from '../components/sections/FAQ'
import { CTABanner } from '../components/sections/CTABanner'

export function FAQPage() {
  return (
    <PageWrapper>
      <FAQ />
      <CTABanner />
    </PageWrapper>
  )
}
