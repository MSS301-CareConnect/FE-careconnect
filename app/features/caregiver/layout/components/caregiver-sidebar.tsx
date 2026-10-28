import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { activeCaregiverNavigation, caregiverNavigation } from '../caregiver-navigation.constants'

export const CAREGIVER_SIDEBAR_ID = 'caregiver-sidebar'

export function CaregiverSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)

  return (
    <>
      {open && (
        <div
          aria-hidden='true'
          className='fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-[1px] lg:hidden'
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/25 bg-white shadow-xl transition-[transform,visibility] duration-200 lg:z-30 lg:translate-x-0 lg:shadow-none print:hidden ${open ? 'translate-x-0' : 'max-lg:invisible -translate-x-full'}`}
        id={CAREGIVER_SIDEBAR_ID}
      >
        <div className='flex h-16 shrink-0 items-center justify-between gap-2 border-b border-outline-variant/25 px-5'>
          <Link className='flex min-w-0 items-center gap-2' onClick={onClose} to='/caregiver/visits'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
              <Icon name='volunteer_activism' />
            </span>
            <span className='min-w-0 leading-tight'>
              <strong className='block truncate text-sm tracking-tight'>{t('common.brand')}</strong>
              <span className='block truncate text-[10px] font-bold uppercase tracking-wider text-primary'>
                {t('caregiver.identity.role')}
              </span>
            </span>
          </Link>
          <button
            aria-label={t('caregiver.nav.close')}
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low lg:hidden'
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <nav aria-label={t('caregiver.nav.label')} className='flex-1 overflow-y-auto overscroll-contain px-3 py-4'>
          <ul className='space-y-0.5'>
            {caregiverNavigation.map((item) => (
              <li key={item.key}>
                <Link
                  aria-current={active.key === item.key ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active.key === item.key ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
                  onClick={onClose}
                  to={item.to}
                >
                  <Icon className='text-xl' name={item.icon} />
                  <span>{t(`caregiver.nav.${item.key}`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
