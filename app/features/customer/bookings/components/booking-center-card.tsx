import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useServiceCenter } from '~/entities/care-center/care-center-api'
import { apiErrorStatus } from '~/shared/api/error-details'
import { ViewableImage } from '~/shared/ui/image-viewer'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.bookingDetail.center' as const

function Fact({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className='flex min-w-0 items-start gap-2.5'>
      <span className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-container-high text-primary'>
        <Icon className='text-lg' name={icon} />
      </span>
      <div className='min-w-0'>
        <span className='block text-xs font-medium text-on-surface-variant'>{label}</span>
        <span className='block text-sm text-on-surface'>{children}</span>
      </div>
    </div>
  )
}

/**
 * The center that owns the booking. BookingService keeps only `centerId`, so the name and contact details come from
 * ProviderService's public center detail; a 404 there means the center stopped taking bookings, not that the booking
 * lost its center.
 */
export function BookingCenterCard({ centerId }: { centerId: string | undefined }) {
  const { t } = useTranslation()
  const center = useServiceCenter(centerId)
  const data = center.data
  const gone = center.isError && apiErrorStatus(center.error) === 404

  return (
    <section
      aria-labelledby='booking-center-title'
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'
    >
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/50 pb-4'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary'>
            <Icon className='text-xl' name='home_health' />
          </span>
          <div className='min-w-0'>
            <h2 className='text-base font-bold text-on-surface' id='booking-center-title'>
              {t(`${key}.title`)}
            </h2>
            <p className='text-xs text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          </div>
        </div>
        {data ? (
          <Link
            className='inline-flex min-h-11 items-center gap-1 rounded-full border border-outline-variant px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/centers/${data.id}`}
          >
            {t(`${key}.view`)}
            <Icon className='text-base' name='arrow_forward' />
          </Link>
        ) : null}
      </div>

      {center.isPending && centerId ? (
        <div className='mt-4 flex items-center gap-4' role='status'>
          <span className='h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-surface-container-high' />
          <span className='sr-only'>{t(`${key}.loading`)}</span>
          <span className='h-4 w-48 animate-pulse rounded bg-surface-container-high' aria-hidden='true' />
        </div>
      ) : null}

      {gone ? <p className='mt-4 text-sm text-on-surface-variant'>{t(`${key}.unavailable`)}</p> : null}

      {center.isError && !gone ? (
        <div className='mt-4 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant'>
          <span>{t(`${key}.error`)}</span>
          <button
            className='font-semibold text-primary hover:underline'
            onClick={() => void center.refetch()}
            type='button'
          >
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}

      {data ? (
        <div className='mt-4 flex flex-col gap-4'>
          <div className='flex items-center gap-4'>
            {data.imageUrl ? (
              <ViewableImage
                alt={t(`${key}.photoAlt`, { name: data.name })}
                className='h-16 w-16 shrink-0 rounded-2xl'
                src={data.imageUrl}
              />
            ) : (
              <span
                aria-hidden='true'
                className='grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-mint-50 text-forest-800'
              >
                <Icon className='text-3xl' name='home_health' />
              </span>
            )}
            <p className='min-w-0 text-lg leading-snug font-bold text-on-surface'>{data.name}</p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {data.address ? (
              <div className='sm:col-span-2'>
                <Fact icon='location_on' label={t(`${key}.address`)}>
                  {data.address}
                </Fact>
              </div>
            ) : null}
            {data.operatingHours ? (
              <Fact icon='schedule' label={t(`${key}.hours`)}>
                <span className='tabular-nums'>{data.operatingHours}</span>
              </Fact>
            ) : null}
            {data.phoneNumber ? (
              <Fact icon='call' label={t(`${key}.phone`)}>
                <a
                  aria-label={t(`${key}.call`, { phone: data.phoneNumber })}
                  className='font-semibold text-primary tabular-nums hover:underline'
                  href={`tel:${data.phoneNumber.replace(/\s+/g, '')}`}
                >
                  {data.phoneNumber}
                </a>
              </Fact>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
