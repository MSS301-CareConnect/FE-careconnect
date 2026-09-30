import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { managerBookingPreviews, type ManagerBookingPreview } from './booking-preview'
import { featuredBookingAmounts, featuredBookingDetail, featuredBookingId } from './booking-detail-preview'
import { BookingCancelDialog } from './components/booking-cancel-dialog'
import { BookingDetailLeft } from './components/booking-detail-left'
import { BookingDetailRight } from './components/booking-detail-right'
import { BookingDetailTimeline } from './components/booking-detail-timeline'

const key = 'centerManager.bookingDetail' as const
const statusClass = {
  pending: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-secondary-container text-primary',
  inProgress: 'bg-blue-50 text-blue-800',
  completed: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-surface-container text-outline'
} as const

export function ManagerBookingDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const booking = managerBookingPreviews.find((item) => item.id === id)
  useDocumentTitle(booking ? t(`${key}.documentTitle`, { id: booking.id }) : t(`${key}.notFound`))
  if (!booking)
    return (
      <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6'>
        <h1 className='text-2xl font-bold'>{t(`${key}.notFound`)}</h1>
        <Link className='mt-5 inline-block text-primary underline' to='/center-manager/bookings'>
          {t(`${key}.back`)}
        </Link>
      </div>
    )
  return <BookingDetailContent booking={booking} key={booking.id} />
}

function BookingDetailContent({ booking }: { booking: ManagerBookingPreview }) {
  const { t, i18n } = useTranslation()
  const [cancelOpen, setCancelOpen] = useState(false)
  const featured = booking.id === featuredBookingId
  const locale = i18n.resolvedLanguage ?? 'vi'
  const created = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(booking.createdAt))
  const money = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)
  const percent = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value)
  const progress = featuredBookingDetail.elapsedMinutes / featuredBookingDetail.scheduledMinutes
  const stats = [
    { key: 'value', icon: 'payments', value: money(featuredBookingAmounts.total), detail: t(`${key}.summary.package`) },
    {
      key: 'deposit',
      icon: 'lock',
      value: money(featuredBookingAmounts.deposit),
      detail: t(`${key}.summary.depositNote`)
    },
    {
      key: 'due',
      icon: 'schedule_send',
      value: money(featuredBookingAmounts.balance),
      detail: t(`${key}.summary.dueNote`)
    },
    { key: 'progress', icon: 'timer', value: percent(progress), detail: t(`${key}.summary.progressNote`) }
  ] as const
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('centerManager.menu')} className='flex flex-wrap items-center gap-2 text-xs text-outline'>
        <Link className='hover:text-primary' to='/center-manager/bookings'>
          {t('centerManager.portal')}
        </Link>
        <Icon className='text-sm' name='chevron_right' />
        <Link className='hover:text-primary' to='/center-manager/bookings'>
          {t('centerManager.bookingManagement.title')}
        </Link>
        <Icon className='text-sm' name='chevron_right' />
        <span>#{booking.id}</span>
      </nav>
      <header className='rounded-xl bg-white p-5 shadow-sm sm:p-6'>
        <Link
          className='inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline'
          to='/center-manager/bookings'
        >
          <Icon className='text-base' name='arrow_back' />
          {t(`${key}.back`)}
        </Link>
        <div className='mt-4 flex flex-wrap items-start justify-between gap-5'>
          <div>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
                {t(`${key}.title`, { id: booking.id })}
              </h1>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[booking.status]}`}>
                {t(`centerManager.bookingManagement.statuses.${booking.status}`)}
              </span>
            </div>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.createdAt`, { date: created })}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50'
              disabled
              title={t(`${key}.unavailable`)}
              type='button'
            >
              {t(`${key}.print`)}
            </button>
            <button
              className='rounded-lg bg-secondary-container px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50'
              disabled
              title={t(`${key}.unavailable`)}
              type='button'
            >
              {t(`${key}.reassign`)}
            </button>
            <button
              className='rounded-lg bg-surface-container px-3 py-2 text-xs font-semibold disabled:opacity-50'
              disabled
              title={t(`${key}.unavailable`)}
              type='button'
            >
              {t(`${key}.hotline`)}
            </button>
            <button
              className='rounded-lg border border-error/40 bg-error-container/40 px-3 py-2 text-xs font-semibold text-error'
              disabled={booking.status === 'cancelled' || booking.status === 'completed'}
              onClick={() => setCancelOpen(true)}
              title={
                booking.status === 'cancelled' || booking.status === 'completed' ? t(`${key}.unavailable`) : undefined
              }
              type='button'
            >
              {t(`${key}.cancel`)}
            </button>
          </div>
        </div>
      </header>
      <p className='rounded-lg bg-secondary-container/45 px-4 py-3 text-xs leading-5 text-primary'>
        {t(`${key}.preview`)}
      </p>
      {featured ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {stats.map((stat) => (
              <section className='rounded-xl bg-white p-5 shadow-sm' key={stat.key}>
                <div className='flex items-center justify-between gap-3'>
                  <h2 className='text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
                    {t(`${key}.summary.${stat.key}`)}
                  </h2>
                  <Icon className='text-2xl text-primary' name={stat.icon} />
                </div>
                <p className='mt-3 text-2xl font-extrabold'>{stat.value}</p>
                <p className='mt-2 text-xs text-outline'>{stat.detail}</p>
                {stat.key === 'progress' && (
                  <div
                    aria-label={t(`${key}.summary.progress`)}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={Math.round(progress * 100)}
                    className='mt-3 h-2 overflow-hidden rounded-full bg-surface-container'
                    role='progressbar'
                  >
                    <div className='h-full rounded-full bg-primary' style={{ width: `${progress * 100}%` }} />
                  </div>
                )}
              </section>
            ))}
          </div>
          <BookingDetailTimeline />
        </>
      ) : (
        <p className='rounded-lg bg-white px-5 py-4 text-sm text-on-surface-variant shadow-sm'>
          {t(`${key}.otherHint`)}
        </p>
      )}
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='lg:col-span-7'>
          <BookingDetailLeft booking={booking} featured={featured} />
        </div>
        <div className='lg:col-span-5'>
          <BookingDetailRight booking={booking} featured={featured} onCancel={() => setCancelOpen(true)} />
        </div>
      </div>
      {cancelOpen && <BookingCancelDialog id={booking.id} onClose={() => setCancelOpen(false)} />}
    </div>
  )
}
