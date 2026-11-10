import { useTranslation } from 'react-i18next'

import { WalletDashboard } from '~/entities/wallet/wallet-dashboard'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'

/** Caregiver wallet (2026-11-09): deposits kept from customers on visits assigned to the caregiver, and withdrawals. */
export function CaregiverWalletPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('wallet.titles.CAREGIVER'))

  return (
    <div className={cgContainer}>
      <CaregiverPageHeader description={t('wallet.subtitles.CAREGIVER')} title={t('wallet.titles.CAREGIVER')} />
      <WalletDashboard />
    </div>
  )
}
