import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

export function CenterManagerLayout() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigation = (
    <>
      <Link
        aria-current={location.pathname.startsWith('/center-manager/caregivers') ? 'page' : undefined}
        className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${location.pathname.startsWith('/center-manager/caregivers') ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
        onClick={() => setOpen(false)}
        to='/center-manager/caregivers'
      >
        {t('centerManager.caregivers')}
      </Link>
      <Link
        aria-current={location.pathname.startsWith('/center-manager/bookings') ? 'page' : undefined}
        className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${location.pathname.startsWith('/center-manager/bookings') ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
        onClick={() => setOpen(false)}
        to='/center-manager/bookings'
      >
        {t('centerManager.bookings')}
      </Link>
      <button
        className='cursor-not-allowed rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-on-surface-variant opacity-60'
        disabled
        title={t('centerManager.unavailable')}
        type='button'
      >
        {t('centerManager.feedback')}
      </button>
    </>
  )
  return (
    <div className='flex min-h-screen flex-col bg-surface text-on-surface'>
      <header className='sticky top-0 z-40 border-b border-outline-variant/20 bg-white shadow-sm'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6'>
          <Link className='flex shrink-0 flex-col leading-tight' to='/center-manager/caregivers'>
            <strong className='text-sm'>{t('common.brand')}</strong>
            <span className='text-[10px] font-bold uppercase tracking-[0.18em] text-primary'>
              {t('centerManager.role')}
            </span>
          </Link>
          <nav
            aria-label={t('centerManager.menu')}
            className='hidden items-center gap-1 rounded-xl bg-surface-container-low p-1 xl:flex'
          >
            {navigation}
          </nav>
          <div className='flex items-center gap-2'>
            <div className='[&_button]:px-2'>
              <LanguageSwitch />
            </div>
            <button
              aria-label={t('centerManager.notifications')}
              className='relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant disabled:cursor-not-allowed'
              disabled
              title={t('centerManager.unavailable')}
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
                {t('centerManager.managerShort')}
              </span>
              <div className='hidden text-xs md:block'>
                <strong className='block'>{t('centerManager.manager')}</strong>
                <span className='text-outline'>{t('centerManager.role')}</span>
              </div>
            </div>
            <button
              aria-controls='manager-mobile-menu'
              aria-expanded={open}
              aria-label={t(open ? 'centerManager.closeMenu' : 'centerManager.openMenu')}
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
            aria-label={t('centerManager.menu')}
            className='flex flex-col gap-1 border-t border-outline-variant/20 px-4 py-3 xl:hidden'
            id='manager-mobile-menu'
          >
            {navigation}
          </nav>
        )}
      </header>
      <main className='w-full flex-1'>
        <Outlet />
      </main>
      <footer className='border-t border-outline-variant/20 bg-white px-6 py-5 text-center text-xs text-outline'>
        {t('centerManager.footer')}
      </footer>
    </div>
  )
}
