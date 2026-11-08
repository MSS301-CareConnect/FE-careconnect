import { useTranslation } from 'react-i18next'

import { CenterBookingPolicyForm } from '~/entities/booking/center-booking-policy-form'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ForbiddenState } from '~/shared/ui/state-panels'

/** Spec §8 / §12: the manager sets the booking policy of the own center; BookingService enforces the scope. */
export function ManagerPolicyPage() {
  const { t } = useTranslation()
  const centerId = useAuthUser()?.centerId
  useDocumentTitle(t('centerManager.policyPage.documentTitle'))

  return (
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('centerManager.policyPage.title')}</h1>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant'>
          {t('centerManager.policyPage.subtitle')}
        </p>
      </header>
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
