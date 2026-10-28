/**
 * Admin sidebar items grouped by area; an item without `to` awaits its backend contract. Revenue, quality and
 * policy previews stay routable but are left out of the menu until their backend exists (D26).
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
      { key: 'bookings', icon: 'calendar_month' },
      { key: 'caregivers', icon: 'medical_services' }
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
      { key: 'roles', to: '/admin/roles', icon: 'admin_panel_settings' }
    ]
  }
] as const

export type AdminNavigationGroup = (typeof adminNavigation)[number]
export type AdminNavigationItem = AdminNavigationGroup['items'][number]

export function isActiveItem(item: AdminNavigationItem, pathname: string) {
  return 'to' in item && (pathname === item.to || pathname.startsWith(`${item.to}/`))
}
