/**
 * Admin sidebar items grouped by area; every item opens a live screen (Đợt 5). Revenue and quality previews stay
 * routable but are left out of the menu until their backend exists (D26); booking policies are live (spec §8).
 */
export const adminNavigation = [
  {
    key: 'overview',
    // A one-item group needs no heading.
    labelled: false,
    items: [{ key: 'dashboard', to: '/admin/dashboard', icon: 'dashboard' }]
  },
  {
    key: 'operations',
    labelled: true,
    items: [
      { key: 'services', to: '/admin/services', icon: 'medical_information' },
      { key: 'centers', to: '/admin/centers', icon: 'apartment' },
      { key: 'bookings', to: '/admin/bookings', icon: 'calendar_month' },
      { key: 'caregivers', to: '/admin/caregivers', icon: 'medical_services' },
      // Step 5 of the certificate review, with the AI risk of each certificate (2026-11-09).
      { key: 'certificates', to: '/admin/certificates', icon: 'workspace_premium' },
      { key: 'policies', to: '/admin/policies', icon: 'rule' }
    ]
  },
  {
    key: 'finance',
    labelled: true,
    items: [
      { key: 'wallet', to: '/admin/wallet', icon: 'account_balance_wallet' },
      { key: 'withdrawals', to: '/admin/withdrawals', icon: 'payments' }
    ]
  },
  {
    key: 'customerCare',
    labelled: true,
    items: [
      { key: 'customers', to: '/admin/customers', icon: 'groups' },
      { key: 'reviewsComplaints', to: '/admin/reviews-complaints', icon: 'forum' }
    ]
  },
  {
    key: 'system',
    labelled: true,
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
