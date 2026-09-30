import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import type { ManagerBookingPreview } from '../booking-preview'
import { featuredBookingAmounts, featuredBookingDetail } from '../booking-detail-preview'

const key = 'centerManager.bookingDetail' as const
const fee = featuredBookingDetail.serviceFee
const discount = featuredBookingDetail.discount

export function BookingDetailRight({
  booking,
  featured,
  onCancel
}: {
  booking: ManagerBookingPreview
  featured: boolean
  onCancel: () => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const money = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(`${value}T00:00:00Z`)
    )
  const time = (value: string) =>
    new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(
      new Date(`2026-01-01T${value}:00Z`)
    )
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const endDate =
    booking.end && booking.start && booking.end <= booking.start
      ? new Date(new Date(`${booking.date}T00:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10)
      : booking.date
  return (
    <div className='space-y-6'>
      <SectionCard icon='home_health' title={t(`${key}.service`)}>
        <div className='rounded-lg bg-secondary-container/55 p-4'>
          <h3 className='font-bold text-primary'>{booking.serviceName}</h3>
          {featured && <p className='mt-1 text-xs text-primary'>{t(`${key}.specialty`)}</p>}
        </div>
        {featured && (
          <>
            <h3 className='mt-5 text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
              {t(`${key}.commitments`)}
            </h3>
            <ul className='mt-3 space-y-2'>
              {(['vital', 'medicine', 'hygiene', 'watch'] as const).map((item) => (
                <li className='flex items-start gap-2 text-sm leading-6 text-on-surface-variant' key={item}>
                  <Icon className='shrink-0 text-primary' name='check_circle' />
                  {t(`${key}.tasks.${item}`)}
                </li>
              ))}
            </ul>
            <div className='mt-5 border-t border-outline-variant/25 pt-4'>
              <h3 className='text-sm font-bold'>{t(`${key}.equipment`)}</h3>
              <p className='mt-1 text-sm leading-6 text-on-surface-variant'>{t(`${key}.equipmentValue`)}</p>
            </div>
          </>
        )}
      </SectionCard>
      <SectionCard icon='calendar_month' title={t(`${key}.schedule`)}>
        <dl className='space-y-3 text-sm'>
          <div className='flex flex-wrap justify-between gap-2 border-b border-outline-variant/25 pb-3'>
            <dt className='text-outline'>{t(`${key}.shiftHours`)}</dt>
            <dd className='font-semibold'>
              {date(booking.date)}
              {booking.start && booking.end && (
                <>
                  {' '}
                  · {time(booking.start)}–{time(booking.end)}
                  {endDate !== booking.date && <> ({date(endDate)})</>}
                </>
              )}
            </dd>
          </div>
          {featured && (
            <>
              <div className='flex justify-between gap-2 border-b border-outline-variant/25 pb-3'>
                <dt className='text-outline'>{t(`${key}.checkin`)}</dt>
                <dd className='font-semibold text-primary'>
                  {new Intl.DateTimeFormat(locale, {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh'
                  }).format(new Date(featuredBookingDetail.checkin))}
                </dd>
              </div>
              <div className='flex justify-between gap-2'>
                <dt className='text-outline'>{t(`${key}.checkout`)}</dt>
                <dd className='font-semibold'>
                  {booking.end ? `${date(endDate)} · ${time(booking.end)}` : date(endDate)}
                </dd>
              </div>
            </>
          )}
        </dl>
        <div className='mt-5 flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-center'>
          <Icon className='text-3xl text-outline' name='location_off' />
          <p className='mt-2 font-semibold'>{t(`${key}.gpsUnavailable`)}</p>
          <p className='mt-1 text-xs text-outline'>{t(`${key}.gpsHint`)}</p>
        </div>
      </SectionCard>
      <SectionCard icon='receipt_long' title={t(`${key}.finance`)}>
        {featured ? (
          <>
            <dl className='space-y-3 text-sm'>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t(`${key}.serviceFee`)}</dt>
                <dd className='font-semibold'>{money(fee)}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t(`${key}.discount`)}</dt>
                <dd className='font-semibold text-error'>−{money(discount)}</dd>
              </div>
              <div className='flex justify-between gap-3 border-t border-outline-variant/25 pt-3 font-bold'>
                <dt>{t(`${key}.total`)}</dt>
                <dd className='text-primary'>{money(featuredBookingAmounts.total)}</dd>
              </div>
            </dl>
            <dl className='mt-4 space-y-2 rounded-lg bg-surface-container-low p-4 text-sm'>
              <div className='flex justify-between gap-3'>
                <dt>{t(`${key}.escrow`)}</dt>
                <dd className='font-bold text-primary'>{money(featuredBookingAmounts.deposit)}</dd>
              </div>
              <div className='flex justify-between gap-3 border-t border-outline-variant/25 pt-2'>
                <dt>{t(`${key}.balance`)}</dt>
                <dd className='font-bold'>{money(featuredBookingAmounts.balance)}</dd>
              </div>
            </dl>
            <p className='mt-3 text-xs leading-5 text-outline'>{t(`${key}.financeHint`)}</p>
          </>
        ) : (
          <p className='text-sm text-outline'>{t(`${key}.noFinance`)}</p>
        )}
      </SectionCard>
      <SectionCard icon='policy' title={t(`${key}.cancellation`)}>
        <ul className='list-inside list-disc space-y-2 rounded-lg bg-error-container/35 p-4 text-sm leading-6 text-on-surface-variant'>
          {(['policyEarly', 'policyNear', 'policyActive'] as const).map((item) => (
            <li key={item}>{t(`${key}.${item}`)}</li>
          ))}
        </ul>
        <button
          className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-error/35 bg-error-container/35 px-4 py-2.5 text-sm font-semibold text-error'
          disabled={booking.status === 'cancelled' || booking.status === 'completed'}
          onClick={onCancel}
          title={booking.status === 'cancelled' || booking.status === 'completed' ? t(`${key}.unavailable`) : undefined}
          type='button'
        >
          <Icon name='warning' />
          {t(`${key}.cancelProcess`)}
        </button>
      </SectionCard>
      <SectionCard icon='edit_note' title={t(`${key}.noteTitle`)}>
        <label className='sr-only' htmlFor='manager-booking-note'>
          {t(`${key}.noteTitle`)}
        </label>
        <textarea
          className='min-h-28 w-full rounded-lg border border-outline-variant/60 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary'
          id='manager-booking-note'
          onChange={(event) => {
            setNote(event.target.value)
            setSaved(false)
          }}
          placeholder={t(`${key}.notePlaceholder`)}
          value={note}
        />
        <p className='mt-2 text-xs text-outline'>{saved ? t(`${key}.noteSaved`) : t(`${key}.noteHint`)}</p>
        <button
          className='mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'
          disabled={!note.trim()}
          onClick={() => setSaved(true)}
          type='button'
        >
          {t(`${key}.saveNote`)}
        </button>
      </SectionCard>
    </div>
  )
}
