import { FadeIn } from '../ui/FadeIn'

const institutions = [
  'Greenwood International',
  'Heritage Public School',
  'St. Jude Model Academy',
  'Delhi Public Campus',
  'Oakridge Global Trust',
  'National Model College',
]

const stats = [
  { value: '500+', label: 'Schools & Colleges' },
  { value: '250,000+', label: 'Enrolled Students' },
  { value: '15,000+', label: 'Teachers & Staff' },
]

export function TrustedBy() {
  return (
    <section className="border-y border-[#edf3ef] bg-[#f4f8f5]/70 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-wider text-[#71877e]">
            Trusted by leading schools, colleges & educational trusts
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {institutions.map((inst) => (
              <div
                key={inst}
                className="flex h-10 items-center text-base font-editorial font-bold tracking-tight text-[#82968e] transition-colors hover:text-[#0e4b38]"
              >
                {inst}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-editorial text-3xl font-bold text-[#14241e] sm:text-4xl">
                  {value}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#50685e] uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
