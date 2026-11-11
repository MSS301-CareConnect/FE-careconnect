import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { WalletBalanceLink } from '~/entities/wallet/wallet-balance-link'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

const menuItem =
  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
const groupLabel = 'px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide text-forest-700 uppercase'
const divider = 'my-1 border-t border-outline-variant'

const GROUPS = [
  {
    id: 'account',
    items: [
      { to: '/customer/my-profile', icon: 'person', label: 'customer.nav.account' },
      { to: '/customer/patient-profiles', icon: 'group', label: 'customer.nav.relatives' },
      { to: '/customer/invitations', icon: 'mail', label: 'customer.nav.invitations' }
    ]
  },
  {
    id: 'finance',
    items: [{ to: '/customer/payments', icon: 'payments', label: 'customer.nav.payments' }]
  }
] as const

/**
 * Content of the customer account dropdown: who is signed in, then the links in two named groups (account, money) —
 * the money group starts with a wallet card showing the current balance — then language and sign-out.
 */
export function AccountMenu({
  displayName,
  email,
  onNavigate
}: {
  displayName: string
  email?: string
  onNavigate: () => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className='flex items-center gap-3 px-3 py-2'>
        <Avatar className='h-10 w-10 rounded-full' decorative name={displayName} />
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-on-surface'>{displayName}</p>
          {email ? <p className='truncate text-xs text-on-surface-variant'>{email}</p> : null}
        </div>
      </div>
      <nav aria-label={t('customer.nav.accountMenu')} className='flex flex-col'>
        {GROUPS.map((group) => (
          <div key={group.id}>
            <div className={divider} />
            <p className={groupLabel}>{t(`customer.nav.groups.${group.id}`)}</p>
            {group.id === 'finance' ? <WalletBalanceLink onNavigate={onNavigate} to='/customer/wallet' /> : null}
            {group.items.map((item) => (
              <Link className={menuItem} key={item.to} onClick={onNavigate} to={item.to}>
                <Icon className='text-xl text-on-surface-variant' name={item.icon} />
                {t(item.label)}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={divider} />
      <div className='flex items-center justify-between gap-2 px-3 py-1.5'>
        <span className='text-sm text-on-surface-variant'>{t('customer.nav.language')}</span>
        <LanguageSwitch />
      </div>
      <div className={divider} />
      <SignOutButton appearance='menu' />
    </>
  )
}
