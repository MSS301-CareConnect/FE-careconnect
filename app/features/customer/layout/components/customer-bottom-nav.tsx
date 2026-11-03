import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { Icon } from '~/shared/ui/icon'

/**
 * Phone navigation (below `lg`), each item ≥ 44 px tall: Home · Search · Book · Bookings · Account for customers, and
 * Home · Search · Services · Centers for visitors (customers reach centers from the header center menu).
 */
export function CustomerBottomNav() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const isCustomer = Boolean(authUser?.status === 'ACTIVE' && authUser.roles?.includes('CUSTOMER'))
  const items = isCustomer
    ? [
        { to: '/customer', icon: 'home', label: t('customer.nav.home'), end: true },
        { to: '/customer/caregivers', icon: 'search', label: t('customer.nav.search'), end: false },
        { to: '/customer/booking', icon: 'add', label: t('customer.nav.book'), end: false, primary: true },
        { to: '/customer/bookings', icon: 'event_note', label: t('customer.nav.bookings'), end: false },
        { to: '/customer/my-profile', icon: 'person', label: t('customer.nav.account'), end: false }
      ]
    : [
        { to: '/', icon: 'home', label: t('customer.nav.home'), end: true },
        { to: '/customer/caregivers', icon: 'search', label: t('customer.nav.search'), end: false },
        { to: '/customer/services', icon: 'medical_services', label: t('customer.nav.services'), end: false },
        { to: '/customer/centers', icon: 'home_health', label: t('customer.nav.centers'), end: false }
      ]

  return (
    <nav
      aria-label={t('customer.nav.bottomNav')}
      className='fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden'
    >
      <ul className='mx-auto flex max-w-lg items-stretch justify-around'>
        {items.map((item) => (
          <li className='flex-1' key={item.to}>
            <NavLink
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
              }
              end={item.end}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${'primary' in item && item.primary ? 'bg-primary text-on-primary' : isActive ? 'bg-brand-50' : ''}`}
                  >
                    <Icon className='text-[22px]' filled={isActive} name={item.icon} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
