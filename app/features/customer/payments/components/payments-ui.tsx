import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { InvoiceStatus, PaymentStatus, RefundStatus } from '~/shared/api/generated/contracts'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { Icon } from '~/shared/ui/icon'
import type { StatusTone } from '~/shared/ui/status-badge'

import type { BookingLabel } from '../hooks/use-booking-labels'

const key = 'customer.payments' as const

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, StatusTone> = {
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
  EXPIRED: 'neutral'
}

export const INVOICE_STATUS_TONES: Record<InvoiceStatus, StatusTone> = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  WAIVED: 'neutral',
  EXPIRED: 'neutral',
  CANCELLED: 'neutral'
}

export const REFUND_STATUS_TONES: Record<RefundStatus, StatusTone> = {
  REFUND_PENDING: 'warning',
  REFUNDED: 'success',
  FAILED: 'danger'
}

/** One list of money movements with explicit loading, error and empty states and its own pages. */
export function PaymentListSection({
  id,
  title,
  description,
  isPending,
  error,
  onRetry,
  isEmpty,
  empty,
  page,
  totalPages,
  onPageChange,
  children
}: {
  id: string
  title: string
  description?: string
  isPending: boolean
  error: string | null
  onRetry?: () => void
  isEmpty: boolean
  empty: { icon: string; title: string; description?: string; action?: ReactNode }
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby={id} className='flex flex-col gap-3'>
      <div>
        <h2 className='text-lg font-semibold text-on-surface' id={id}>
          {title}
        </h2>
        {description ? <p className='mt-0.5 text-sm text-on-surface-variant'>{description}</p> : null}
      </div>
      {isPending ? (
        <SkeletonGroup
          className='flex flex-col divide-y divide-outline-variant/70 rounded-2xl border border-outline-variant bg-surface-container-lowest'
          label={t(`${key}.loading`)}
        >
          {[0, 1, 2].map((index) => (
            <div className='flex items-center gap-3 px-4 py-4' key={index}>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-1/3 rounded' />
                <Skeleton className='h-3.5 w-1/2 rounded' />
              </div>
              <Skeleton className='h-5 w-24 rounded' />
            </div>
          ))}
        </SkeletonGroup>
      ) : null}
      {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
      {!isPending && !error && isEmpty ? (
        <EmptyState action={empty.action} description={empty.description} icon={empty.icon} title={empty.title} />
      ) : null}
      {!isPending && !error && !isEmpty ? (
        <ul className='cc-stagger flex flex-col divide-y divide-outline-variant/70 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-card)]'>
          {children}
        </ul>
      ) : null}
      <Pagination onPageChange={onPageChange} page={page} totalPages={totalPages} />
    </section>
  )
}

/**
 * One money movement: an icon, what it was for and which booking, then the amount and its status. Extra content
 * (a pay button, "refunded so far") goes under the amount.
 */
export function MoneyRow({
  icon,
  iconTone = 'default',
  title,
  booking,
  bookingId,
  meta,
  amount,
  status,
  aside
}: {
  icon: string
  iconTone?: 'default' | 'attention' | 'refund'
  title: string
  booking: BookingLabel | undefined
  bookingId: string
  meta?: string
  amount: string
  status: ReactNode
  aside?: ReactNode
}) {
  const { t } = useTranslation()
  const iconClass =
    iconTone === 'attention'
      ? 'bg-caution-container text-caution'
      : iconTone === 'refund'
        ? 'bg-info-container text-info'
        : 'bg-brand-50 text-primary'
  return (
    <li className='flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-4 sm:flex-nowrap sm:items-center sm:px-5'>
      <span aria-hidden='true' className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconClass}`}>
        <Icon className='text-xl' name={icon} />
      </span>
      <div className='min-w-0 flex-1 basis-48'>
        <p className='font-semibold text-on-surface'>{title}</p>
        <p className='mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-on-surface-variant'>
          <Link
            className='rounded font-mono text-[13px] text-primary tabular-nums hover:underline focus-visible:outline-2 focus-visible:outline-primary'
            to={`/customer/bookings/${bookingId}`}
          >
            {booking?.code ?? t(`${key}.viewBooking`)}
          </Link>
          {booking?.recipientName ? (
            <>
              <span aria-hidden='true'>·</span>
              <span>{booking.recipientName}</span>
            </>
          ) : null}
          {meta ? (
            <>
              <span aria-hidden='true'>·</span>
              <span className='tabular-nums'>{meta}</span>
            </>
          ) : null}
        </p>
      </div>
      <div className='ml-[3.25rem] flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:ml-0 sm:flex-none sm:justify-end'>
        <div className='flex flex-col gap-1 sm:items-end'>
          <span className='text-base font-semibold text-on-surface tabular-nums'>{amount}</span>
          {status}
        </div>
        {aside}
      </div>
    </li>
  )
}
