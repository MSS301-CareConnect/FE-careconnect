import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { fetchMyWallet, walletKeys } from './wallet-api'

/**
 * Wallet card of an account dropdown (customer / caregiver, 2026-11-11): the signed-in wallet's available balance,
 * linking to the wallet page. Centers and the platform have a revenue page instead. Mount it only while the menu is
 * open so the balance is read when someone looks at it.
 */
export function WalletBalanceLink({ to, onNavigate }: { to: string; onNavigate: () => void }) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const wallet = useQuery({ queryKey: walletKeys.mine, queryFn: fetchMyWallet, retry: false })

  return (
    <Link
      className='mx-1 mb-1 flex items-center gap-3 rounded-2xl bg-forest-900 px-3.5 py-3 text-white shadow-[var(--shadow-soft)] transition-colors hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
      onClick={onNavigate}
      to={to}
    >
      <span
        aria-hidden='true'
        className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint-300 text-forest-950'
      >
        <Icon className='text-xl' name='account_balance_wallet' />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block text-xs font-medium text-white/70'>{t('wallet.menu.balance')}</span>
        <span className='block truncate text-base font-bold tabular-nums'>
          {wallet.data
            ? money(wallet.data.availableBalance)
            : wallet.isError
              ? t('wallet.menu.open')
              : t('wallet.menu.loading')}
        </span>
      </span>
      <Icon className='text-lg text-white/70' name='chevron_right' />
    </Link>
  )
}
