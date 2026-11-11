import { useTranslation } from 'react-i18next'

import { WithdrawalQueue } from '~/entities/wallet/withdrawal-queue'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

/**
 * Center withdrawal queue (2026-11-10): customers and caregivers withdraw money this center holds for them (refunds,
 * kept deposits); the manager runs the simulated transfer (the request completes by itself and the requester is
 * notified) or rejects with a reason. The dashboard shows what waits and how much the center still holds for them.
 */
export function ManagerWithdrawalsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.review.managerTitle'))
  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader
        description={t('wallet.review.managerSubtitle')}
        icon='payments'
        title={t('wallet.review.managerTitle')}
        variant='hero'
      />
      <WithdrawalQueue portal='manager' />
    </div>
  )
}
