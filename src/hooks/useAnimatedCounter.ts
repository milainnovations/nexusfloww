import { useEffect, useRef, useState } from 'react'

interface UseAnimatedCounterOptions {
  end: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  startOnView?: boolean
}

export function useAnimatedCounter({
  end,
  duration = 2000,
  decimals = 0,
  suffix = '',
  prefix = '',
  startOnView = true,
}: UseAnimatedCounterOptions) {
  const [value, setValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(!startOnView)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!startOnView || hasStarted) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnView, hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number | null = null
    let frame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [end, duration, hasStarted])

  const formatted =
    prefix +
    (decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()) +
    suffix

  return { ref, formatted, value }
}
