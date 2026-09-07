import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { routes } from '../lib/routes'

export function NotFoundPage() {
  return (
    <PageWrapper className="flex min-h-[60vh] items-center justify-center pb-20">
      <div className="mx-auto max-w-lg px-4 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-[#0e4b38]">
          404 ERROR
        </p>
        <h1 className="mt-4 font-editorial text-4xl font-extrabold text-[#14241e]">
          Page not found
        </h1>
        <p className="mt-4 text-sm text-[#50685e]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to={routes.home} className="mt-8 inline-block">
          <Button className="bg-[#0e4b38] text-white hover:bg-[#125641]">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </PageWrapper>
  )
}
