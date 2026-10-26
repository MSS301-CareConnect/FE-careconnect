import { useTranslation } from 'react-i18next'

import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const ICONS: Record<BookingStatus, string> = {
  PENDING: 'hourglass_top',
  AWAITING_DEPOSIT: 'account_balance_wallet',
  CONFIRMED: 'event_available',
  IN_PROGRESS: 'vital_signs',
  COMPLETED: 'verified',
  REJECTED: 'block',
  CANCELLED: 'event_busy',
  EXPIRED: 'timer_off'
}

/** What happens next for the customer, stated from the booking's own dates and amounts. */
export function BookingStatusPanel({ booking }: { booking: BookingDetailRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const values = {
    acceptanceDue: formatDateTime(booking.acceptanceDueAt, language),
    deposit: formatMoney(booking.depositAmount, language),
    depositDue: formatDateTime(booking.depositDueAt, language),
    reason: booking.rejectedReason ?? booking.cancelReason ?? '',
    refund: formatMoney(booking.refund?.totalRefund, language)
  }

  return (
    <section className='flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6'>
      <span className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary-container text-primary'>
        <Icon className='text-2xl' name={ICONS[booking.status]} />
      </span>
      <div className='min-w-0'>
        <h2 className='text-lg font-bold text-on-surface'>
          {t(`customer.bookingDetail.next.${booking.status}.title`)}
        </h2>
        <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
          {t(`customer.bookingDetail.next.${booking.status}.body`, values)}
        </p>
        {booking.refund?.totalRefund !== undefined ? (
          <p className='mt-2 text-sm font-semibold text-primary'>{t('customer.bookingDetail.refunded', values)}</p>
        ) : null}
      </div>
    </section>
  )
}
