import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

const bookingHref = (bookingId: string) => `/admin/bookings/${bookingId}`

/** Platform wallet (2026-11-09, read-only): commission, platform money flow and what the platform holds for others. */
export function AdminWalletPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.PLATFORM'))

  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader description={t('wallet.subtitles.PLATFORM')} title={t('wallet.titles.PLATFORM')} />
      <WalletDashboard bookingHref={bookingHref} />
    </div>
  )
}
