import { useTranslation } from 'react-i18next'

import type { WalletRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

/** Balance card: what the owner can withdraw now, what is held by pending requests, and the withdraw action. */
export function WalletSummary({ wallet, onWithdraw }: { wallet: WalletRecord; onWithdraw?: () => void }) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const platform = wallet.ownerType === 'PLATFORM'
  const negative = wallet.availableBalance < 0

  return (
    <section
      aria-label={t('wallet.balance.available')}
      className='grid gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:p-6'
    >
      <div>
        <p className='flex items-center gap-2 text-sm font-semibold text-on-surface-variant'>
          <Icon className='text-primary' name='account_balance_wallet' />
          {t('wallet.balance.available')}
        </p>
        <p
          className={`mt-2 text-3xl font-extrabold tabular-nums ${negative ? 'text-error' : 'text-primary'}`}
          data-testid='wallet-available'
        >
          {money(wallet.availableBalance)}
        </p>
      </div>
      {platform ? null : (
        <div>
          <p className='text-sm font-semibold text-on-surface-variant'>{t('wallet.balance.held')}</p>
          <p className='mt-2 text-2xl font-bold tabular-nums text-on-surface'>{money(wallet.heldBalance)}</p>
          <p className='mt-1 text-xs text-on-surface-variant'>{t('wallet.balance.heldHint')}</p>
        </div>
      )}
      <div className='flex flex-col items-start gap-1.5 sm:items-end'>
        {platform ? (
          <p className='text-sm text-on-surface-variant'>{t('wallet.balance.platformReadOnly')}</p>
        ) : (
          <>
            <Button
              disabled={!wallet.withdrawable || !onWithdraw}
              leftIcon={<Icon name='payments' />}
              onClick={onWithdraw}
            >
              {t('wallet.balance.withdraw')}
            </Button>
            {wallet.withdrawable ? null : (
              <p className='text-xs text-on-surface-variant'>{t('wallet.balance.notWithdrawable')}</p>
            )}
          </>
        )}
      </div>
      {negative ? (
        <p
          className='rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container sm:col-span-3'
          role='status'
        >
          {t('wallet.balance.negative')}
        </p>
      ) : null}
    </section>
  )
}
