/** Center Manager navigation for the sidebar. */
export const managerNavigation = [
  {
    key: 'careDelivery',
    items: [
      {
        key: 'caregivers',
        label: 'centerManager.caregivers',
        to: '/center-manager/caregivers',
        icon: 'medical_services'
      },
      {
        key: 'services',
        label: 'centerManager.serviceMenu',
        to: '/center-manager/services',
        icon: 'medical_information'
      },
      {
        key: 'workShifts',
        label: 'centerManager.provider.shiftsTitle',
        to: '/center-manager/work-shifts',
        icon: 'work_history'
      },
      {
        key: 'schedules',
        label: 'centerManager.schedules.title',
        to: '/center-manager/schedules',
        icon: 'event_available'
      }
    ]
  },
  {
    key: 'coordination',
    items: [
      { key: 'bookings', label: 'centerManager.bookings', to: '/center-manager/bookings', icon: 'calendar_month' },
      { key: 'feedback', label: 'centerManager.feedback', icon: 'reviews' }
    ]
  }
] as const

export type ManagerNavigationGroup = (typeof managerNavigation)[number]
export type ManagerNavigationItem = ManagerNavigationGroup['items'][number]

export function isActiveManagerItem(item: ManagerNavigationItem, pathname: string) {
  return 'to' in item && (pathname === item.to || pathname.startsWith(`${item.to}/`))
}
