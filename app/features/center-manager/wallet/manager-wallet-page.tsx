import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

const bookingHref = (bookingId: string) => `/center-manager/bookings/${bookingId}`

/** Center wallet (2026-11-09): served visits after the platform commission, kept deposits, complaint refunds. */
export function ManagerWalletPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.CENTER'))

  return (
    <div className='mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('wallet.titles.CENTER')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('wallet.subtitles.CENTER')}</p>
      </header>
      <WalletDashboard bookingHref={bookingHref} />
    </div>
  )
}
