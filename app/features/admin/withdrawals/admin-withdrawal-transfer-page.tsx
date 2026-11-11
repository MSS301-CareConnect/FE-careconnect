import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { SimulatedTransferPage } from '~/entities/wallet/simulated-transfer-page'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { bentoContainer } from '~/shared/ui/bento-page-header'

/** Simulated bank transfer of one withdrawal (2026-11-11), opened from the withdrawal queue's review dialog. */
export function AdminWithdrawalTransferPage() {
  const { t } = useTranslation()
  const { withdrawalId = '' } = useParams()
  useDocumentTitle(t('wallet.sandbox.gateway'))
  return (
    <div className={bentoContainer}>
      <SimulatedTransferPage queueHref='/admin/withdrawals' withdrawalId={withdrawalId} />
    </div>
  )
}
