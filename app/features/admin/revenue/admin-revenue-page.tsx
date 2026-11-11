import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

const bookingHref = (bookingId: string) => `/admin/bookings/${bookingId}`

/**
 * Platform revenue (2026-11-11, replaces the platform wallet and the former sample revenue page): the commission on
 * served visits, what customers paid and were refunded, and what the platform still holds for others.
 */
export function AdminRevenuePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.PLATFORM'))

  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader description={t('wallet.subtitles.PLATFORM')} title={t('wallet.titles.PLATFORM')} />
      <WalletDashboard bookingHref={bookingHref} />
    </div>
  )
}
