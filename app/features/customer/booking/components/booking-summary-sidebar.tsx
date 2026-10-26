import { useTranslation } from 'react-i18next'

import { bookingErrorKey, formatDateTime, formatMoney, formatClock } from '~/entities/booking/booking-format'
import { Icon } from '~/shared/ui/icon'

import type { useBookingForm } from '../hooks/use-booking-form'

type Form = ReturnType<typeof useBookingForm>
const VISIBLE_OCCURRENCES = 4

/** Live price from POST /bookings/quotes and the submit action; the client never computes the price. */
export function BookingSummarySidebar({ form }: { form: Form }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const { quote, create } = form
  const occurrences = quote.data?.occurrences ?? []

  return (
    <aside
      aria-labelledby='booking-summary-title'
      className='flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24'
    >
      <h2 className='text-lg font-bold text-on-surface' id='booking-summary-title'>
        {t('customer.booking.summary.title')}
      </h2>

      {!form.request ? (
        <p className='rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.summary.incomplete')}
        </p>
      ) : null}
      {form.request && quote.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.summary.quoting')}
        </p>
      ) : null}
      {form.request && quote.isError ? (
        <div className='rounded-lg bg-error-container/40 p-4 text-sm text-error' role='alert'>
          <p>{t(bookingErrorKey(quote.error))}</p>
          <button className='mt-2 font-semibold underline' onClick={() => void quote.refetch()} type='button'>
            {t('booking.actions.retry')}
          </button>
        </div>
      ) : null}

      {form.request && quote.isSuccess ? (
        <>
          <ul className='flex flex-col gap-3 text-sm'>
            {quote.data.lines.map((line) => (
              <li className='flex items-start justify-between gap-3' key={line.careServiceId}>
                <span className='min-w-0'>
                  <span className='block font-semibold text-on-surface'>{line.serviceName}</span>
                  <span className='block text-xs text-on-surface-variant'>
                    {t('customer.booking.summary.lineDetail', {
                      price: formatMoney(line.unitPrice, language),
                      unit: line.pricingUnit ? t(`booking.unitType.${line.pricingUnit}`) : '',
                      units: line.unitsPerOccurrence ?? 1,
                      count: line.occurrenceCount ?? 1
                    })}
                  </span>
                </span>
                <span className='shrink-0 font-semibold tabular-nums'>{formatMoney(line.lineTotal, language)}</span>
              </li>
            ))}
          </ul>

          <div className='rounded-lg bg-surface-container-low p-4 text-sm'>
            <p className='font-semibold text-on-surface'>
              {t('customer.booking.summary.occurrences', { count: occurrences.length })}
            </p>
            <ul className='mt-2 flex flex-col gap-1 text-on-surface-variant'>
              {occurrences.slice(0, VISIBLE_OCCURRENCES).map((occurrence) => (
                <li className='flex justify-between gap-3' key={occurrence.occurrenceNo ?? occurrence.startAt}>
                  <span>
                    {formatDateTime(occurrence.startAt, language)}–{formatClock(occurrence.endAt, language)}
                  </span>
                  <span className='tabular-nums'>{formatMoney(occurrence.priceAmount, language)}</span>
                </li>
              ))}
            </ul>
            {occurrences.length > VISIBLE_OCCURRENCES ? (
              <p className='mt-1 text-xs text-on-surface-variant'>
                {t('customer.booking.summary.moreOccurrences', { count: occurrences.length - VISIBLE_OCCURRENCES })}
              </p>
            ) : null}
          </div>

          <dl className='flex flex-col gap-2 text-sm'>
            <div className='flex items-baseline justify-between gap-3'>
              <dt className='font-semibold text-on-surface'>{t('customer.booking.summary.total')}</dt>
              <dd className='text-2xl font-bold text-primary tabular-nums'>
                {formatMoney(quote.data.totalAmount, language)}
              </dd>
            </div>
            {quote.data.estimatedDepositAmount !== undefined ? (
              <div className='flex justify-between gap-3 text-on-surface-variant'>
                <dt>
                  {t('customer.booking.summary.deposit', {
                    percent: new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(
                      quote.data.depositPercent ?? 0
                    )
                  })}
                </dt>
                <dd className='tabular-nums'>{formatMoney(quote.data.estimatedDepositAmount, language)}</dd>
              </div>
            ) : null}
          </dl>
        </>
      ) : null}

      {create.isError ? (
        <p className='rounded-lg bg-error-container/40 p-3 text-sm text-error' role='alert'>
          {t(bookingErrorKey(create.error))}
        </p>
      ) : null}

      <button
        className='flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50'
        disabled={!form.request || !quote.isSuccess || create.isPending}
        onClick={form.submit}
        type='button'
      >
        <Icon className='text-xl' name='send' />
        {create.isPending ? t('customer.booking.summary.submitting') : t('customer.booking.summary.submit')}
      </button>
      <p className='flex items-start gap-2 text-xs leading-5 text-on-surface-variant'>
        <Icon className='text-base text-primary' name='info' />
        {t('customer.booking.summary.nextSteps')}
      </p>
    </aside>
  )
}
