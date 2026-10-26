export const caregiverNavigation = [
  { key: 'home', to: '/caregiver/dashboard', icon: 'space_dashboard' },
  { key: 'schedule', to: '/caregiver/schedule', icon: 'calendar_month' },
  { key: 'shifts', to: '/caregiver/work-shifts', icon: 'event_available' },
  { key: 'visits', to: '/caregiver/visits', icon: 'assignment_ind' },
  { key: 'earnings', to: '/caregiver/dashboard#earnings', icon: 'payments' },
  { key: 'resources', to: '/caregiver/dashboard#tools', icon: 'description' },
  { key: 'history', to: '/caregiver/history', icon: 'history' },
  { key: 'profile', to: '/caregiver/profile', icon: 'person' }
] as const

export function activeCaregiverNavigation(pathname: string, hash: string) {
  if (pathname.startsWith('/caregiver/shifts/') || pathname === '/caregiver/shifts') return caregiverNavigation[2]
  if (pathname === '/caregiver/active-session') return caregiverNavigation[2]
  if (pathname.startsWith('/caregiver/visits')) return caregiverNavigation[3]
  return (
    caregiverNavigation.find((item) => item.to === pathname + hash) ??
    caregiverNavigation.find((item) => item.to === pathname) ??
    caregiverNavigation[0]
  )
}
