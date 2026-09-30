import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { CaregiverFooter } from './components/caregiver-footer'

const navigation = [
  { key: 'home', path: '/caregiver/dashboard' },
  { key: 'schedule', path: '/caregiver/schedule' },
  { key: 'shifts', path: '/caregiver/shifts' },
  { key: 'earnings', path: '/caregiver/dashboard#earnings' },
  { key: 'resources', path: '/caregiver/dashboard#tools' },
  { key: 'history', path: '/caregiver/history' },
  { key: 'profile', path: '/caregiver/profile' }
] as const

export function CaregiverLayout() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  function renderNavigation() {
    return (
      <>
        {navigation.map(({ key, path }) => (
          <Link
            aria-current={location.pathname + location.hash === path ? 'page' : undefined}
            className={`rounded-md px-2 py-3 text-sm font-semibold transition hover:bg-secondary-container hover:text-primary ${location.pathname + location.hash === path ? 'bg-secondary-container text-primary' : 'text-on-surface-variant'}`}
            key={key}
            onClick={() => setMenuOpen(false)}
            to={path}
          >
            {t(`caregiver.nav.${key}`)}
          </Link>
        ))}
      </>
    )
  }

  return (
    <div className='min-h-screen bg-surface text-on-surface'>
      <header className='fixed inset-x-0 top-0 z-40 border-b border-outline-variant/20 bg-white/95 backdrop-blur-md print:hidden'>
        <div className='mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-12'>
          <Link className='text-lg font-extrabold tracking-tight text-primary sm:text-2xl' to='/caregiver/dashboard'>
            {t('common.brand')}
          </Link>
          <nav aria-label={t('caregiver.nav.label')} className='hidden items-center gap-1 xl:flex'>
            {renderNavigation()}
          </nav>
          <div className='flex shrink-0 items-center gap-1.5 sm:gap-3'>
            <div className='[&_button]:px-2 sm:[&_button]:px-3'>
              <LanguageSwitch />
            </div>
            <Link
              aria-label={t('caregiver.nav.notifications')}
              className='relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:bg-secondary-container'
              to='/caregiver/dashboard#reminders'
            >
              <Icon name='notifications' />
              <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-error ring-2 ring-white' />
            </Link>
            <div className='hidden border-l border-outline-variant/30 pl-4 text-right sm:block xl:hidden'>
              <p className='text-sm font-bold'>{t('caregiver.identity.name')}</p>
              <p className='mt-0.5 text-xs text-outline'>{t('caregiver.identity.license')}</p>
            </div>
            <span className='hidden h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-primary ring-2 ring-white sm:flex'>
              <Icon name='clinical_notes' />
            </span>
            <button
              aria-controls='caregiver-mobile-menu'
              aria-expanded={menuOpen}
              aria-label={t(menuOpen ? 'caregiver.nav.close' : 'caregiver.nav.open')}
              className='flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary-container xl:hidden'
              onClick={() => setMenuOpen(!menuOpen)}
              type='button'
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            aria-label={t('caregiver.nav.label')}
            className='flex flex-col border-t border-outline-variant/20 px-6 py-3 xl:hidden'
            id='caregiver-mobile-menu'
          >
            {renderNavigation()}
          </nav>
        )}
      </header>
      <main className='pt-20 print:pt-0'>
        <Outlet />
      </main>
      <div className='print:hidden'>
        <CaregiverFooter />
      </div>
    </div>
  )
}
