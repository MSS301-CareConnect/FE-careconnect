import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { isActiveManagerItem, managerNavigation } from '../manager-navigation.constants'

export const MANAGER_SIDEBAR_ID = 'manager-sidebar'

export function ManagerSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const itemClass =
    'flex min-h-10 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

  return (
    <>
      {open ? (
        <div
          aria-hidden='true'
          className='fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-[1px] lg:hidden'
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/25 bg-white shadow-xl transition-[transform,visibility] duration-200 lg:z-30 lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : 'max-lg:invisible -translate-x-full'}`}
        id={MANAGER_SIDEBAR_ID}
      >
        <div className='flex h-16 shrink-0 items-center justify-between gap-2 border-b border-outline-variant/25 px-5'>
          <Link className='flex min-w-0 items-center gap-2' onClick={onClose} to='/center-manager/caregivers'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
              <Icon name='volunteer_activism' />
            </span>
            <span className='min-w-0 leading-tight'>
              <strong className='block truncate text-sm tracking-tight'>{t('common.brand')}</strong>
              <span className='block truncate text-[10px] font-bold uppercase tracking-wider text-primary'>
                {t('centerManager.role')}
              </span>
            </span>
          </Link>
          <button
            aria-label={t('centerManager.closeMenu')}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden'
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <nav
          aria-label={t('centerManager.menu')}
          className='flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4'
        >
          {managerNavigation.map((group) => (
            <div key={group.key}>
              <p
                className='px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-outline'
                id={`manager-nav-${group.key}`}
              >
                {t(`centerManager.groups.${group.key}`)}
              </p>
              <ul aria-labelledby={`manager-nav-${group.key}`} className='space-y-0.5'>
                {group.items.map((item) => {
                  const active = isActiveManagerItem(item, pathname)
                  return (
                    <li key={item.key}>
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={`${itemClass} ${active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
                        onClick={onClose}
                        to={item.to}
                      >
                        <Icon className='text-xl' name={item.icon} />
                        <span>{t(item.label)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
