import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey, bookingTypeKey } from '~/entities/booking/booking-format'
import { useServiceCenter } from '~/entities/care-center/care-center-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { PaymentRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Skeleton } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import './payment-invoice.css'

const key = 'customer.payments.invoice' as const
const cell = 'px-3 py-2.5 align-top'
const head = 'px-3 py-2 text-xs font-semibold whitespace-nowrap text-on-surface-variant'

/** Short document number from the payment: readable on paper, unique enough to quote to support. */
export function invoiceNumber(payment: Pick<PaymentRecord, 'id' | 'paymentType'>) {
  return `HD-${payment.paymentType === 'DEPOSIT' ? 'D' : 'R'}-${payment.id.slice(0, 8).toUpperCase()}`
}

function Meta({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className='flex justify-between gap-4 py-1 sm:block'>
      <dt className='text-xs text-on-surface-variant'>{label}</dt>
      <dd className='text-right font-semibold text-on-surface tabular-nums sm:mt-0.5 sm:text-left'>{value || '—'}</dd>
    </div>
  )
}

/**
 * Invoice of one successful payment, for the customer to check against the booking: the center (seller), the
 * customer, the document facts, every service of the booking with plan, duration, unit price, quantity and line
 * total (BookingService keeps these as a snapshot of the booking time), then what this payment covered and what was
 * refunded. Printable ("Print / save PDF" prints only the invoice).
 */
