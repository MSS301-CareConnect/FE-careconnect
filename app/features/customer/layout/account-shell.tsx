import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { fetchMyInvitations, managerKeys } from '~/entities/care-recipient/care-recipient-managers-api'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'

type Section = 'personal' | 'security' | 'relatives' | 'payments' | 'wallet' | 'invitations' | 'notifications'

const SECTIONS: { id: Section; to: string; icon: string }[] = [
  { id: 'personal', to: '/customer/my-profile', icon: 'person' },
  { id: 'security', to: '/customer/my-profile?section=security', icon: 'lock' },
  { id: 'relatives', to: '/customer/patient-profiles', icon: 'family_restroom' },
  { id: 'payments', to: '/customer/payments', icon: 'payments' },
  { id: 'wallet', to: '/customer/wallet', icon: 'account_balance_wallet' },
  { id: 'invitations', to: '/customer/invitations', icon: 'mail' },
  { id: 'notifications', to: '/customer/notifications', icon: 'notifications' }
]

function activeSection(pathname: string, search: string): Section | null {
  if (pathname.startsWith('/customer/my-profile'))
    return new URLSearchParams(search).get('section') === 'security' ? 'security' : 'personal'
  if (pathname.startsWith('/customer/patient-profiles')) return 'relatives'
  if (pathname.startsWith('/customer/payments')) return 'payments'
  if (pathname.startsWith('/customer/wallet')) return 'wallet'
  if (pathname.startsWith('/customer/invitations')) return 'invitations'
  if (pathname.startsWith('/customer/notifications')) return 'notifications'
  return null
}

/** Pending invitations to co-manage a family profile; shared by the account menu, the shell and the profiles list. */
export function usePendingInvitations(enabled = true) {
  return useQuery({ queryKey: managerKeys.myInvitations, queryFn: fetchMyInvitations, enabled, retry: false })
}

/**
 * The account area around personal info, security, family profiles, payments and invitations: a sidebar on desktop
 * and a sideways-scrolling row of tabs on phones. Each page keeps its own title; the shell only navigates.
 */
export function CustomerAccountShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { pathname, search } = useLocation()
  const current = activeSection(pathname, search)
  const invitations = usePendingInvitations()
  const pending = invitations.data?.length ?? 0

  return (
    <div className={`${pageContainer} pb-16 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8`}>
      <nav
        aria-label={t('customer.accountArea.label')}
        className='-mx-4 px-4 pt-4 sm:-mx-6 sm:px-6 lg:sticky lg:top-24 lg:mx-0 lg:mt-8 lg:self-start lg:rounded-3xl lg:border lg:border-forest-900/[0.06] lg:bg-white/80 lg:p-3 lg:shadow-[var(--shadow-card)] lg:backdrop-blur'
      >
        <p className='hidden px-3 pt-2 pb-3 text-xs font-bold tracking-wide text-forest-700 uppercase lg:block'>
          {t('customer.accountArea.title')}
        </p>
        <ul className='cc-no-scrollbar flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0'>
          {SECTIONS.map((section) => {
            const active = section.id === current
            return (
              <li className='shrink-0' key={section.id}>
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-11 items-center gap-2.5 rounded-full px-3.5 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-900 lg:rounded-2xl ${active ? 'font-semibold text-white' : 'text-on-surface-variant max-lg:bg-white/70 max-lg:ring-1 max-lg:ring-forest-900/5 hover:bg-mint-50 hover:text-forest-900'}`}
                  to={section.to}
                >
                  {active ? (
                    <motion.span
                      aria-hidden='true'
                      className='absolute inset-0 -z-0 rounded-full bg-forest-900 shadow-[var(--shadow-soft)] lg:rounded-2xl'
                      layoutId='customer-account-active'
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  ) : null}
                  <Icon
                    className={`relative text-xl max-lg:hidden ${active ? 'text-mint-300' : ''}`}
                    filled={active}
                    name={section.icon}
                  />
                  <span className='relative'>{t(`customer.accountArea.${section.id}`)}</span>
                  {section.id === 'invitations' && pending > 0 ? (
                    <span
                      aria-label={t('customer.accountArea.pendingInvitations', { count: pending })}
                      className='relative ml-auto min-w-5 rounded-full bg-peach-200 px-1.5 py-0.5 text-center text-xs leading-4 font-bold text-forest-950 tabular-nums'
                    >
                      {pending}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className='min-w-0'>{children}</div>
    </div>
  )
}
