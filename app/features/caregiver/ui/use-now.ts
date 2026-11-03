import { useEffect, useState } from 'react'

/**
 * The current time, refreshed every `intervalMs` while the component is mounted. Countdowns and "today" use it
 * instead of calling `Date.now()` during render (react-hooks/purity).
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}
