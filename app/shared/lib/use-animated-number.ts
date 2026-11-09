import { useEffect, useRef, useState } from 'react'

/** Counts from the previous value to the new one over `duration` ms; jumps straight there under reduced motion. */
export function useAnimatedNumber(value: number, duration = 450) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    from.current = value
    const reduced =
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || start === value) {
      setShown(value)
      return
    }
    let frame = 0
    const began = performance.now()
    // Whole numbers count in whole steps; a decimal (a 4.8 rating) counts in hundredths and lands on its exact value.
    const whole = Number.isInteger(start) && Number.isInteger(value)
    const tick = (time: number) => {
      const progress = Math.min(1, (time - began) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (value - start) * eased
      setShown(progress === 1 ? value : whole ? Math.round(current) : Math.round(current * 100) / 100)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return shown
}
