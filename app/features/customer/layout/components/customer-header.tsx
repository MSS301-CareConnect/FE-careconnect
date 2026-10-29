import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { Icon } from '~/shared/ui/icon'
import { NotificationBell } from '~/entities/notification/notification-bell'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { CenterSelector } from './center-selector'

export function CustomerHeader() {
  const authUser = useAuthUser()
  const isCustomer = authUser?.status === 'ACTIVE' && authUser.roles?.includes('CUSTOMER')
  const homePath = isCustomer ? '/customer' : '/'
  const navigation = [
    { to: homePath, label: 'customer.nav.home', end: true },
    { to: '/customer/caregivers', label: 'customer.nav.findCaregivers', end: false },
    { to: '/customer/services', label: 'customer.nav.services', end: false }
  ] as const
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)
  const displayName = authUser?.fullName || authUser?.email || t('customer.nav.userName')

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
    <header className='sticky top-0 z-50 border-b border-outline-variant/60 bg-surface/95 text-on-surface backdrop-blur-md'>
      <div className='mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12'>
        <div className='flex min-h-20 items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3 sm:gap-4 xl:gap-5'>
            <Link
              className='inline-flex shrink-0 items-center gap-2.5 text-xl font-extrabold tracking-[-0.06em] text-primary'
              to={homePath}
            >
              <span
                aria-hidden='true'
                className='grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary shadow-xs'
              >
                <Icon className='text-[22px]' name='volunteer_activism' />
              </span>
              <span className='max-sm:sr-only'>{t('common.brand')}</span>
            </Link>
            <CenterSelector />
          </div>

          <nav
            aria-label={t('home.navigation')}
            className='hidden items-center gap-3 whitespace-nowrap text-sm font-semibold lg:flex xl:gap-5'
          >
            {navigation.map(({ to, label, end }) => (
              <NavLink
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center border-b-2 pt-0.5 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`
                }
                end={end}
                key={to}
                to={to}
              >
                {t(label)}
              </NavLink>
            ))}
          </nav>

          <div className='flex shrink-0 items-center gap-2 sm:gap-3'>
            <div className='hidden sm:block'>
              <LanguageSwitch />
            </div>
            {isCustomer ? (
              <>
                <NotificationBell />
                <div className='relative' ref={accountMenuRef}>
                  <button
                    aria-controls='customer-account-menu'
                    aria-expanded={accountMenuOpen}
                    aria-haspopup='true'
                    aria-label={t('customer.nav.accountMenu')}
                    className='flex min-h-11 items-center gap-2 rounded-xl px-1.5 text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    ref={accountButtonRef}
                    type='button'
                  >
                    <span
                      aria-hidden='true'
                      className='grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-on-primary shadow-xs'
                    >
                      {displayName.trim().charAt(0).toLocaleUpperCase()}
                    </span>
                    <span className='hidden max-w-28 flex-col text-left xl:flex'>
                      <span className='truncate text-xs font-bold leading-tight text-on-surface'>{displayName}</span>
                      <span className='text-[11px] leading-tight text-on-surface-variant'>
                        {t('customer.nav.customerRole')}
                      </span>
                    </span>
                    <Icon className='hidden text-base text-on-surface-variant sm:block' name='expand_more' />
                  </button>
                  {accountMenuOpen && (
                    <nav
                      aria-label={t('customer.nav.accountMenu')}
                      className='absolute top-full right-0 z-10 mt-2 w-56 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-lg'
                      id='customer-account-menu'
                    >
                      <Link
                        className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/my-profile'
                      >
                        {t('customer.nav.myProfile')}
                      </Link>
                      <Link
                        className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/patient-profiles'
                      >
                        {t('customer.nav.familyProfiles')}
                      </Link>
                      <Link
                        className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/bookings'
                      >
                        {t('customer.nav.myBookings')}
                      </Link>
                      <Link
                        className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/payments'
                      >
                        {t('customer.nav.payments')}
                      </Link>
                      <Link
                        className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/invitations'
                      >
                        {t('customer.nav.invitations')}
                      </Link>
                      <Link
                        className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/account/security'
                      >
                        {t('auth.security.title')}
                      </Link>
                      <div className='my-1 border-t border-outline-variant/40' />
                      <SignOutButton appearance='menu' />
                    </nav>
                  )}
                </div>
              </>
            ) : (
              <Link
                className='inline-flex min-h-11 items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm font-bold text-primary transition-colors hover:bg-surface-container-low'
                to='/login'
              >
                {t('home.signIn')}
              </Link>
            )}
            <button
              aria-controls='customer-mobile-menu'
              aria-expanded={mobileMenuOpen}
              aria-label={t('customer.nav.menu')}
              className='grid h-11 w-11 place-items-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low lg:hidden'
              onClick={() => setMobileMenuOpen((open) => !open)}
              type='button'
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        <div className='pb-3 sm:hidden'>
          <LanguageSwitch />
        </div>
      </div>
      {mobileMenuOpen && (
        <nav
          aria-label={t('customer.nav.menu')}
          className='border-t border-outline-variant/60 bg-surface px-5 py-3 sm:px-8 lg:hidden'
          id='customer-mobile-menu'
        >
          <div className='mx-auto flex max-w-[1344px] flex-col gap-1'>
            {navigation.map(({ to, label, end }) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-primary-fixed/60 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`
                }
                end={end}
                key={to}
                onClick={() => setMobileMenuOpen(false)}
                to={to}
              >
                {t(label)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
