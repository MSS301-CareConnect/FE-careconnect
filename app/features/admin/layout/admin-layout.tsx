import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'

const menu = [
  { key: 'dashboard', to: '/admin/dashboard', icon: 'dashboard' },
  { key: 'customers', to: '/admin/customers', icon: 'groups' },
  { key: 'caregivers', icon: 'medical_services' },
  { key: 'centers', to: '/admin/centers', icon: 'apartment' },
  { key: 'bookings', icon: 'calendar_month' },
  { key: 'services', to: '/admin/services', icon: 'medical_information' },
  { key: 'revenue', to: '/admin/revenue', icon: 'payments' },
  { key: 'quality', to: '/admin/quality', icon: 'verified' },
  { key: 'reviewsComplaints', to: '/admin/reviews-complaints', icon: 'forum' },
  { key: 'policies', to: '/admin/policies', icon: 'policy' }
] as const

export function AdminLayout() {
  const authUser = useAuthUser()
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const carouselRef = useRef<HTMLElement>(null)
  const [carouselEdges, setCarouselEdges] = useState({ start: true, end: false })
  function syncCarouselEdges() {
    const carousel = carouselRef.current
    if (!carousel) return
    setCarouselEdges({
      start: carousel.scrollLeft <= 1,
      end: carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1
    })
  }
  function moveCarousel(direction: -1 | 1) {
    const carousel = carouselRef.current
    if (!carousel) return
    carousel.scrollBy({ left: direction * Math.max(240, carousel.clientWidth * 0.75), behavior: 'smooth' })
  }
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const active = carousel.querySelector<HTMLElement>('[aria-current="page"]')
    if (active) carousel.scrollLeft = active.offsetLeft - (carousel.clientWidth - active.clientWidth) / 2
    syncCarouselEdges()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(syncCarouselEdges)
    observer.observe(carousel)
    return () => observer.disconnect()
  }, [location.pathname, t])
  const navigation = menu.map((item) => {
    const active = 'to' in item && location.pathname.startsWith(item.to)
    const className = `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low'}`
    return 'to' in item ? (
      <Link
        aria-current={active ? 'page' : undefined}
        className={className}
        key={item.key}
        onClick={() => setOpen(false)}
        to={item.to}
      >
        <Icon className='text-base' name={item.icon} />
        {t(`admin.${item.key}`)}
      </Link>
    ) : (
      <button
        className={`${className} cursor-not-allowed opacity-55`}
        disabled
        key={item.key}
        title={t('admin.unavailable')}
        type='button'
      >
        <Icon className='text-base' name={item.icon} />
        {t(`admin.${item.key}`)}
      </button>
    )
  })
  return (
    <div className='flex min-h-screen flex-col bg-surface text-on-surface'>
      <header className='sticky top-0 z-40 border-b border-outline-variant/25 bg-white/95 shadow-sm backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6'>
          <Link className='flex shrink-0 items-center gap-2' to='/admin/dashboard'>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white'>
              <Icon name='volunteer_activism' />
            </span>
            <strong className='text-sm tracking-tight'>{t('common.brand')}</strong>
            <span className='rounded bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-primary'>
              {t('admin.role')}
            </span>
          </Link>
          <div className='hidden min-w-0 flex-1 items-center gap-1 xl:flex'>
            <button
              aria-label={t('admin.previousMenu')}
              className='flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30'
              disabled={carouselEdges.start}
              onClick={() => moveCarousel(-1)}
              type='button'
            >
              <Icon name='chevron_left' />
            </button>
            <nav
              aria-label={t('admin.menu')}
              className='relative flex min-w-0 flex-1 items-center gap-1 overflow-x-hidden whitespace-nowrap scroll-smooth'
              onScroll={syncCarouselEdges}
              ref={carouselRef}
            >
              {navigation}
            </nav>
            <button
              aria-label={t('admin.nextMenu')}
              className='flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30'
              disabled={carouselEdges.end}
              onClick={() => moveCarousel(1)}
              type='button'
            >
              <Icon name='chevron_right' />
            </button>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <SignOutButton />
            <div className='[&_button]:px-2'>
              <LanguageSwitch />
            </div>
            <button
              aria-label={t('admin.notifications')}
              className='relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant disabled:cursor-not-allowed'
              disabled
              title={t('admin.unavailable')}
              type='button'
            >
              <Icon name='notifications' />
              <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-error' />
            </button>
            <div className='hidden items-center gap-2 border-l border-outline-variant/30 pl-3 sm:flex'>
              <span
                aria-hidden='true'
                className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white'
              >
                {t('admin.managerShort')}
              </span>
              <span className='hidden text-xs lg:block'>
                <strong className='block'>{authUser?.fullName || authUser?.email || t('admin.manager')}</strong>
                <span className='text-outline'>{t('admin.role')}</span>
              </span>
            </div>
            <button
              aria-controls='admin-mobile-menu'
              aria-expanded={open}
              aria-label={t(open ? 'admin.closeMenu' : 'admin.openMenu')}
              className='flex h-10 w-10 items-center justify-center xl:hidden'
              onClick={() => setOpen(!open)}
              type='button'
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        {open && (
          <nav
            aria-label={t('admin.menu')}
            className='grid max-h-[70vh] gap-1 overflow-y-auto border-t border-outline-variant/25 px-4 py-3 sm:grid-cols-2 xl:hidden'
            id='admin-mobile-menu'
          >
            {navigation}
          </nav>
        )}
      </header>
      <main className='w-full flex-1'>
        <Outlet />
      </main>
      <footer className='border-t border-outline-variant/20 bg-white px-6 py-5 text-center text-xs text-outline'>
        {t('admin.footer')}
      </footer>
    </div>
  )
}
