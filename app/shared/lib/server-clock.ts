/**
 * Server time correction for short countdowns (2026-11-09: the 5-minute booking hold). A browser clock a few minutes
 * off would show a wrong hold, so the offset to the last `serverTime` the backend returned is remembered per tab.
 */
let offsetMs = 0

/** Remembers the gap between the browser clock and a server timestamp received just now. */
export function syncServerClock(serverTime: string | undefined, receivedAt: number = Date.now()) {
  if (!serverTime) return
  const server = Date.parse(serverTime)
  if (Number.isFinite(server)) offsetMs = server - receivedAt
}

/** Current time in epoch milliseconds as the server sees it. Call from effects or state initialisers, not render. */
export function serverNow() {
  return Date.now() + offsetMs
}
