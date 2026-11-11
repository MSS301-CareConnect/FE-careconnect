export const caregiverNavigation = [
  { key: 'today', to: '/caregiver/today', icon: 'today', paths: ['/caregiver/today'] },
  // Requests customers sent straight to the caregiver (CR-3) live in the visits tab "Needs your answer";
  // /caregiver/requests redirects there.
  {
    key: 'visits',
    to: '/caregiver/visits',
    icon: 'assignment_ind',
    paths: ['/caregiver/visits', '/caregiver/requests']
  },
  {
    key: 'work',
    to: '/caregiver/schedule',
    icon: 'calendar_month',
    paths: ['/caregiver/schedule', '/caregiver/work-shifts', '/caregiver/time-off']
  },
  {
    key: 'profile',
    to: '/caregiver/profile',
    icon: 'person',
    paths: ['/caregiver/profile', '/caregiver/security']
  }
] as const

export type CaregiverNavigationItem = (typeof caregiverNavigation)[number]

/**
 * Pages opened from the account menu or the bell (2026-11-10): they belong to no section of the rail, so nothing is
 * selected there and the phone topbar names the page itself.
 */
const standalonePages = [
  { key: 'wallet', path: '/caregiver/wallet' },
  { key: 'earnings', path: '/caregiver/earnings' },
  { key: 'notifications', path: '/caregiver/notifications' }
] as const

export type CaregiverPageTitleKey = CaregiverNavigationItem['key'] | (typeof standalonePages)[number]['key']

function matches(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

/** The rail section that holds the page, or undefined for a page outside the four sections (wallet, earnings…). */
export function activeCaregiverNavigation(pathname: string): CaregiverNavigationItem | undefined {
  if (pathname === '/caregiver' || pathname === '/caregiver/') return caregiverNavigation[0]
  return caregiverNavigation.find((item) => item.paths.some((path) => matches(pathname, path)))
}

/** The name the phone topbar shows for the page: its section, or the page itself when it has none. */
export function caregiverPageTitleKey(pathname: string): CaregiverPageTitleKey {
  return (
    activeCaregiverNavigation(pathname)?.key ??
    standalonePages.find((page) => matches(pathname, page.path))?.key ??
    'today'
  )
}

/**
 * Key that decides when the page content re-animates: the three work-schedule routes are tabs of one page, so moving
 * between them keeps the page in place; anything else animates per path.
 */
export function caregiverPageKey(pathname: string) {
  return activeCaregiverNavigation(pathname)?.key === 'work' ? 'work' : pathname
}
