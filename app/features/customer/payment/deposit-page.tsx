import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import {
  initialPaymentOf,
  paymentErrorKey,
  redirectToCheckout,
  startDepositCheckout
} from '~/entities/payment/payment-api'
import { RefundPolicySummary } from '~/entities/payment/refund-policy'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { DepositBooking } from './components/deposit-booking'
import { DepositSummary } from './components/deposit-summary'

const key = 'customer.payment.deposit' as const

/**
 * The initial payment of a booking before VNPay (booking spec v1 §9.1, 2026-11-05: every type pays the center's
 * deposit percent, 30 % by default, and the rest before the first visit; a first visit too close is paid in full).
 * Left: what is being paid for. Right: the amount, the payment plan, the deadline and the VNPay button.
 */
export function DepositPage({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    retry: false
  })
  // PaymentService keeps one live session per booking: opening again expires the previous one.
  const pay = useMutation({
    mutationFn: () => startDepositCheckout(bookingId),
    onSuccess: (checkout) => redirectToCheckout(checkout.checkoutUrl)
  })
  const data = booking.data
  useDocumentTitle(t(`${key}.documentTitle`, { code: data?.bookingCode ?? '' }))

  const breadcrumb = [
    { label: t(`${key}.home`), to: '/customer' },
    { label: t('customer.payment.bookings'), to: '/customer/bookings' },
    ...(data ? [{ label: data.bookingCode, to: `/customer/bookings/${bookingId}` }] : []),
    { label: t(`${key}.crumb`) }
  ]

  return (
    <div className={`${pageContainer} pt-6 pb-16 sm:pt-8`}>
      <CustomerPageHeader
        breadcrumb={breadcrumb}
        description={
          data ? t(`${key}.lead`, { code: data.bookingCode, name: data.recipientSnapshot?.fullName ?? '—' }) : undefined
        }
        title={t(`${key}.title`)}
      />

      {booking.isPending ? (
        <SkeletonGroup className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]' label={t('customer.payment.loading')}>
          <Skeleton className='h-96 rounded-2xl' />
          <Skeleton className='h-80 rounded-2xl' />
        </SkeletonGroup>
      ) : null}
      {booking.isError ? (
        <p className='rounded-xl bg-error-container p-4 text-sm text-on-error-container' role='alert'>
          {t(bookingErrorKey(booking.error))}
        </p>
      ) : null}

      {data && data.status !== 'AWAITING_INITIAL_PAYMENT' ? (
        <section className='flex flex-col items-start gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6'>
          <span className='grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-primary'>
            <Icon className='text-2xl' name='task_alt' />
          </span>
          <h2 className='text-lg font-bold text-on-surface'>{t(`${key}.notAwaiting`)}</h2>
          <p className='text-sm text-on-surface-variant'>
            {t(`${key}.notAwaitingHint`, { status: t(`booking.status.${data.status}`) })}
          </p>
          <Link
            className='inline-flex min-h-11 items-center rounded-xl border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-brand-50'
            to={`/customer/bookings/${bookingId}`}
          >
            {t('customer.payment.backToBooking')}
          </Link>
        </section>
      ) : null}

      {data && data.status === 'AWAITING_INITIAL_PAYMENT' ? (
        <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]'>
          <div className='flex min-w-0 flex-col gap-5'>
            <DepositBooking booking={data} />
            <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6'>
              <RefundPolicySummary centerId={data.centerId} />
            </section>
          </div>
          <DepositSummary
            booking={data}
            deposit={initialPaymentOf(data)}
            error={pay.isError ? t(paymentErrorKey(pay.error)) : undefined}
            onPay={() => pay.mutate()}
            paying={pay.isPending}
          />
        </div>
      ) : null}
    </div>
  )
}
