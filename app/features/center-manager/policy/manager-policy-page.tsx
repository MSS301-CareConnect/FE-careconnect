import { useTranslation } from 'react-i18next'

import { CenterBookingPolicyForm } from '~/entities/booking/center-booking-policy-form'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ForbiddenState } from '~/shared/ui/state-panels'

import { BentoPageHeader } from '~/shared/ui/bento-page-header'

/** Spec §8 / §12: the manager sets the booking policy of the own center; BookingService enforces the scope. */
export function ManagerPolicyPage() {
  const { t } = useTranslation()
  const centerId = useAuthUser()?.centerId
  useDocumentTitle(t('centerManager.policyPage.documentTitle'))

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 px-4 pb-10 sm:px-6'>
      <BentoPageHeader
        description={t('centerManager.policyPage.subtitle')}
        icon='rule'
        title={t('centerManager.policyPage.title')}
        variant='hero'
      />
      {centerId ? (
        <CenterBookingPolicyForm centerId={centerId} />
      ) : (
        <ForbiddenState
          description={t('centerManager.policyPage.noCenterHint')}
          title={t('centerManager.policyPage.noCenter')}
        />
      )}
    </div>
  )
}
