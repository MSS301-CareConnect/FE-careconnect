import { useTranslation } from 'react-i18next'

import type { BookingStatus, OccurrenceStatus } from '~/shared/api/generated/contracts'

const bookingTone: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  AWAITING_DEPOSIT: 'bg-orange-50 text-orange-800',
  CONFIRMED: 'bg-blue-50 text-blue-800',
  IN_PROGRESS: 'bg-emerald-50 text-emerald-800',
  COMPLETED: 'bg-secondary-container text-primary',
  REJECTED: 'bg-red-50 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-700',
  EXPIRED: 'bg-slate-100 text-slate-700'
}

const occurrenceTone: Record<OccurrenceStatus, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-800',
  ACKNOWLEDGED: 'bg-sky-50 text-sky-800',
  IN_PROGRESS: 'bg-emerald-50 text-emerald-800',
  COMPLETED: 'bg-secondary-container text-primary',
  CANCELLED: 'bg-slate-100 text-slate-700',
  MISSED: 'bg-red-50 text-red-800',
  CUSTOMER_NO_SHOW: 'bg-amber-50 text-amber-800'
}

const badge = 'inline-flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-semibold'

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useTranslation()
  return <span className={`${badge} ${bookingTone[status]}`}>{t(`booking.status.${status}`)}</span>
}

export function OccurrenceStatusBadge({ status }: { status: OccurrenceStatus }) {
  const { t } = useTranslation()
  return <span className={`${badge} ${occurrenceTone[status]}`}>{t(`booking.occurrenceStatus.${status}`)}</span>
}
