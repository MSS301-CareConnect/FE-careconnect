/**
 * Admin sidebar items grouped by area; every item opens a live screen (Đợt 5). Revenue, quality and policy previews
 * stay routable but are left out of the menu until their backend exists (D26).
 */
export const adminNavigation = [
  {
    key: 'overview',
    items: [{ key: 'dashboard', to: '/admin/dashboard', icon: 'dashboard' }]
  },
  {
    key: 'operations',
    items: [
      { key: 'services', to: '/admin/services', icon: 'medical_information' },
      { key: 'centers', to: '/admin/centers', icon: 'apartment' },
      { key: 'bookings', to: '/admin/bookings', icon: 'calendar_month' },
      { key: 'caregivers', to: '/admin/caregivers', icon: 'medical_services' }
    ]
  },
  {
    key: 'customerCare',
    items: [
      { key: 'customers', to: '/admin/customers', icon: 'groups' },
      { key: 'reviewsComplaints', to: '/admin/reviews-complaints', icon: 'forum' }
    ]
  },
  {
    key: 'system',
    items: [
      { key: 'accounts', to: '/admin/accounts', icon: 'manage_accounts' },
      { key: 'roles', to: '/admin/roles', icon: 'admin_panel_settings' },
      { key: 'incidents', to: '/admin/incidents', icon: 'sync_problem' }
    ]
  }
] as const

export type AdminNavigationGroup = (typeof adminNavigation)[number]
export type AdminNavigationItem = AdminNavigationGroup['items'][number]

export function isActiveItem(item: AdminNavigationItem, pathname: string) {
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}