export function PaymentInvoiceDialog({ payment, onClose }: { payment: PaymentRecord; onClose: () => void }) {
  const { t } = useTranslation()
  const format = useFormat()
  const booking = useQuery({
    queryKey: bookingKeys.detail(payment.bookingId),
    queryFn: () => fetchBooking(payment.bookingId),
    retry: false
  })
  const center = useServiceCenter(booking.data?.centerId)
  const authUser = useAuthUser()
  const data = booking.data
  // BookingService leaves `customer` out for the customer's own booking: the buyer is the signed-in customer.
  const buyer = data?.customer ?? authUser
  const services = data?.services ?? []
  const subtotal = data?.subtotal ?? services.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)
  const total = data?.totalAmount ?? subtotal
  const refunded = payment.refundedAmount ?? 0
  const fullyRefunded = refunded > 0 && refunded >= payment.amount

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} variant='outline'>
            {t(`${key}.close`)}
          </Button>
          <Button disabled={!data} leftIcon={<Icon name='print' />} onClick={() => window.print()}>
            {t(`${key}.print`)}
          </Button>
        </>
      }
      onClose={onClose}
      open
      size='xl'
      title={t(`${key}.title`)}
    >
      {booking.isPending ? (
        <div aria-label={t('customer.payments.loading')} className='space-y-3' role='status'>
          <Skeleton className='h-20 w-full rounded-2xl' />
          <Skeleton className='h-40 w-full rounded-2xl' />
        </div>
      ) : booking.isError || !data ? (
        <ErrorState message={t(bookingErrorKey(booking.error))} onRetry={() => void booking.refetch()} />
      ) : (
        <article className='cc-invoice-print space-y-5 text-sm text-on-surface'>
          <header className='flex flex-wrap items-start justify-between gap-4'>
            <div className='min-w-0'>
              <p className='text-xs font-bold tracking-wide text-forest-700 uppercase'>{t(`${key}.seller`)}</p>
              <p className='mt-1 text-lg font-bold text-forest-950'>{center.data?.name ?? t('common.brand')}</p>
              {center.data?.address ? <p className='text-on-surface-variant'>{center.data.address}</p> : null}
              {center.data?.phoneNumber ? (
                <p className='text-on-surface-variant tabular-nums'>{center.data.phoneNumber}</p>
              ) : null}
            </div>
            <div className='text-right'>
              <p className='text-xl font-extrabold tracking-tight text-forest-950 uppercase'>{t(`${key}.heading`)}</p>
              <p className='mt-1 font-mono text-sm tabular-nums'>{invoiceNumber(payment)}</p>
              <p
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold uppercase ${fullyRefunded ? 'border-error text-error' : refunded > 0 ? 'border-warning text-warning' : 'border-success text-success'}`}
              >
                <Icon className='text-base' name={refunded > 0 ? 'undo' : 'verified'} />
                {fullyRefunded
                  ? t(`${key}.stamp.refunded`)
                  : refunded > 0
                    ? t(`${key}.stamp.partlyRefunded`)
                    : t(`${key}.stamp.paid`)}
              </p>
            </div>
          </header>

          <dl className='grid gap-x-6 gap-y-2 rounded-2xl bg-mint-50/70 p-4 sm:grid-cols-3'>
            <Meta label={t(`${key}.paidAt`)} value={format.dateTime(payment.paidAt ?? payment.createdAt)} />
            <Meta label={t(`${key}.method`)} value={t('customer.payments.method')} />
            <Meta label={t(`${key}.paymentType`)} value={t(`payment.type.${payment.paymentType}`)} />
            <Meta label={t(`${key}.bookingCode`)} value={`#${data.bookingCode}`} />
            <Meta label={t(`${key}.bookingType`)} value={t(bookingTypeKey(data))} />
            <Meta
              label={t(`${key}.carePeriod`)}
              value={
                data.endDate && data.endDate !== data.startDate
                  ? `${format.date(data.startDate)} – ${format.date(data.endDate)}`
                  : format.date(data.startDate)
              }
            />
            <Meta label={t(`${key}.buyer`)} value={[buyer?.fullName, buyer?.phoneNumber].filter(Boolean).join(' · ')} />
            <Meta label={t(`${key}.recipient`)} value={data.recipientSnapshot?.fullName} />
            <Meta label={t(`${key}.address`)} value={data.serviceAddress} />
          </dl>

          <div className='overflow-x-auto rounded-2xl border border-outline-variant/60'>
            <table className='w-full min-w-[640px] text-left'>
              <caption className='sr-only'>{t(`${key}.linesCaption`)}</caption>
              <thead className='border-b border-outline-variant/60 bg-surface-container-low'>
                <tr>
                  <th className={`${head} w-10`} scope='col'>
                    {t(`${key}.columns.no`)}
                  </th>
                  <th className={head} scope='col'>
                    {t(`${key}.columns.service`)}
                  </th>
                  <th className={head} scope='col'>
                    {t(`${key}.columns.duration`)}
                  </th>
                  <th className={`${head} text-right`} scope='col'>
                    {t(`${key}.columns.unitPrice`)}
                  </th>
                  <th className={`${head} text-right`} scope='col'>
                    {t(`${key}.columns.quantity`)}
                  </th>
                  <th className={`${head} text-right`} scope='col'>
                    {t(`${key}.columns.amount`)}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/40'>
                {services.map((service, index) => {
                  const quantity = service.quantity ?? 1
                  const unit = service.unitType ? t(`${key}.units.${service.unitType}`) : ''
                  return (
                    <tr key={service.id}>
                      <td className={`${cell} tabular-nums`}>{index + 1}</td>
                      <td className={cell}>
                        <span className='block font-semibold'>{service.serviceName}</span>
                        {service.planName ? (
                          <span className='block text-xs text-on-surface-variant'>{service.planName}</span>
                        ) : null}
                      </td>
                      <td className={`${cell} tabular-nums`}>
                        {service.planDurationMinutes ? (
                          <>
                            {format.duration(service.planDurationMinutes * quantity)}
                            {quantity > 1 ? (
                              <span className='block text-xs text-on-surface-variant'>
                                {t(`${key}.perUnit`, { duration: format.duration(service.planDurationMinutes), unit })}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={`${cell} text-right tabular-nums`}>
                        {format.money(service.unitPrice)}
                        {unit ? <span className='text-xs text-on-surface-variant'> / {unit}</span> : null}
                      </td>
                      <td className={`${cell} text-right tabular-nums`}>{quantity}</td>
                      <td className={`${cell} text-right font-semibold tabular-nums`}>
                        {format.money(service.totalPrice)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <dl className='ml-auto flex w-full max-w-sm flex-col gap-2'>
            {subtotal !== total ? (
              <div className='flex justify-between gap-4 text-on-surface-variant'>
                <dt>{t(`${key}.subtotal`)}</dt>
                <dd className='tabular-nums'>{format.money(subtotal)}</dd>
              </div>
            ) : null}
            <div className='flex justify-between gap-4 text-on-surface-variant'>
              <dt>{t(`${key}.bookingTotal`)}</dt>
              <dd className='font-semibold text-on-surface tabular-nums'>{format.money(total)}</dd>
            </div>
            <div className='flex justify-between gap-4 border-t border-dashed border-outline-variant pt-2 text-base font-bold text-forest-950'>
              <dt>
                {t(`${key}.thisPayment`)}
                <span className='block text-xs font-normal text-on-surface-variant'>
                  {payment.paymentType === 'DEPOSIT' && data.initialPaymentPercent && data.initialPaymentPercent < 100
                    ? t(`${key}.depositHint`, { percent: data.initialPaymentPercent })
                    : t(`payment.type.${payment.paymentType}`)}
                </span>
              </dt>
              <dd className='tabular-nums'>{format.money(payment.amount)}</dd>
            </div>
            {refunded > 0 ? (
              <>
                <div className='flex justify-between gap-4 text-on-surface-variant'>
                  <dt>{t(`${key}.refunded`)}</dt>
                  <dd className='tabular-nums'>−{format.money(refunded)}</dd>
                </div>
                <div className='flex justify-between gap-4 font-semibold'>
                  <dt>{t(`${key}.net`)}</dt>
                  <dd className='tabular-nums'>{format.money(payment.amount - refunded)}</dd>
                </div>
              </>
            ) : null}
          </dl>
          <p className='text-xs text-on-surface-variant'>{t(`${key}.note`)}</p>
        </article>
      )}
    </Modal>
  )
}
