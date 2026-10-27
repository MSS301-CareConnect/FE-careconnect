import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { bookingKeys, fetchBooking } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatDateTime, formatDay, formatMoney, shortTime } from '~/entities/booking/booking-format'
import { paymentErrorKey, startDepositPayment } from '~/entities/payment/payment-api'
import type { DepositPaymentRequestBankCode } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { PaymentShell, paymentPanel, primaryAction, secondaryAction } from './components/payment-shell'

const METHODS = ['VNPAYQR', 'VNBANK', 'INTCARD'] as const satisfies readonly DepositPaymentRequestBankCode[]
const METHOD_ICONS: Record<(typeof METHODS)[number], string> = {
  VNPAYQR: 'qr_code_2',
  VNBANK: 'account_balance',
  INTCARD: 'credit_card'
}

/** Opens a deposit session for a booking awaiting its deposit and hands over to the payment gateway. */
export function DepositPage({ bookingId }: { bookingId: string }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const navigate = useNavigate()
  const [method, setMethod] = useState<(typeof METHODS)[number]>('VNPAYQR')
  // A retry of the same request reuses its key, so a double click returns the session already opened.
  const idempotency = useRef<{ method: string; key: string } | null>(null)
  const booking = useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => fetchBooking(bookingId),
    retry: false
  })
  const pay = useMutation({
    mutationFn: () => {
      if (idempotency.current?.method !== method) idempotency.current = { method, key: crypto.randomUUID() }
      return startDepositPayment({ bookingId, bankCode: method }, idempotency.current.key)
    },
    onSuccess: (session) => {
      // The real PaymentService returns the VNPay page; the dev demo returns a route of this app.
      if (session.paymentUrl.startsWith('/')) navigate(session.paymentUrl)
      else window.location.assign(session.paymentUrl)
    }
  })
  useDocumentTitle(t('customer.payment.deposit.documentTitle', { code: booking.data?.bookingCode ?? '' }))

  const data = booking.data
  return (
    <PaymentShell
      bookingCode={data?.bookingCode}
      bookingId={bookingId}
      crumb={t('customer.payment.deposit.crumb')}
      subtitle={t('customer.payment.deposit.subtitle')}
      title={t('customer.payment.deposit.title')}
    >
      {booking.isPending ? (
        <p className='text-sm text-[#637469]' role='status'>
          {t('customer.payment.loading')}
        </p>
      ) : null}
      {booking.isError ? (
        <p className='rounded-xl bg-[#fdecea] p-4 text-sm text-[#93000a]' role='alert'>
          {t(bookingErrorKey(booking.error))}
        </p>
      ) : null}

      {data && data.status !== 'AWAITING_DEPOSIT' ? (
        <section className={`${paymentPanel} flex flex-col items-start gap-3`}>
          <h2 className='text-xl font-bold'>{t('customer.payment.deposit.notAwaiting')}</h2>
          <p className='text-sm text-[#5e7063]'>
            {t('customer.payment.deposit.notAwaitingHint', { status: t(`booking.status.${data.status}`) })}
          </p>
          <Link className={secondaryAction} to={`/customer/bookings/${bookingId}`}>
            {t('customer.payment.backToBooking')}
          </Link>
        </section>
      ) : null}

      {data && data.status === 'AWAITING_DEPOSIT' ? (
        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8'>
          <section aria-labelledby='deposit-method' className={paymentPanel}>
            <h2 className='flex items-center gap-2 text-lg font-bold' id='deposit-method'>
              <Icon className='text-[22px] text-[#075b31]' name='payments' />
              {t('customer.payment.deposit.method')}
            </h2>
            <p className='mt-1 text-sm leading-6 text-[#637469]'>{t('customer.payment.deposit.methodHint')}</p>
            <fieldset className='mt-5'>
              <legend className='sr-only'>{t('customer.payment.deposit.method')}</legend>
              <div className='flex flex-col gap-3'>
                {METHODS.map((item) => {
                  const checked = method === item
                  return (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-[#075b31] ${checked ? 'border-[#075b31] bg-[#eef5ee]' : 'border-[#dbe4db] bg-white hover:border-[#a8c2ad]'}`}
                      key={item}
                    >
                      <input
                        checked={checked}
                        className='sr-only'
                        name='method'
                        onChange={() => setMethod(item)}
                        type='radio'
                      />
                      <Icon className='text-2xl text-[#075b31]' name={METHOD_ICONS[item]} />
                      <span className='flex-1 font-semibold'>{t(`customer.payment.deposit.methods.${item}`)}</span>
                      <Icon
                        className={checked ? 'text-[#075b31]' : 'text-[#a8b8ab]'}
                        filled={checked}
                        name={checked ? 'radio_button_checked' : 'radio_button_unchecked'}
                      />
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <p className='mt-5 flex items-start gap-2 rounded-xl bg-[#f5f9f4] p-4 text-sm leading-6 text-[#526a57]'>
              <Icon className='text-lg text-[#075b31]' name='verified_user' />
              {t('customer.payment.deposit.policy')}
            </p>
          </section>

          <aside aria-labelledby='deposit-summary' className={`${paymentPanel} flex flex-col gap-5 lg:sticky lg:top-6`}>
            <div>
              <h2 className='text-sm font-semibold text-[#5e7063]' id='deposit-summary'>
                {t('customer.payment.deposit.amountLabel')}
              </h2>
              <p className='mt-1 text-4xl font-extrabold tracking-[-0.045em] text-[#075b31] tabular-nums'>
                {formatMoney(data.depositAmount, language)}
              </p>
              {data.depositDueAt ? (
                <p className='mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#8a5a00]'>
                  <Icon className='text-lg' name='schedule' />
                  {t('customer.payment.deposit.dueAt', { time: formatDateTime(data.depositDueAt, language) })}
                </p>
              ) : null}
            </div>

            <dl className='flex flex-col gap-2.5 rounded-xl bg-[#f5f9f4] p-4 text-sm'>
              <div className='flex justify-between gap-3'>
                <dt className='text-[#637469]'>{t('customer.payment.deposit.patient')}</dt>
                <dd className='text-right font-semibold'>{data.recipientSnapshot?.fullName ?? '—'}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-[#637469]'>{t('customer.payment.deposit.schedule')}</dt>
                <dd className='text-right font-semibold'>
                  {formatDay(data.startDate, language)}
                  {data.endDate && data.endDate !== data.startDate ? ` – ${formatDay(data.endDate, language)}` : ''}
                  <span className='block font-normal text-[#637469]'>
                    {shortTime(data.startTime)}–{shortTime(data.endTime)}
                  </span>
                </dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-[#637469]'>{t('customer.payment.deposit.visits')}</dt>
                <dd className='font-semibold tabular-nums'>{data.occurrences?.length ?? 0}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-[#637469]'>{t('customer.payment.deposit.total')}</dt>
                <dd className='font-semibold tabular-nums'>{formatMoney(data.totalAmount, language)}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-[#637469]'>{t('customer.payment.deposit.remaining')}</dt>
                <dd className='font-semibold tabular-nums'>
                  {formatMoney(Math.max(0, (data.totalAmount ?? 0) - (data.depositAmount ?? 0)), language)}
                </dd>
              </div>
            </dl>

            {pay.isError ? (
              <p className='rounded-xl bg-[#fdecea] p-3 text-sm text-[#93000a]' role='alert'>
                {t(paymentErrorKey(pay.error))}
              </p>
            ) : null}
            <button className={primaryAction} disabled={pay.isPending} onClick={() => pay.mutate()} type='button'>
              {pay.isPending
                ? t('customer.payment.deposit.paying')
                : t('customer.payment.deposit.pay', { amount: formatMoney(data.depositAmount, language) })}
              <Icon
                className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                name='arrow_forward'
              />
            </button>
            <Link
              className='text-center text-sm font-bold text-[#075b31] underline-offset-4 hover:underline'
              to={`/customer/bookings/${bookingId}`}
            >
              {t('customer.payment.backToBooking')}
            </Link>
          </aside>
        </div>
      ) : null}
    </PaymentShell>
  )
}
