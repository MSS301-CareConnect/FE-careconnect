import { useState } from 'react'

function readFlag(storageKey: string) {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(storageKey) === '1'
  } catch {
    return false
  }
}

/**
 * A yes/no browser preference kept in `localStorage` as '1' / '0' (such as a collapsed sidebar), read once on mount.
 * A blocked storage reads as false and only loses the preference.
 */
export function useStoredFlag(storageKey: string) {
  const [value, setValue] = useState(() => readFlag(storageKey))

  function toggle() {
    setValue((current) => {
      try {
        localStorage.setItem(storageKey, current ? '0' : '1')
      } catch {
        // A blocked storage only loses the preference.
      }
      return !current
    })
  }

  return [value, toggle] as const
}
