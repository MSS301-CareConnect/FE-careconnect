import { useIsFetching } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router'

const SHOW_AFTER_MS = 150

/**
 * A 2 px bar at the top while a route chunk loads or a screen waits for its first data. Background refetches of data
 * already on screen do not show it, and quick loads (under 150 ms) never flash it.
 */
export function CaregiverRouteProgress() {
  const navigation = useNavigation()
  const firstLoads = useIsFetching({ predicate: (query) => query.state.data === undefined })
  const busy = navigation.state !== 'idle' || firstLoads > 0
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!busy) {
      const hide = window.setTimeout(() => setVisible(false), 0)
      return () => window.clearTimeout(hide)
    }
    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [busy])

  return (
    <div
      aria-hidden='true'
      className={`pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {visible ? <div className='cg-progress-bar h-full w-full bg-primary' /> : null}
    </div>
  )
}
