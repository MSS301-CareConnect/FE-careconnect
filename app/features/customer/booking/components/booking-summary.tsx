import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useAnimatedNumber } from '~/shared/lib/use-animated-number'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Drawer } from '~/shared/ui/drawer'
import { Icon } from '~/shared/ui/icon'
import { Skeleton } from '~/shared/ui/skeleton'

import type { BookingForm, WizardStep } from '../hooks/use-booking-form'
import { quoteFacts } from './booking-quote'
import { QuoteLines } from './quote-lines'
import { MissingHint } from './wizard-parts'

function Total({ form, large = false }: { form: BookingForm; large?: boolean }) {
  const { t } = useTranslation()
  const format = useFormat()
  const facts = quoteFacts(form)
  const shown = useAnimatedNumber(facts.total)
  if (!form.request) return null
  if (form.quote.isPending) return <Skeleton className={`${large ? 'h-8 w-40' : 'h-6 w-28'} rounded`} />
  if (form.quote.isError)
    return (
      <span className='text-sm text-error'>
        {t('customer.booking.summary.quoteError')}{' '}
        {/* The reason from BookingService (e.g. a slot outside the shift), not only "could not calculate". */}
        <span className='block'>{t(bookingErrorKey(form.quote.error))}</span>
        <button className='font-semibold underline' onClick={() => void form.quote.refetch()} type='button'>
          {t('customer.booking.summary.retry')}
        </button>
      </span>
    )
  return (
    <span
      className={`cc-flash rounded font-extrabold tracking-tight text-forest-950 tabular-nums ${large ? 'text-[1.75rem]' : 'text-lg'}`}
      key={facts.total}
    >
      {format.money(shown)}
    </span>
  )
}

