import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { bookingKeys } from '~/entities/booking/booking-api'

import { notificationKeys, notificationStreamUrl } from './notification-api'

const NOTIFICATION_EVENT = 'notification'

/**
 * Keeps the bell live: each `notification` event from the SSE stream invalidates the cached list, unread count and bookings,
 * so TanStack Query stays the single source of remote state. The browser reconnects the EventSource by itself.
 */
export function useNotificationStream(enabled: boolean) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return undefined
    const source = new EventSource(notificationStreamUrl, { withCredentials: true })
    // Most notifications follow a booking change (confirmed, expired, assigned…): refresh open booking screens too.
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    }
    source.addEventListener(NOTIFICATION_EVENT, refresh)
    return () => {
      source.removeEventListener(NOTIFICATION_EVENT, refresh)
      source.close()
    }
  }, [enabled, queryClient])
}
