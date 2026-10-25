import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

export function CustomerHeader() {
  const authUser = useAuthUser()
  const isCustomer = authUser?.status === 'ACTIVE' && authUser.roles?.includes('CUSTOMER')
  const homePath = isCustomer ? '/customer' : '/'
  const navigation = [
    { to: homePath, label: 'customer.nav.home', end: true },
    { to: '/customer/caregivers', label: 'customer.nav.findCaregivers', end: false },
    { to: '/customer/services', label: 'customer.nav.services', end: false },
    ...(isCustomer ? [{ to: '/customer/bookings', label: 'customer.nav.myBookings', end: false } as const] : [])
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
    <header className='relative z-50 border-b border-[#dfe6dc] bg-[#f7f8f5] text-[#1b2922]'>
      <div className='mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12'>
        <div className='flex min-h-20 items-center justify-between gap-3'>
          <Link
            className='inline-flex shrink-0 items-center gap-2.5 text-xl font-extrabold tracking-[-0.06em] text-[#075b31]'
            to={homePath}
          >
            <span aria-hidden='true' className='grid h-9 w-9 place-items-center rounded-lg bg-[#075b31] text-white'>
              <Icon className='text-[22px]' name='volunteer_activism' />
            </span>
            {t('common.brand')}
          </Link>

          <nav
            aria-label={t('home.navigation')}
            className='hidden items-center gap-3 whitespace-nowrap text-sm font-semibold lg:flex xl:gap-5'
          >
            {navigation.map(({ to, label, end }) => (
              <NavLink
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center border-b-2 pt-0.5 transition-colors ${isActive ? 'border-[#075b31] text-[#075b31]' : 'border-transparent text-[#44594b] hover:text-[#075b31]'}`
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
                <button
                  aria-label={t('customer.nav.notifications')}
                  className='hidden h-11 w-11 place-items-center rounded-lg text-[#44594b] hover:bg-[#eaf2e9] sm:grid'
                  type='button'
                >
                  <Icon name='notifications' />
                </button>
                <div className='relative' ref={accountMenuRef}>
                  <button
                    aria-controls='customer-account-menu'
                    aria-expanded={accountMenuOpen}
                    aria-haspopup='true'
                    aria-label={t('customer.nav.accountMenu')}
                    className='flex min-h-11 items-center gap-2 rounded-lg px-1 text-[#1b2922] hover:bg-[#eaf2e9] focus-visible:outline-2 focus-visible:outline-[#075b31]'
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    ref={accountButtonRef}
                    type='button'
                  >
                    <span
                      aria-hidden='true'
                      className='grid h-9 w-9 place-items-center rounded-full bg-[#075b31] text-sm font-bold text-white'
                    >
                      {displayName.trim().charAt(0).toLocaleUpperCase()}
                    </span>
                    <span className='hidden max-w-28 flex-col text-left xl:flex'>
                      <span className='truncate text-xs font-bold leading-tight'>{displayName}</span>
                      <span className='text-[11px] leading-tight text-[#617367]'>{t('customer.nav.customerRole')}</span>
                    </span>
                    <Icon className='hidden text-base text-[#44594b] sm:block' name='expand_more' />
                  </button>
                  {accountMenuOpen && (
                    <nav
                      aria-label={t('customer.nav.accountMenu')}
                      className='absolute top-full right-0 z-10 mt-2 w-52 rounded-xl border border-[#dfe6dc] bg-white p-2 shadow-lg'
                      id='customer-account-menu'
                    >
                      <Link
                        className='block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1b2922] hover:bg-[#eaf2e9]'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/my-profile'
                      >
                        {t('customer.nav.myProfile')}
                      </Link>
                      <Link
                        className='block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1b2922] hover:bg-[#eaf2e9]'
                        onClick={() => setAccountMenuOpen(false)}
                        to='/customer/patient-profiles'
                      >
                        {t('customer.nav.familyProfiles')}
                      </Link>
                      <div className='my-1 border-t border-[#dfe6dc]' />
                      <SignOutButton appearance='menu' />
                    </nav>
                  )}
                </div>
              </>
            ) : (
              <Link
                className='inline-flex min-h-11 items-center rounded-lg border border-[#b9c9bb] px-4 text-sm font-bold text-[#075b31] hover:bg-[#eaf2e9]'
                to='/login'
              >
                {t('home.signIn')}
              </Link>
            )}
            <button
              aria-controls='customer-mobile-menu'
              aria-expanded={mobileMenuOpen}
              aria-label={t('customer.nav.menu')}
              className='grid h-11 w-11 place-items-center rounded-lg text-[#44594b] hover:bg-[#eaf2e9] lg:hidden'
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
          className='border-t border-[#dfe6dc] bg-[#f7f8f5] px-5 py-3 sm:px-8 lg:hidden'
          id='customer-mobile-menu'
        >
          <div className='mx-auto flex max-w-[1344px] flex-col'>
            {navigation.map(({ to, label, end }) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-sm font-semibold ${isActive ? 'bg-[#eaf2e9] text-[#075b31]' : 'text-[#44594b] hover:bg-[#eaf2e9]'}`
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
