import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CenterBookingPolicyForm } from '~/entities/booking/center-booking-policy-form'
import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Select } from '~/shared/ui/form-field'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { BentoPageHeader } from '~/shared/ui/bento-page-header'

const key = 'admin.policiesPage' as const

/**
 * Spec §8 / §12: the admin reads and sets the booking policy of any center that takes bookings. A center without its
 * own policy follows the platform defaults of BookingService (`booking.policy-defaults`).
 */
export function AdminPoliciesPage() {
  const { t } = useTranslation()
  const id = useId()
  const centers = useServiceCenters()
  const [centerId, setCenterId] = useState('')
  useDocumentTitle(t(`${key}.documentTitle`))

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 px-4 pb-10 sm:px-6'>
      <BentoPageHeader description={t(`${key}.intro`)} icon='rule' title={t(`${key}.title`)} variant='hero' />
      {centers.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loadingCenters`)}
        </p>
      ) : null}
      {centers.isError ? (
        <ErrorState message={t(`${key}.centersError`)} onRetry={() => void centers.refetch()} />
      ) : null}
      {centers.data && centers.data.length === 0 ? (
        <EmptyState description={t(`${key}.noCentersHint`)} title={t(`${key}.noCenters`)} />
      ) : null}
      {centers.data && centers.data.length > 0 ? (
        <>
          <div className='max-w-md'>
            <label className='block text-sm font-semibold text-on-surface' htmlFor={`${id}-center`}>
              {t(`${key}.center`)}
            </label>
            <Select
              className='mt-1.5'
              id={`${id}-center`}
              onChange={(event) => setCenterId(event.target.value)}
              value={centerId}
            >
              <option value=''>{t(`${key}.chooseCenter`)}</option>
              {centers.data.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </Select>
          </div>
          {centerId ? (
            <CenterBookingPolicyForm centerId={centerId} key={centerId} />
          ) : (
            <p className='text-sm text-on-surface-variant'>{t(`${key}.chooseHint`)}</p>
          )}
        </>
      ) : null}
    </div>
  )
}
