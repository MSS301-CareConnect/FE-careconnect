import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { activeCaregiverNavigation, caregiverNavigation } from '../caregiver-navigation.constants'

const spring = { type: 'spring' as const, stiffness: 420, damping: 34 }

/**
 * Phone navigation as a floating pill ("Soft Bento", 2026-11-09, like the customer bar): the current section sits on a
 * mint pill that slides between the four tabs. 64 px tall, 12 px above the iOS home-indicator area.
 */
export function CaregiverBottomNav({ toAccept, requests }: { toAccept: number; requests: number }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)

  return (
    <nav
      aria-label={t('caregiver.nav.mobileLabel')}
      className='fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 lg:hidden print:hidden'
    >
      <ul className='mx-auto flex h-16 max-w-md items-center justify-around rounded-[2rem] border border-white/80 bg-white/95 px-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl'>
        {caregiverNavigation.map((item) => {
          const current = active.key === item.key
          const badge = item.key === 'visits' ? toAccept + requests : 0
          const badgeLabel = t('caregiver.nav.needsResponse', { count: badge })
          return (
            <li className='flex flex-1 justify-center' key={item.key}>
              <Link
                aria-current={current ? 'page' : undefined}
                className='group relative flex min-h-12 w-full flex-col items-center justify-center rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                to={item.to}
              >
                {current ? (
                  <motion.span
                    aria-hidden='true'
                    className='absolute inset-x-0.5 inset-y-1 rounded-3xl bg-mint-100'
                    layoutId='caregiver-bottom-active'
                    transition={spring}
                  />
                ) : null}
                <span className='relative'>
                  <Icon
                    className={`text-[22px] transition-colors ${current ? 'cg-bounce text-forest-900' : 'text-forest-800/55 group-hover:text-forest-900'}`}
                    filled={current}
                    key={current ? 'on' : 'off'}
                    name={item.icon}
                  />
                  {badge > 0 ? (
                    <span
                      aria-label={badgeLabel}
                      className='absolute -top-1.5 -right-3 grid min-w-[18px] place-items-center rounded-full bg-peach-400 px-1 text-[10px] leading-[18px] font-bold text-forest-950 tabular-nums ring-2 ring-white'
                    >
                      {badge > 99 ? '99+' : badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`relative max-w-full truncate px-1 text-[11px] transition-colors ${current ? 'font-bold text-forest-900' : 'font-medium text-forest-800/60'}`}
                >
                  {t(`caregiver.nav.${item.key}`)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
