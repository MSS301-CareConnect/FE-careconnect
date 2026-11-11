import { useTranslation } from 'react-i18next'

import { WithdrawalQueue } from '~/entities/wallet/withdrawal-queue'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

/**
 * The admin withdrawal page (2026-11-10): the platform dashboard of every withdrawal, the queue the admin handles
 * (center wallets and older requests without a center) and — read-only — the customer / caregiver requests that the
 * center holding the money handles.
 */
export function AdminWithdrawalsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.admin.title'))
  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader description={t('wallet.admin.subtitle')} title={t('wallet.admin.title')} />
      <WithdrawalQueue portal='admin' />
    </div>
  )
}
