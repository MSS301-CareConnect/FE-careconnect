import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { adminNavigation, isActiveItem } from '../admin-navigation.constants'

export const ADMIN_SIDEBAR_ID = 'admin-sidebar'

type AdminSidebarProps = {
  open: boolean
  onClose: () => void
}

/** Fixed on desktop; below `lg` the same navigation slides in as a drawer. */
export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const itemClass =
    'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

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
        id={ADMIN_SIDEBAR_ID}
      >
        <div className='flex h-16 shrink-0 items-center justify-between gap-2 border-b border-outline-variant/25 px-5'>
          <Link className='flex min-w-0 items-center gap-2' onClick={onClose} to='/admin/dashboard'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
              <Icon name='volunteer_activism' />
            </span>
            <strong className='truncate text-sm tracking-tight'>{t('common.brand')}</strong>
            <span className='rounded bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-primary'>
              {t('admin.role')}
            </span>
          </Link>
          <button
            aria-label={t('admin.closeMenu')}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden'
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <nav aria-label={t('admin.menu')} className='flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4'>
          {adminNavigation.map((group) => (
            <div key={group.key}>
              {group.labelled ? (
                <p
                  className='px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-outline'
                  id={`admin-nav-${group.key}`}
                >
                  {t(`admin.groups.${group.key}`)}
                </p>
              ) : null}
              <ul aria-labelledby={group.labelled ? `admin-nav-${group.key}` : undefined} className='space-y-0.5'>
                {group.items.map((item) => {
                  const active = isActiveItem(item, pathname)
                  return (
                    <li key={item.key}>
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={`${itemClass} ${active ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
                        onClick={onClose}
                        to={item.to}
                      >
                        <Icon className='text-xl' name={item.icon} />
                        <span className='truncate'>{t(`admin.${item.key}`)}</span>
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
