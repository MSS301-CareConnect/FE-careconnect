import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { PageHeader } from '~/shared/ui/page-header'

const bookingHref = (bookingId: string) => `/customer/bookings/${bookingId}`

/** Customer wallet (2026-11-09): refunds of bookings the customer cancelled, spending dashboard and withdrawals. */
export function CustomerWalletPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.CUSTOMER'))

  return (
    <div className='pb-8'>
      <PageHeader description={t('wallet.subtitles.CUSTOMER')} title={t('wallet.titles.CUSTOMER')} />
      <WalletDashboard bookingHref={bookingHref} />
    </div>
  )
}
