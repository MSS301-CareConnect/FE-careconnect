import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

const bookingHref = (bookingId: string) => `/admin/bookings/${bookingId}`

/** Platform wallet (2026-11-09, read-only): commission, platform money flow and what the platform holds for others. */
export function AdminWalletPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.PLATFORM'))

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl'>
          {t('wallet.titles.PLATFORM')}
        </h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('wallet.subtitles.PLATFORM')}</p>
      </header>
      <WalletDashboard bookingHref={bookingHref} />
    </div>
  )
}
