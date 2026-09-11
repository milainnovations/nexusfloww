import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { FadeIn } from '../ui/FadeIn'
import { SectionHeader } from '../ui/SectionHeader'

const testimonials = [
  {
    name: 'Dr. Michael Roberts',
    role: 'Principal',
    company: 'Westfield Senior Academy',
    avatar: 'MR',
    rating: 5,
    text: 'From admissions to fee collection, everything is seamless. Our staff productivity increased dramatically and parents love the communication portal.',
  },
  {
    name: 'Priya Sharma',
    role: 'Managing Director',
    company: 'Greenwood International School',
    avatar: 'PS',
    rating: 5,
    text: 'Managing 2,500 students across 3 campuses was a nightmare before Greenwood ERP. The academic timetabling and attendance watch modules are game-changers.',
  },
  {
    name: 'Prof. Rajesh Nair',
    role: 'Head of Academics',
    company: 'Heritage Model College',
    avatar: 'RN',
    rating: 5,
    text: 'The examination entry sheets and instant report card generation saved our faculty weeks of manual data entry during term finals.',
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  const t = testimonials[current]

  return (
    <section className="py-20 lg:py-28 bg-[#fbfbfa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeader
            badge="Institutional Trust"
            title="Loved by Principals & Administrators"
            subtitle="See what educational leaders say about operating with Greenwood Education ERP."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative mx-auto max-w-3xl">
            <Quote className="absolute -left-4 -top-4 h-12 w-12 text-[#e2ece6]" />

            <div className="overflow-hidden rounded-2xl border border-[#e2ece6] bg-white p-8 shadow-bluke-sm sm:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <blockquote className="font-editorial text-xl sm:text-2xl leading-relaxed text-[#14241e] font-normal">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>

                  <div className="mt-8 flex items-center gap-4 pt-6 border-t border-[#edf3ef]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf5ef] text-sm font-bold text-[#0e4b38] border border-[#c4e0d2]">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-editorial font-semibold text-lg text-[#14241e] leading-tight">
                        {t.name}
                      </p>
                      <p className="text-xs text-[#71877e]">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prev}
                className="rounded-full border border-[#c9ded4] bg-white p-2 text-[#0e4b38] shadow-2xs hover:bg-[#f2f7f4]"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current
                        ? 'w-6 bg-[#0e4b38]'
                        : 'w-2 bg-[#cbdcd3]'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                className="rounded-full border border-[#c9ded4] bg-white p-2 text-[#0e4b38] shadow-2xs hover:bg-[#f2f7f4]"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
