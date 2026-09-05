import { PageWrapper } from '../components/layout/PageWrapper'
import { IndustrySolutions } from '../components/sections/IndustrySolutions'
import { CTABanner } from '../components/sections/CTABanner'

export function IndustriesPage() {
  return (
    <PageWrapper>
      <IndustrySolutions />
      <CTABanner />
    </PageWrapper>
  )
}
