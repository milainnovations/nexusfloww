import { FadeIn } from '../ui/FadeIn'
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter'

const stats = [
  { end: 10000, suffix: '+', label: 'Businesses', decimals: 0 },
  { end: 500, suffix: '+', label: 'Educational Institutions', decimals: 0 },
  { end: 99.9, suffix: '%', label: 'Uptime Reliability', decimals: 1 },
  { end: 1, suffix: 'M+', label: 'Active Users', decimals: 0 },
  { end: 120, suffix: '+', label: 'Countries Supported', decimals: 0 },
]

function StatItem({
  end,
  suffix,
  label,
  decimals,
}: {
  end: number
  suffix: string
  label: string
  decimals: number
}) {
  const { ref, formatted } = useAnimatedCounter({ end, suffix, decimals })

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="block font-editorial text-4xl font-normal text-white sm:text-5xl tracking-tight"
      >
        {formatted}
      </span>
      <p className="mt-2 text-xs font-medium text-[#b5decb] uppercase tracking-wider">{label}</p>
    </div>
  )
}

export function Statistics() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-24 bg-gradient-to-r from-[#092c20] via-[#0e4b38] to-[#07241a] text-white border-y border-[#154636]">
      <div className="absolute inset-0 dot-grid-dark opacity-35" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-12 text-center text-xs font-bold uppercase tracking-widest text-[#9ae0c3]">
            NexusFlow Institutional & Enterprise Scale
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <StatItem {...stat} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
