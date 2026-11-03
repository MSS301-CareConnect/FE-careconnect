import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { NotificationBell } from '~/entities/notification/notification-bell'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { usePendingInvitations } from '../account-shell'
import { useBookingsAttention } from '../hooks/use-bookings-attention'
import { CenterChip } from './center-chip'

const menuItem =
  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'

/**
 * 64 px sticky header: logo · main navigation · "Book care" + center + notifications + account. Phones get a
 * compact header and the bottom navigation (`CustomerBottomNav`).
 */
export function CustomerHeader() {
  const { t } = useTranslation()
  const authUser = useAuthUser()
  const isCustomer = Boolean(authUser?.status === 'ACTIVE' && authUser.roles?.includes('CUSTOMER'))
  const homePath = isCustomer ? '/customer' : '/'
  const attention = useBookingsAttention(isCustomer)
  const pendingInvitations = usePendingInvitations(isCustomer).data?.length ?? 0
  const navigation = [
    { to: homePath, label: t('customer.nav.home'), end: true },
    { to: '/customer/caregivers', label: t('customer.nav.caregivers'), end: false },
    { to: '/customer/services', label: t('customer.nav.services'), end: false },
    { to: '/customer/centers', label: t('customer.nav.centers'), end: false },
    ...(isCustomer ? [{ to: '/customer/bookings', label: t('customer.nav.bookings'), end: false }] : [])
  ]
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const displayName = authUser?.fullName || authUser?.email || t('customer.nav.userName')

  useEffect(() => {
    if (!menuOpen) return
    function onPointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className='sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest/85 backdrop-blur-md'>
      <div className='mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-4 sm:px-6'>
        <Link
          className='inline-flex shrink-0 items-center gap-2 rounded-lg text-lg font-bold text-primary focus-visible:outline-2 focus-visible:outline-primary'
          to={homePath}
        >
          <span aria-hidden='true' className='grid h-8 w-8 place-items-center rounded-lg bg-primary text-on-primary'>
            <Icon className='text-xl' name='volunteer_activism' />
          </span>
          <span className='max-sm:sr-only'>{t('common.brand')}</span>
        </Link>

        <nav aria-label={t('customer.nav.mainNav')} className='mx-auto hidden h-full items-stretch gap-1 lg:flex'>
          {navigation.map(({ to, label, end }) => (
            <NavLink
              className={({ isActive }) =>
                `group relative inline-flex items-center gap-1.5 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary ${isActive ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant hover:text-on-surface'}`
              }
              end={end}
              key={to}
              to={to}
            >
              {({ isActive }) => (
                <>
                  {label}
                  {to === '/customer/bookings' && attention > 0 ? (
                    <span
                      aria-label={t('customer.nav.bookingsAttention', { count: attention })}
                      className='grid h-5 min-w-5 place-items-center rounded-full bg-warning px-1 text-[11px] font-semibold text-white tabular-nums'
                    >
                      {attention}
                    </span>
                  ) : null}
                  <span
                    aria-hidden='true'
                    className={`absolute right-3 bottom-0 left-3 h-0.5 origin-center rounded-full bg-primary transition-transform duration-200 ease-[var(--ease-out-soft)] ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className='ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0'>
          {isCustomer ? (
            <>
              <Link
                className='hidden min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary shadow-[var(--shadow-card)] transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex'
                to='/customer/booking'
              >
                <Icon className='text-lg' name='add' />
                {t('customer.nav.book')}
              </Link>
              <CenterChip />
              <NotificationBell
                pinned={
                  pendingInvitations > 0
                    ? (close) => (
                        <Link
                          className='mb-1 flex items-center gap-3 rounded-xl bg-info-container px-3 py-2.5 text-sm text-on-info-container hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary'
                          onClick={close}
                          to='/customer/invitations'
                        >
                          <Icon className='text-xl' name='mail' />
                          <span className='min-w-0 flex-1 font-medium'>
                            {t('customer.accountArea.invitationsNotice', { count: pendingInvitations })}
                          </span>
                          <Icon className='text-lg' name='chevron_right' />
                        </Link>
                      )
                    : undefined
                }
                pinnedCount={pendingInvitations}
              />
              <div className='relative' ref={menuRef}>
                <button
                  aria-controls='customer-account-menu'
                  aria-expanded={menuOpen}
                  aria-haspopup='true'
                  aria-label={t('customer.nav.accountMenu')}
                  className='grid h-10 w-10 place-items-center rounded-full transition-shadow hover:ring-4 hover:ring-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  onClick={() => setMenuOpen((open) => !open)}
                  ref={buttonRef}
                  type='button'
                >
                  <Avatar className='h-9 w-9 rounded-full' decorative name={displayName} />
                </button>
                {menuOpen ? (
                  <div
                    className='cc-scale-in absolute top-full right-0 z-10 mt-2 w-64 origin-top-right rounded-2xl border border-outline-variant bg-surface-container-lowest p-2 shadow-[var(--shadow-raised)]'
                    id='customer-account-menu'
                  >
                    <div className='flex items-center gap-3 px-3 py-2'>
                      <Avatar className='h-10 w-10 rounded-full' decorative name={displayName} />
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-on-surface'>{displayName}</p>
                        {authUser?.email ? (
                          <p className='truncate text-xs text-on-surface-variant'>{authUser.email}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className='my-1 border-t border-outline-variant' />
                    <nav aria-label={t('customer.nav.accountMenu')} className='flex flex-col'>
                      {[
                        { to: '/customer/my-profile', icon: 'person', label: t('customer.nav.account') },
                        { to: '/customer/patient-profiles', icon: 'group', label: t('customer.nav.relatives') },
                        { to: '/customer/payments', icon: 'payments', label: t('customer.nav.payments') },
                        { to: '/customer/invitations', icon: 'mail', label: t('customer.nav.invitations') }
                      ].map((item) => (
                        <Link className={menuItem} key={item.to} onClick={() => setMenuOpen(false)} to={item.to}>
                          <Icon className='text-xl text-on-surface-variant' name={item.icon} />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                    <div className='my-1 border-t border-outline-variant' />
                    <div className='flex items-center justify-between gap-2 px-3 py-1.5'>
                      <span className='text-sm text-on-surface-variant'>{t('customer.nav.language')}</span>
                      <LanguageSwitch />
                    </div>
                    <div className='my-1 border-t border-outline-variant' />
                    <SignOutButton appearance='menu' />
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              {/* The center directory is public, so visitors see and switch the center scope too (phones use the
                  Centers tab of the bottom navigation to keep the header to one row). */}
              <div className='hidden sm:block'>
                <CenterChip />
              </div>
              <LanguageSwitch />
              <Link
                className='inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to='/login'
              >
                {t('home.signIn')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