/** The summary rows, the missing-items checklist and the price, shared by the sticky aside and the phone sheet. */
function SummaryBody({ form, onNavigate }: { form: BookingForm; onNavigate?: () => void }) {
  const { t } = useTranslation()
  const format = useFormat()
  const facts = quoteFacts(form)
  const services = form.offerings.data?.filter((offering) => form.services[offering.id]) ?? []
  const visitCount = facts.occurrences.length || (form.schedule.bookingType === 'RECURRING' ? form.visitCount : 0)
  const go = (step: WizardStep) => {
    form.goTo(step)
    onNavigate?.()
  }
  const missing = [
    { key: 'recipient', done: !form.issues[1] },
    { key: 'services', done: !form.issues[2] },
    { key: 'schedule', done: form.reached >= 3 && !form.issues[3] }
  ] as const

  return (
    <div className='flex flex-col gap-4'>
      <dl className='flex flex-col'>
        <SummaryRow
          disabled={form.furthest < 1}
          icon='person'
          label={t('customer.booking.summary.recipient')}
          onClick={() => go(1)}
          value={form.recipient?.fullName}
        />
        <SummaryRow
          disabled={form.furthest < 2}
          icon='medical_services'
          label={t('customer.booking.summary.services')}
          onClick={() => go(2)}
          value={services.length ? services.map((item) => item.catalogItem.name).join(', ') : undefined}
        />
        <SummaryRow
          disabled={form.furthest < 2 || services.length === 0}
          icon='badge'
          label={t('customer.booking.summary.caregiver')}
          onClick={() => go(2)}
          value={
            services.length ? (form.chosenCaregiver?.fullName ?? t('customer.booking.summary.letCenter')) : undefined
          }
        />
        <SummaryRow
          disabled={form.furthest < 3}
          icon='calendar_month'
          label={t('customer.booking.summary.schedule')}
          onClick={() => go(3)}
          value={
            form.reached >= 3
              ? [
                  t(`customer.booking.schedule.types.${form.schedule.bookingType}.title`),
                  visitCount ? t('customer.booking.summary.visits', { count: visitCount }) : null
                ]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
        />
      </dl>

      {form.request && form.quote.isSuccess && facts.lines.length > 0 ? (
        <section aria-labelledby='summary-quote-lines' className='border-t border-outline-variant pt-4'>
          <h3 className='mb-3 text-sm font-semibold text-on-surface' id='summary-quote-lines'>
            {t('customer.booking.quote.caption')}
          </h3>
          <QuoteLines compact lines={facts.lines} />
        </section>
      ) : null}

      {form.request ? (
        <div className='rounded-2xl bg-mint-50 p-4 ring-1 ring-mint-100'>
          <p className='text-xs font-semibold text-forest-700'>{t('customer.booking.summary.total')}</p>
          <div className='mt-1'>
            <Total form={form} large />
          </div>
          {form.quote.isSuccess ? (
            <dl className='mt-3 flex flex-col gap-1 text-sm'>
              {facts.payInFull ? (
                <p className='text-on-surface-variant'>{t('customer.booking.summary.payFull')}</p>
              ) : (
                <>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-on-surface-variant'>
                      {t('customer.booking.summary.deposit', { percent: facts.depositPercent })}
                    </dt>
                    <dd className='font-medium tabular-nums'>{format.money(facts.deposit)}</dd>
                  </div>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-on-surface-variant'>{t('customer.booking.summary.remaining')}</dt>
                    <dd className='font-medium tabular-nums'>{format.money(facts.remaining)}</dd>
                  </div>
                </>
              )}
              <p className='mt-1 flex items-center gap-1 text-xs text-primary'>
                <Icon className='text-sm' name='lock_clock' />
                {t('customer.booking.summary.nothingNow')}
              </p>
            </dl>
          ) : null}
        </div>
      ) : (
        <div className='rounded-2xl bg-peach-50 p-4 ring-1 ring-peach-100'>
          <p className='text-sm font-semibold text-forest-950'>{t('customer.booking.summary.missingTitle')}</p>
          <ul className='mt-2 flex flex-col gap-1.5 text-sm'>
            {missing.map((item) => (
              <li
                className={`flex items-center gap-2 ${item.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}
                key={item.key}
              >
                <Icon
                  className={`text-lg ${item.done ? 'cc-pop text-primary' : 'text-outline'}`}
                  filled={item.done}
                  name={item.done ? 'check_box' : 'check_box_outline_blank'}
                />
                {t(`customer.booking.summary.missing.${item.key}`)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SummaryRow({
  icon,
  label,
  value,
  disabled,
  onClick
}: {
  icon: string
  label: string
  value?: ReactNode
  disabled: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  const content = (
    <>
      <Icon className={`mt-0.5 text-lg ${value ? 'text-primary' : 'text-outline'}`} name={icon} />
      <span className='min-w-0 flex-1 text-left'>
        <dt className='text-xs text-on-surface-variant'>{label}</dt>
        <dd className={`text-sm ${value ? 'font-medium text-on-surface' : 'text-outline'}`}>{value ?? '—'}</dd>
      </span>
    </>
  )
  if (!value || disabled) return <div className='flex items-start gap-3 py-2.5'>{content}</div>
  return (
    <button
      aria-label={t('customer.booking.summary.edit', { section: label })}
      className='group -mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
      onClick={onClick}
      type='button'
    >
      {content}
      <Icon className='mt-1 text-base text-outline opacity-0 transition-opacity group-hover:opacity-100' name='edit' />
    </button>
  )
}

/** Desktop: sticky aside. */
export function BookingSummaryAside({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  return (
    <aside
      aria-labelledby='booking-summary-title'
      className='hidden rounded-3xl border border-forest-900/[0.06] bg-white p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24 lg:block'
    >
      <h2 className='mb-3 text-base font-bold tracking-tight text-forest-950' id='booking-summary-title'>
        {t('customer.booking.summary.title')}
      </h2>
      <SummaryBody form={form} />
    </aside>
  )
}

/** Phones: a bottom bar with the total and the step action; tapping the total opens the full summary in a sheet. */
export function BookingSummaryBar({
  form,
  actionLabel,
  onAction,
  loading
}: {
  form: BookingForm
  actionLabel: string
  onAction: () => void
  loading: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const hintId = 'booking-bar-hint'

  return (
    <>
      <div className='fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container-lowest/95 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgb(16_24_20/0.06)] backdrop-blur-md lg:hidden'>
        <div className='mb-1.5 min-h-5'>
          <MissingHint id={hintId} reason={form.stepIssue} />
        </div>
        <div className='flex items-center gap-3'>
          <button
            aria-haspopup='dialog'
            className='flex min-h-12 min-w-0 flex-1 flex-col items-start justify-center rounded-lg text-left focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => setOpen(true)}
            type='button'
          >
            <span className='flex items-center gap-1 text-xs text-on-surface-variant'>
              {t('customer.booking.summary.total')}
              <Icon className='text-sm' name='expand_less' />
            </span>
            {form.request ? (
              <Total form={form} />
            ) : (
              <span className='text-sm font-medium text-primary'>{t('customer.booking.summary.open')}</span>
            )}
          </button>
          <Button
            aria-describedby={form.stepIssue ? hintId : undefined}
            disabled={Boolean(form.stepIssue)}
            loading={loading}
            loadingLabel={t('customer.booking.nav.submitting')}
            onClick={onAction}
            size='lg'
          >
            {actionLabel}
          </Button>
        </div>
      </div>
      <Drawer onClose={() => setOpen(false)} open={open} placement='bottom' title={t('customer.booking.summary.title')}>
        <SummaryBody form={form} onNavigate={() => setOpen(false)} />
      </Drawer>
    </>
  )
}
