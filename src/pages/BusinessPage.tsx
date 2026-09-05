import { PageWrapper } from '../components/layout/PageWrapper'
import { BusinessEdition } from '../components/sections/BusinessEdition'
import { CTABanner } from '../components/sections/CTABanner'

export function BusinessPage() {
  return (
    <PageWrapper>
      <BusinessEdition />
      <CTABanner />
    </PageWrapper>
  )
}
