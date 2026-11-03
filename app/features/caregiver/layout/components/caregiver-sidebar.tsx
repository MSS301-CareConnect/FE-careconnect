import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { activeCaregiverNavigation, caregiverNavigation } from '../caregiver-navigation.constants'

export const CAREGIVER_SIDEBAR_ID = 'caregiver-sidebar'

/** Desktop (≥1024 px) navigation: 240 px wide, or a 72 px icon rail when collapsed. Phones use the bottom tab bar. */
export function CaregiverSidebar({
  collapsed,
  onToggle,
  toAccept,
  requests
}: {
  collapsed: boolean
  onToggle: () => void
  toAccept: number
  requests: number
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-outline-variant bg-surface-container-lowest transition-[width] duration-200 ease-[var(--cg-ease)] lg:flex print:hidden ${collapsed ? 'w-[72px]' : 'w-60'}`}
      id={CAREGIVER_SIDEBAR_ID}
    >
      <div className={`flex h-16 shrink-0 items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Link
          aria-label={t('common.brand')}
          className='flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-primary'
          to='/caregiver/today'
        >
          <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-on-primary'>
            <Icon className='text-xl' name='volunteer_activism' />
          </span>
          {collapsed ? null : (
            <span className='min-w-0 leading-tight'>
              <strong className='block truncate text-[15px] font-bold text-on-surface'>{t('common.brand')}</strong>
              <span className='block truncate text-xs text-on-surface-variant'>{t('caregiver.identity.role')}</span>
            </span>
          )}
        </Link>
      </div>
      <nav aria-label={t('caregiver.nav.label')} className='flex-1 overflow-y-auto px-3 py-3'>
        <ul className='space-y-1'>
          {caregiverNavigation.map((item) => {
            const current = active.key === item.key
            const badge = item.key === 'visits' ? toAccept : item.key === 'requests' ? requests : 0
            const badgeLabel =
              item.key === 'requests'
                ? t('caregiver.nav.requestsWaiting', { count: badge })
                : t('caregiver.nav.toAccept', { count: badge })
            const label = t(`caregiver.nav.${item.key}`)
            return (
              <li key={item.key}>
                <Link
                  aria-current={current ? 'page' : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={`cg-press relative flex min-h-11 items-center gap-3 rounded-lg text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary ${collapsed ? 'justify-center px-0' : 'px-3'} ${current ? 'bg-brand-50 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
                  title={collapsed ? label : undefined}
                  to={item.to}
                >
                  {current ? (
                    <span aria-hidden='true' className='absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-primary' />
                  ) : null}
                  <Icon className='text-[22px]' filled={current} name={item.icon} />
                  {collapsed ? null : <span className='flex-1 truncate'>{label}</span>}
                  {badge > 0 ? (
                    <span
                      aria-label={badgeLabel}
                      className={`grid min-w-5 place-items-center rounded-full bg-warning px-1.5 text-[11px] leading-5 font-bold text-white tabular-nums ${collapsed ? 'absolute top-1 right-2' : ''}`}
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className='border-t border-outline-variant p-3'>
        <button
          aria-controls={CAREGIVER_SIDEBAR_ID}
          aria-expanded={!collapsed}
          aria-label={t(collapsed ? 'caregiver.nav.expand' : 'caregiver.nav.collapse')}
          className={`cg-press flex min-h-11 w-full items-center gap-3 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary ${collapsed ? 'justify-center' : 'px-3'}`}
          onClick={onToggle}
          title={collapsed ? t('caregiver.nav.expand') : undefined}
          type='button'
        >
          <Icon className='text-[22px]' name={collapsed ? 'left_panel_open' : 'left_panel_close'} />
          {collapsed ? null : t('caregiver.nav.collapse')}
        </button>
      </div>
    </aside>
  )
}
