/**
 * Admin sidebar items grouped by area. A labelled group is a parent section with its own icon: it opens and closes in
 * the expanded sidebar and becomes one icon with a flyout when the sidebar is collapsed (2026-11-09).
 * Every item opens a live screen (Đợt 5). Revenue and quality previews stay routable but are left out of the menu
 * until their backend exists (D26); booking policies are live (spec §8).
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
    icon: 'settings_suggest',
    items: [
      { key: 'services', to: '/admin/services', icon: 'medical_information' },
      { key: 'centers', to: '/admin/centers', icon: 'apartment' },
      { key: 'bookings', to: '/admin/bookings', icon: 'calendar_month' },
      { key: 'caregivers', to: '/admin/caregivers', icon: 'medical_services' },
      // Step 5 of the certificate review, with the AI risk of each certificate (2026-11-09).
      { key: 'certificates', to: '/admin/certificates', icon: 'workspace_premium' },
      // Caregivers who missed paid visits, platform-wide; centers conclude each one (2026-11-10).
      { key: 'caregiverAbsences', to: '/admin/caregiver-absences', icon: 'person_off' },
      { key: 'policies', to: '/admin/policies', icon: 'rule' }
    ]
  },
  {
    key: 'finance',
    labelled: true,
    icon: 'account_balance',
    items: [
      { key: 'revenue', to: '/admin/revenue', icon: 'monitoring' },
      { key: 'withdrawals', to: '/admin/withdrawals', icon: 'payments' }
    ]
  },
  {
    key: 'customerCare',
    labelled: true,
    icon: 'support_agent',
    items: [
      // 2026-11-10: "Khách hàng" and "Tài khoản" opened the same Identity list — one "Tài khoản" item lives here now
      // (/admin/customers still redirects to the list filtered to CUSTOMER).
      { key: 'accounts', to: '/admin/accounts', icon: 'manage_accounts' },
      { key: 'reviewsComplaints', to: '/admin/reviews-complaints', icon: 'forum' }
    ]
  },
  {
    key: 'system',
    labelled: true,
    icon: 'shield_person',
    items: [
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
