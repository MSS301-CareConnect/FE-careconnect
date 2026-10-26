export interface Coordinates {
  latitude?: number
  longitude?: number
}

/**
 * Best-effort location for check-in/check-out. Coordinates are optional in the contract, so a denied
 * permission or a slow fix resolves without them instead of blocking the caregiver.
 */
export function currentPosition(timeoutMs = 8000): Promise<Coordinates> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve({})
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 }
    )
  })
}
