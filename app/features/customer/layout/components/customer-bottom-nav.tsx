import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useScrollTopOnSamePage } from '~/shared/lib/use-scroll-top-on-same-page'
import { Icon } from '~/shared/ui/icon'

const spring = { type: 'spring' as const, stiffness: 420, damping: 34 }

/**
 * Phone navigation (below `lg`) as a floating pill ("Soft Bento", 2026-11-09): the current page sits on a mint pill that
 * slides between items, and a customer's "Book care" is a raised forest circle in the middle. Home · Search · Book ·
 * Bookings · Account for customers, Home · Search · Services · Centers for visitors (customers reach centers from the
 * header center menu). Every item stays ≥ 44 px tall.
 */
export function CustomerBottomNav() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const isCustomer = Boolean(authUser?.status === 'ACTIVE' && authUser.roles?.includes('CUSTOMER'))
  const toTopIfOpen = useScrollTopOnSamePage()
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
      className='fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 lg:hidden'
    >
      <ul className='mx-auto flex h-16 max-w-md items-center justify-around rounded-[2rem] border border-white/80 bg-white/95 px-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl'>
        {items.map((item) => (
          <li className='flex flex-1 justify-center' key={item.to}>
            <NavLink
              className='group relative flex min-h-12 w-full flex-col items-center justify-center rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
              end={item.end}
              onClick={toTopIfOpen(item.to)}
              to={item.to}
            >
              {({ isActive }) =>
                'primary' in item && item.primary ? (
                  <>
                    <motion.span
                      className='-mt-9 grid h-[3.75rem] w-[3.75rem] place-items-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 text-white shadow-[0_14px_28px_-10px_rgb(12_43_37/0.7)] ring-[5px] ring-white'
                      transition={spring}
                      whileTap={{ scale: 0.92 }}
                    >
                      <Icon
                        className={`text-3xl transition-transform duration-300 ${isActive ? 'rotate-45' : ''}`}
                        name='add'
                      />
                    </motion.span>
                    <span
                      className={`mt-0.5 text-[11px] font-semibold ${isActive ? 'text-forest-900' : 'text-forest-800/60'}`}
                    >
                      {item.label}
                    </span>
                  </>
                ) : (
                  <>
                    {isActive ? (
                      <motion.span
                        aria-hidden='true'
                        className='absolute inset-x-0.5 inset-y-1 rounded-3xl bg-mint-100'
                        layoutId='customer-bottom-active'
                        transition={spring}
                      />
                    ) : null}
                    <Icon
                      className={`relative text-[22px] transition-colors ${isActive ? 'text-forest-900' : 'text-forest-800/55 group-hover:text-forest-900'}`}
                      filled={isActive}
                      name={item.icon}
                    />
                    <span
                      className={`relative text-[11px] transition-colors ${isActive ? 'font-bold text-forest-900' : 'font-medium text-forest-800/60'}`}
                    >
                      {item.label}
                    </span>
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
