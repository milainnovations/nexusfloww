import { FadeIn } from '../ui/FadeIn'

const companies = [
  'Acme Corp',
  'GlobalTech',
  'EduPrime',
  'RetailMax',
  'CloudScale',
  'InnovateCo',
]

const stats = [
  { value: '10,000+', label: 'Businesses' },
  { value: '500+', label: 'Educational Institutions' },
  { value: '1 Million+', label: 'Users' },
]

export function TrustedBy() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/70 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
            Trusted by industry leaders & educational systems
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {companies.map((company) => (
              <div
                key={company}
                className="flex h-10 items-center text-lg font-bold tracking-tight text-slate-400 transition-colors hover:text-slate-700"
              >
                {company}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
