import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { activeCaregiverNavigation, caregiverNavigation } from '../caregiver-navigation.constants'

/** Phone navigation: four tabs at the bottom, 56 px tall plus the iOS home-indicator area. */
export function CaregiverBottomNav({ toAccept }: { toAccept: number }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)
  const index = caregiverNavigation.findIndex((item) => item.key === active.key)

  return (
    <nav
      aria-label={t('caregiver.nav.mobileLabel')}
      className='cg-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur lg:hidden print:hidden'
    >
      <div className='relative mx-auto max-w-xl'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-0 left-0 h-0.5 w-1/4 transition-transform duration-200 ease-[var(--cg-ease)]'
          style={{ transform: `translateX(${index * 100}%)` }}
        >
          <span className='mx-auto block h-full w-10 rounded-b-full bg-primary' />
        </span>
        <ul className='grid h-16 grid-cols-4'>
          {caregiverNavigation.map((item) => {
            const current = active.key === item.key
            const badge = item.key === 'visits' && toAccept > 0 ? toAccept : 0
            return (
              <li key={item.key}>
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={`flex h-full min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary ${current ? 'text-primary' : 'text-on-surface-variant'}`}
                  to={item.to}
                >
                  <span
                    className={`relative grid h-8 w-14 place-items-center rounded-full transition-colors duration-200 ${current ? 'bg-brand-50' : ''}`}
                  >
                    <Icon
                      className={`text-[24px] ${current ? 'cg-bounce' : ''}`}
                      filled={current}
                      key={current ? 'on' : 'off'}
                      name={item.icon}
                    />
                    {badge ? (
                      <span
                        aria-label={t('caregiver.nav.toAccept', { count: badge })}
                        className='absolute -top-1 right-1 grid min-w-[18px] place-items-center rounded-full bg-warning px-1 text-[10px] leading-[18px] font-bold text-white tabular-nums ring-2 ring-surface-container-lowest'
                      >
                        {badge > 99 ? '99+' : badge}
                      </span>
                    ) : null}
                  </span>
                  <span className='max-w-full truncate px-1'>{t(`caregiver.nav.${item.key}`)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
