import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { CenterBookingPolicyForm } from '~/entities/booking/center-booking-policy-form'
import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoCard, bentoContainer } from '~/shared/ui/bento-page-header'
import { Select } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Skeleton } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

const key = 'admin.policiesPage' as const

/**
 * Spec §8 / §12: the admin reads and sets the booking policy of any center that takes bookings. A center without its
 * own policy follows the platform defaults of BookingService (`booking.policy-defaults`). The chosen center lives in
 * `?center=` so the page can be linked and reloaded (2026-11-11).
 */
export function AdminPoliciesPage() {
  const { t } = useTranslation()
  const id = useId()
  const centers = useServiceCenters()
  const [params, setParams] = useSearchParams()
  const centerId = params.get('center') ?? ''
  const center = centers.data?.find((item) => item.id === centerId)
  useDocumentTitle(t(`${key}.documentTitle`))

  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t(`${key}.intro`)} title={t(`${key}.title`)} />
      {centers.isPending ? (
        <div aria-label={t(`${key}.loadingCenters`)} role='status'>
          <Skeleton className='h-24 rounded-2xl' />
        </div>
      ) : null}
      {centers.isError ? (
        <ErrorState message={t(`${key}.centersError`)} onRetry={() => void centers.refetch()} />
      ) : null}
      {centers.data && centers.data.length === 0 ? (
        <EmptyState description={t(`${key}.noCentersHint`)} icon='apartment' title={t(`${key}.noCenters`)} />
      ) : null}
      {centers.data && centers.data.length > 0 ? (
        <>
          <section className={`${bentoCard} flex flex-wrap items-center gap-x-6 gap-y-4 p-5`}>
            <span
              aria-hidden='true'
              className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-900 text-mint-300'
            >
              <Icon className='text-2xl' name='apartment' />
            </span>
            <div className='min-w-64 flex-1 sm:max-w-md'>
              <label className='block text-sm font-semibold text-on-surface' htmlFor={`${id}-center`}>
                {t(`${key}.center`)}
              </label>
              <Select
                className='mt-1.5'
                id={`${id}-center`}
                onChange={(event) =>
                  setParams(event.target.value ? { center: event.target.value } : {}, { replace: true })
                }
                value={center ? centerId : ''}
              >
                <option value=''>{t(`${key}.chooseCenter`)}</option>
                {centers.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
            {center ? (
              <div className='min-w-0 flex-1 text-sm text-on-surface-variant'>
                {center.address ? (
                  <p className='flex items-start gap-2'>
                    <Icon className='mt-0.5 text-base' name='location_on' />
                    <span className='min-w-0'>{center.address}</span>
                  </p>
                ) : null}
                <Link
                  className='mt-1 inline-flex min-h-9 items-center gap-1 font-semibold text-primary hover:underline'
                  to={`/admin/centers/${center.id}`}
                >
                  {t(`${key}.openCenter`)}
                  <Icon className='text-base' name='arrow_forward' />
                </Link>
              </div>
            ) : null}
          </section>
          {center ? (
            <CenterBookingPolicyForm centerId={center.id} key={center.id} />
          ) : (
            <EmptyState description={t(`${key}.chooseHint`)} icon='rule' title={t(`${key}.chooseTitle`)} />
          )}
        </>
      ) : null}
    </div>
  )
}
