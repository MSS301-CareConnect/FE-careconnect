import { useTranslation } from 'react-i18next'

import type { WalletRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

/**
 * Balance card as the forest hero of the wallet ("Soft Bento", 2026-11-09): what the owner can withdraw now, what is
 * held by pending requests in a glass tile, and the withdraw action as the peach call to action.
 */
export function WalletSummary({ wallet, onWithdraw }: { wallet: WalletRecord; onWithdraw?: () => void }) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const platform = wallet.ownerType === 'PLATFORM'
  const negative = wallet.availableBalance < 0

  return (
    <section
      aria-label={t('wallet.balance.available')}
      className='relative isolate grid gap-4 overflow-hidden rounded-[1.75rem] bg-forest-900 p-6 text-white shadow-[var(--shadow-float)] before:pointer-events-none before:absolute before:-top-24 before:-right-16 before:-z-10 before:h-72 before:w-72 before:rounded-full before:bg-mint-400/25 before:blur-3xl sm:grid-cols-[1.2fr_1fr_auto] sm:items-center sm:p-7'
    >
      <div>
        <p className='flex items-center gap-2.5 text-sm font-semibold text-white/75'>
          <span className='grid h-9 w-9 place-items-center rounded-full bg-mint-300 text-forest-950'>
            <Icon className='text-xl' name='account_balance_wallet' />
          </span>
          {t('wallet.balance.available')}
        </p>
        <p
          className={`mt-3 text-[34px] leading-none font-extrabold tracking-tight tabular-nums sm:text-[40px] ${negative ? 'text-peach-300' : 'text-white'}`}
          data-testid='wallet-available'
        >
          {money(wallet.availableBalance)}
        </p>
      </div>
      {platform ? null : (
        <div className='rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10'>
          <p className='text-sm font-semibold text-white/70'>{t('wallet.balance.held')}</p>
          <p className='mt-1 text-2xl font-bold tabular-nums'>{money(wallet.heldBalance)}</p>
          <p className='mt-1 text-xs text-white/60'>{t('wallet.balance.heldHint')}</p>
        </div>
      )}
      <div className='flex flex-col items-start gap-1.5 sm:items-end'>
        {platform ? (
          <p className='max-w-56 text-sm text-white/70'>{t('wallet.balance.platformReadOnly')}</p>
        ) : (
          <>
            <Button
              disabled={!wallet.withdrawable || !onWithdraw}
              className='rounded-full! px-6'
              leftIcon={<Icon name='payments' />}
              onClick={onWithdraw}
              size='lg'
              variant='accent'
            >
              {t('wallet.balance.withdraw')}
            </Button>
            {wallet.withdrawable ? null : (
              <p className='text-xs text-white/60'>{t('wallet.balance.notWithdrawable')}</p>
            )}
          </>
        )}
      </div>
      {negative ? (
        <p
          className='rounded-2xl bg-peach-100 px-4 py-3 text-sm font-medium text-peach-700 sm:col-span-3'
          role='status'
        >
          {t('wallet.balance.negative')}
        </p>
      ) : null}
    </section>
  )
}
