import { useEffect, useSyncExternalStore } from 'react'

import { apiErrorStatus } from '~/shared/api/error-details'

import { useServiceCenter, type ServiceCenter } from './care-center-api'

/** A per-browser preference, like the language; it never holds patient or account data. */
const STORAGE_KEY = 'careconnect.selected-center'
const PROMPTED_KEY = 'careconnect.center-prompted'

type SelectedCenterState = { center: ServiceCenter | null; pickerOpen: boolean }

const serverState: SelectedCenterState = { center: null, pickerOpen: false }
const listeners = new Set<() => void>()
let state: SelectedCenterState | undefined

function readStoredCenter(): ServiceCenter | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'name' in value &&
      typeof value.id === 'string' &&
      typeof value.name === 'string'
    )
      return { id: value.id, name: value.name }
  } catch {
    // Blocked or corrupted storage falls back to the platform-wide view.
  }
  return null
}

function current() {
  return (state ??= { center: readStoredCenter(), pickerOpen: false })
}

function emit(next: SelectedCenterState) {
  state = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Another tab changing the center keeps this tab in step.
  function syncFromStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) emit({ ...current(), center: readStoredCenter() })
  }
  window.addEventListener('storage', syncFromStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', syncFromStorage)
  }
}

/** Null returns to the services, prices and caregivers configured for the whole platform. */
export function selectCenter(choice: ServiceCenter | null) {
  // Picker options carry display details; only the ID and name are remembered.
  const center = choice && { id: choice.id, name: choice.name }
  try {
    if (center) localStorage.setItem(STORAGE_KEY, JSON.stringify(center))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // The choice still applies for this page session.
  }
  emit({ center, pickerOpen: false })
}

export function openCenterPicker() {
  emit({ ...current(), pickerOpen: true })
}

export function closeCenterPicker() {
  if (current().pickerOpen) emit({ ...current(), pickerOpen: false })
}

/** The first visit of a browser session without a chosen center asks for one once. */
export function promptCenterPickerOnce() {
  if (current().center) return
  try {
    if (sessionStorage.getItem(PROMPTED_KEY)) return
    sessionStorage.setItem(PROMPTED_KEY, '1')
  } catch {
    // Without session storage the picker still opens once per page load.
  }
  openCenterPicker()
}

export function useSelectedCenter() {
  return useSyncExternalStore(subscribe, current, () => serverState)
}

/**
 * The chosen center with its current customer-facing name. A center that no longer takes bookings
 * (404 from the public detail) returns the customer to all centers.
 */
export function useCurrentCenter() {
  const { center } = useSelectedCenter()
  const detail = useServiceCenter(center?.id)
  const removed = Boolean(center) && apiErrorStatus(detail.error) === 404

  useEffect(() => {
    if (removed) selectCenter(null)
  }, [removed])

  if (!center || removed) return null
  return detail.data && detail.data.id === center.id ? detail.data : center
}
