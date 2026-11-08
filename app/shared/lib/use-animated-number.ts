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
    const tick = (time: number) => {
      const progress = Math.min(1, (time - began) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setShown(Math.round(start + (value - start) * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return shown
}
