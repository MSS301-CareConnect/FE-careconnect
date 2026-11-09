import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { NotificationBell } from '~/entities/notification/notification-bell'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'
import { useScrollTopOnSamePage } from '~/shared/lib/use-scroll-top-on-same-page'

import { usePendingInvitations } from '../account-shell'
import { useBookingsAttention } from '../hooks/use-bookings-attention'
import { CenterChip } from './center-chip'

const menuItem =
  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'

/**
 * Header that morphs on scroll ("Soft Bento", 2026-11-09, after the owner's EXE / UML landing headers): at the top of
 * the page it is a wide transparent bar; once the page scrolls it slides into a narrower floating white pill with a
 * soft shadow and a reading-progress line, and it slides down on first load — logo · main navigation (the current page is a forest pill that slides between links) ·
 * "Book care" + center + notifications + account. Phones get a compact bar and the bottom navigation
 * (`CustomerBottomNav`).
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
  const { scrollY, scrollYProgress } = useScroll()
  const toTopIfOpen = useScrollTopOnSamePage()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

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
    <motion.header
      animate={{ y: 0, opacity: 1 }}
      className='sticky top-0 z-50 h-[4.75rem] px-2 [view-transition-name:cc-customer-header] sm:px-4'
      initial={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div
        className={`relative mx-auto flex w-full items-center gap-2 border transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] sm:gap-3 ${scrolled ? 'mt-2.5 h-16 max-w-[1180px] rounded-[2rem] border-white/80 bg-white/90 px-2 shadow-[var(--shadow-float)] backdrop-blur-xl sm:pr-2 sm:pl-3' : 'mt-0 h-[4.75rem] max-w-[1280px] rounded-none border-transparent bg-transparent px-2 sm:px-4'}`}
      >
        {/* Reading progress along the bottom of the floating bar (only once the page has scrolled). */}
        <motion.span
          aria-hidden='true'
          className={`pointer-events-none absolute right-8 -bottom-px left-8 h-0.5 origin-left rounded-full bg-gradient-to-r from-mint-400 via-forest-600 to-peach-300 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
          style={{ scaleX: scrollYProgress }}
        />
        <Link
          className='inline-flex shrink-0 items-center gap-2 rounded-full pr-2 text-lg font-bold tracking-tight text-forest-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
          onClick={toTopIfOpen(homePath)}
          to={homePath}
          viewTransition
        >
          <span
            aria-hidden='true'
            className={`grid place-items-center rounded-full bg-forest-900 text-mint-200 shadow-[var(--shadow-soft)] transition-all duration-500 ${scrolled ? 'h-10 w-10' : 'h-11 w-11'}`}
          >
            <Icon className='text-xl' name='volunteer_activism' />
          </span>
          <span className='max-sm:sr-only'>{t('common.brand')}</span>
        </Link>

        <nav aria-label={t('customer.nav.mainNav')} className='mx-auto hidden items-center gap-1 lg:flex'>
          {navigation.map(({ to, label, end }) => (
            <NavLink
              className={({ isActive }) =>
                `relative inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap xl:px-4 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${isActive ? 'text-white' : 'text-forest-800/75 hover:bg-white/80 hover:text-forest-950'}`
              }
              end={end}
              key={to}
              onClick={toTopIfOpen(to)}
              to={to}
              viewTransition
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      aria-hidden='true'
                      className='absolute inset-0 rounded-full bg-forest-900 shadow-[var(--shadow-soft)]'
                      layoutId='customer-nav-active'
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className='relative'>{label}</span>
                  {to === '/customer/bookings' && attention > 0 ? (
                    <span
                      aria-label={t('customer.nav.bookingsAttention', { count: attention })}
                      className='relative grid h-5 min-w-5 place-items-center rounded-full bg-peach-300 px-1 text-[11px] font-bold text-forest-950 tabular-nums'
                    >
                      {attention}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className='ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0'>
          {isCustomer ? (
            <>
              <Link
                className='hidden min-h-11 items-center gap-1.5 rounded-full bg-peach-300 px-4 whitespace-nowrap text-sm font-semibold text-forest-950 shadow-[0_10px_24px_-14px_rgb(246_146_95/0.9)] transition-[background-color,transform] hover:bg-peach-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 sm:inline-flex'
                to='/customer/booking'
              >
                <Icon className='text-lg' name='add' />
                {t('customer.nav.book')}
              </Link>
              <CenterChip />
              <NotificationBell
                portal='customer'
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
                  className='grid h-10 w-10 place-items-center rounded-full transition-shadow hover:ring-4 hover:ring-mint-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  onClick={() => setMenuOpen((open) => !open)}
                  ref={buttonRef}
                  type='button'
                >
                  <Avatar className='h-9 w-9 rounded-full' decorative name={displayName} />
                </button>
                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                      className='absolute top-full right-0 z-10 mt-3 w-64 origin-top-right rounded-3xl border border-white/70 bg-white/95 p-2 shadow-[var(--shadow-float)] backdrop-blur-xl'
                      exit={{ opacity: 0, scale: 0.96, y: -6, filter: 'blur(4px)' }}
                      id='customer-account-menu'
                      initial={{ opacity: 0, scale: 0.96, y: -6, filter: 'blur(4px)' }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
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
                          { to: '/customer/wallet', icon: 'account_balance_wallet', label: t('wallet.nav.customer') },
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
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
                className='inline-flex min-h-11 items-center gap-1.5 rounded-full bg-forest-900 px-5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-[background-color,transform] hover:bg-forest-800 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                to='/login'
              >
                {t('home.signIn')}
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
