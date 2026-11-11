import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

const bookingHref = (bookingId: string) => `/center-manager/bookings/${bookingId}`

/**
 * Center revenue (2026-11-11): customer money reaches the center's own account, so this page only reports what the
 * center received — served visits after the platform commission, kept deposits, complaint refunds — with no withdrawal.
 */
export function ManagerRevenuePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.CENTER'))

  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader description={t('wallet.subtitles.CENTER')} title={t('wallet.titles.CENTER')} />
      <WalletDashboard bookingHref={bookingHref} withdrawalQueueHref='/center-manager/withdrawals' />
    </div>
  )
}
