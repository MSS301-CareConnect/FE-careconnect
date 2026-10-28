export const caregiverNavigation = [
  { key: 'visits', to: '/caregiver/visits', icon: 'assignment_ind' },
  { key: 'schedule', to: '/caregiver/schedule', icon: 'calendar_month' },
  { key: 'shifts', to: '/caregiver/work-shifts', icon: 'event_available' },
  { key: 'profile', to: '/caregiver/profile', icon: 'person' }
] as const

export function activeCaregiverNavigation(pathname: string) {
  return (
    caregiverNavigation.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)) ??
    caregiverNavigation[0]
  )
}
