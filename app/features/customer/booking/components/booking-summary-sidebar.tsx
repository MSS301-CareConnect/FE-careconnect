import { useTranslation } from 'react-i18next'

import { bookingErrorKey, formatClock, formatDateTime, formatMoney } from '~/entities/booking/booking-format'
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
  const caregiver = form.centerCaregivers.find((item) => item.id === form.selectedCaregiverId)

  return (
    <aside
      aria-labelledby='booking-summary-title'
      className='flex flex-col gap-5 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6 lg:sticky lg:top-24'
    >
      <h2 className='text-xl font-bold tracking-[-0.03em] text-on-surface' id='booking-summary-title'>
        {t('customer.booking.summary.title')}
      </h2>

      {form.centerId ? (
        <dl className='flex flex-col gap-2 rounded-xl bg-surface-container-low p-4 text-sm'>
          <div className='flex items-start gap-2'>
            <Icon className='text-lg text-primary' name='home_health' />
            <dt className='sr-only'>{t('customer.booking.provider.center')}</dt>
            <dd className='font-semibold text-on-surface'>
              {form.centerName ?? t('customer.booking.provider.centerFallback')}
            </dd>
          </div>
          <div className='flex items-start gap-2'>
            <Icon className='text-lg text-primary' name='person' />
            <dt className='sr-only'>{t('customer.booking.provider.caregiver')}</dt>
            <dd className='text-on-surface-variant'>
              {caregiver?.fullName ?? t('customer.booking.provider.letCenterAssign')}
            </dd>
          </div>
        </dl>
      ) : null}

      {!form.request ? (
        <p className='text-sm leading-6 text-on-surface-variant'>{t('customer.booking.summary.incomplete')}</p>
      ) : null}
      {form.request && quote.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.summary.quoting')}
        </p>
      ) : null}
      {form.request && quote.isError ? (
        <div
          className='rounded-xl border border-error/25 bg-error-container p-4 text-sm text-on-error-container'
          role='alert'
        >
          <p>{t(bookingErrorKey(quote.error))}</p>
          <button className='mt-2 font-bold underline' onClick={() => void quote.refetch()} type='button'>
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
                  <span className='block text-xs text-on-surface-variant tabular-nums'>
                    {t('customer.booking.summary.lineDetail', {
                      price: formatMoney(line.unitPrice, language),
                      unit: line.pricingUnit ? t(`booking.unitType.${line.pricingUnit}`) : '',
                      units: line.unitsPerOccurrence ?? 1,
                      count: line.occurrenceCount ?? 1
                    })}
                  </span>
                </span>
                <span className='shrink-0 font-semibold tabular-nums text-on-surface'>
                  {formatMoney(line.lineTotal, language)}
                </span>
              </li>
            ))}
          </ul>

          <div className='text-sm'>
            <p className='font-semibold text-on-surface'>
              {t('customer.booking.summary.occurrences', { count: occurrences.length })}
            </p>
            <ul className='mt-2 flex flex-col gap-1 text-on-surface-variant tabular-nums'>
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

          <dl className='flex flex-col gap-2 border-t border-outline-variant/40 pt-4 text-sm'>
            <div className='flex items-baseline justify-between gap-3'>
              <dt className='font-semibold text-on-surface'>{t('customer.booking.summary.total')}</dt>
              <dd className='text-3xl font-extrabold tracking-[-0.04em] text-primary tabular-nums'>
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
        <p
          className='rounded-xl border border-error/25 bg-error-container p-3 text-sm text-on-error-container'
          role='alert'
        >
          {t(bookingErrorKey(create.error))}
        </p>
      ) : null}

      <button
        className='group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-xs transition-[transform,background-color] duration-300 hover:bg-primary-container active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-outline disabled:active:scale-100'
        disabled={!form.request || !quote.isSuccess || create.isPending || form.hasDebt}
        onClick={form.submit}
        type='button'
      >
        {create.isPending ? t('customer.booking.summary.submitting') : t('customer.booking.summary.submit')}
        <Icon className='text-lg transition-transform duration-300 group-hover:translate-x-1' name='arrow_forward' />
      </button>
      <p className='text-xs leading-5 text-on-surface-variant'>{t('customer.booking.summary.nextSteps')}</p>
    </aside>
  )
}
