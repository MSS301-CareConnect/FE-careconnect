export const caregiverNavigation = [
  { key: 'today', to: '/caregiver/today', icon: 'today', paths: ['/caregiver/today'] },
  { key: 'visits', to: '/caregiver/visits', icon: 'assignment_ind', paths: ['/caregiver/visits'] },
  {
    key: 'work',
    to: '/caregiver/schedule',
    icon: 'calendar_month',
    paths: ['/caregiver/schedule', '/caregiver/work-shifts', '/caregiver/time-off']
  },
  { key: 'profile', to: '/caregiver/profile', icon: 'person', paths: ['/caregiver/profile', '/caregiver/security'] }
] as const

export type CaregiverNavigationItem = (typeof caregiverNavigation)[number]

export function activeCaregiverNavigation(pathname: string): CaregiverNavigationItem {
  return (
    caregiverNavigation.find((item) =>
      item.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
    ) ?? caregiverNavigation[0]
  )
}

/**
 * Key that decides when the page content re-animates: the three work-schedule routes are tabs of one page, so moving
 * between them keeps the page in place; anything else animates per path.
 */
export function caregiverPageKey(pathname: string) {
  const active = activeCaregiverNavigation(pathname)
  return active.key === 'work' ? 'work' : pathname
}
