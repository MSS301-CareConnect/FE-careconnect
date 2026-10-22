import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCOwlf-ropD0XzVPucNjZeyxWfHNYpZLLHO2tA1QIuWfZ33VlxhbzZTIB1YcbZ-rwHFz13i956cRk1gpsZ5cVjIOynvR4Gd4LbdRVa3Ef_NT-ET7V8rZN8V8yMzP5Cg8PfibQW0z9t2RpWlbRfADs2Dkv0NrgxUMMGgnfxRundX7EQUrkPQPXvOi09tDoRqfnJqaCo_VxeS0EBCgou4W0BpxNDZYLe95AOHSs04kmU1O5nEy0vYKnKE8A'

export function CustomerHeader() {
  const authUser = useAuthUser()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!accountMenuOpen) return
    function closeOnOutsideClick(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
        accountButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountMenuOpen])

  return (
    <header className='fixed top-0 left-0 z-50 w-full bg-surface-container-lowest/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl'>
      <div className='mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6'>
        <div className='flex items-center gap-6'>
          <Link to='/customer' className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm'>
              <Icon name='health_and_safety' className='text-2xl' />
            </div>
            <span className='text-xl font-bold tracking-tight text-primary'>{t('common.brand')}</span>
          </Link>

          <nav className='hidden items-center gap-1 lg:flex'>
            <NavLink
              to='/customer'
              end
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary-container font-semibold text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {t('customer.nav.home')}
            </NavLink>
            <NavLink
              to='/customer/caregivers'
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary-container font-semibold text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {t('customer.nav.findCaregivers')}
            </NavLink>
            <NavLink
              to='/customer/bookings'
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary-container font-semibold text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {t('customer.nav.myBookings')}
            </NavLink>
            <NavLink
              to='/customer/messages'
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-secondary-container font-semibold text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {t('customer.nav.messages')}
            </NavLink>
          </nav>
        </div>

        <div className='flex items-center gap-3'>
          <button
            type='button'
            aria-label={t('customer.nav.menu')}
            aria-expanded={mobileMenuOpen}
            aria-controls='customer-mobile-menu'
            onClick={() => setMobileMenuOpen((open) => !open)}
            className='rounded-lg p-2 text-on-surface-variant hover:bg-surface-container lg:hidden'
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
          </button>
          <LanguageSwitch />

          <button
            type='button'
            aria-label={t('customer.nav.notifications')}
            className='relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface'
          >
            <Icon name='notifications' />
            <span className='absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest' />
          </button>

          <div className='relative' ref={accountMenuRef}>
            <button
              ref={accountButtonRef}
              aria-controls='customer-account-menu'
              aria-expanded={accountMenuOpen}
              aria-haspopup='true'
              aria-label={t('customer.nav.accountMenu')}
              className='flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => setAccountMenuOpen((open) => !open)}
              type='button'
            >
              <img
                src={AVATAR_URL}
                alt=''
                className='h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 transition-all hover:ring-primary'
              />
              <span className='hidden text-left sm:flex sm:flex-col'>
                <span className='text-xs font-semibold leading-tight text-on-surface'>
                  {authUser?.fullName || authUser?.email || t('customer.nav.userName')}
                </span>
                <span className='text-[11px] leading-tight text-on-surface-variant'>
                  {t('customer.nav.customerRole')}
                </span>
              </span>
              <Icon name='expand_more' className='hidden text-base text-on-surface-variant sm:block' />
            </button>
            {accountMenuOpen && (
              <nav
                aria-label={t('customer.nav.accountMenu')}
                className='absolute top-full right-0 z-10 mt-2 w-52 rounded-xl border border-outline-variant/40 bg-white p-2 shadow-lg'
                id='customer-account-menu'
              >
                <Link
                  className='block rounded-lg px-3 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary'
                  onClick={() => setAccountMenuOpen(false)}
                  to='/customer/my-profile'
                >
                  {t('customer.nav.myProfile')}
                </Link>
                <Link
                  className='block rounded-lg px-3 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary'
                  onClick={() => setAccountMenuOpen(false)}
                  to='/customer/patient-profiles'
                >
                  {t('customer.nav.familyProfiles')}
                </Link>
                <div className='my-1 border-t border-outline-variant/40' />
                <SignOutButton appearance='menu' />
              </nav>
            )}
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav
          id='customer-mobile-menu'
          aria-label={t('customer.nav.menu')}
          className='border-t border-slate-100 bg-white px-4 py-3 shadow-lg lg:hidden'
        >
          {[
            { to: '/customer', label: t('customer.nav.home') },
            { to: '/customer/caregivers', label: t('customer.nav.findCaregivers') },
            { to: '/customer/bookings', label: t('customer.nav.myBookings') },
            { to: '/customer/messages', label: t('customer.nav.messages') }
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/customer'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm font-medium ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
