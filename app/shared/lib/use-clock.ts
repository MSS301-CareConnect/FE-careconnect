import { useEffect, useState } from 'react'

/**
 * "Now" in epoch milliseconds, fixed when the component mounts and refreshed every `intervalMs` so countdowns move,
 * without calling `Date.now()` during render (react-hooks/purity).
 */
export function useClock(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}
