import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Button } from '~/shared/ui/button'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import type { BookingForm, WizardStep } from '../hooks/use-booking-form'
import { quoteFacts } from './booking-quote'
import { NextSteps } from './next-steps'
import { QuoteLines } from './quote-lines'

const VISIBLE_VISITS = 5

export function StepReview({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [allVisits, setAllVisits] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  const facts = quoteFacts(form)
  const policy = form.policy.data
  const visits = allVisits ? facts.occurrences : facts.occurrences.slice(0, VISIBLE_VISITS)
  const serviceNames = form.offerings.data?.filter((offering) => form.services[offering.id]) ?? []

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h2 className='text-lg font-semibold text-on-surface'>{t('customer.booking.review.title')}</h2>
        <p className='mt-0.5 text-sm text-on-surface-variant'>{t('customer.booking.review.description')}</p>
      </div>

      <dl className='divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest'>
        <ReviewRow label={t('customer.booking.steps.recipient')} onEdit={() => form.goTo(1)} step={1}>
          {form.recipient?.fullName}
        </ReviewRow>
        <ReviewRow label={t('customer.booking.summary.services')} onEdit={() => form.goTo(2)} step={2}>
          <ul className='flex flex-col gap-1'>
            {serviceNames.map((offering) => {
              const plan = form.plansByOffering[offering.id]?.plans.find(
                (item) => item.id === form.services[offering.id].pricePlanId
              )
              return (
                <li key={offering.id}>
                  <span className='font-medium'>{offering.catalogItem.name}</span>
                  {plan ? (
                    <span className='text-on-surface-variant'>
                      {' · '}
                      {plan.planName}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </ReviewRow>
        <ReviewRow label={t('customer.booking.summary.caregiver')} onEdit={() => form.goTo(2)} step={2}>
          {form.chosenCaregiver?.fullName ?? t('customer.booking.summary.letCenter')}
        </ReviewRow>
        <ReviewRow label={t('customer.booking.summary.schedule')} onEdit={() => form.goTo(3)} step={3}>
          <p>
            {t(`customer.booking.schedule.types.${form.schedule.bookingType}.title`)}
            {facts.occurrences.length > 0
              ? ` · ${t('customer.booking.summary.visits', { count: facts.occurrences.length })}`
              : ''}
          </p>
          {visits.length > 0 ? (
            <ul className='mt-2 flex flex-col gap-1 text-sm text-on-surface-variant tabular-nums'>
              {visits.map((visit, index) => (
                <li key={`${visit.startAt}-${index}`}>{format.visitRange(visit.startAt, visit.endAt)}</li>
              ))}
            </ul>
          ) : null}
          {facts.occurrences.length > VISIBLE_VISITS ? (
            <button
              className='mt-1 text-sm font-medium text-primary hover:underline'
              onClick={() => setAllVisits((value) => !value)}
              type='button'
            >
              {allVisits
                ? t('customer.booking.review.showLess')
                : t('customer.booking.review.showAll', { count: facts.occurrences.length })}
            </button>
          ) : null}
        </ReviewRow>
        <ReviewRow label={t('customer.booking.schedule.note')} onEdit={() => form.goTo(3)} step={3}>
          {form.customerNote.trim() ? (
            <span className='whitespace-pre-line'>{form.customerNote.trim()}</span>
          ) : (
            <span className='text-on-surface-variant'>{t('customer.booking.review.noNote')}</span>
          )}
        </ReviewRow>
      </dl>

      <section
        aria-labelledby='review-price'
        className='rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5'
      >
        <h3 className='font-semibold text-on-surface' id='review-price'>
          {t('customer.booking.review.priceTitle')}
        </h3>
        {form.quote.isPending ? (
          <SkeletonGroup className='mt-3 space-y-2' label={t('customer.booking.summary.quoting')}>
            <Skeleton className='h-4 w-full rounded' />
            <Skeleton className='h-4 w-2/3 rounded' />
          </SkeletonGroup>
        ) : form.quote.isError ? (
          <div className='mt-3 rounded-lg bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            <p>{t(bookingErrorKey(form.quote.error))}</p>
            <button className='mt-1 font-semibold underline' onClick={() => void form.quote.refetch()} type='button'>
              {t('customer.booking.summary.retry')}
            </button>
          </div>
        ) : (
          <>
            <div className='mt-3'>
              <QuoteLines lines={facts.lines} />
            </div>
            <dl className='mt-4 flex flex-col gap-2 border-t border-outline-variant pt-4 text-sm'>
              <div className='flex justify-between gap-4 text-base font-semibold text-on-surface'>
                <dt>{t('customer.booking.review.total')}</dt>
                <dd className='tabular-nums'>{format.money(facts.total)}</dd>
              </div>
              {facts.payInFull ? (
                <div className='flex justify-between gap-4 text-on-surface-variant'>
                  <dt>{t('customer.booking.review.payFullAfter')}</dt>
                  <dd className='tabular-nums'>{format.money(facts.total)}</dd>
                </div>
              ) : (
                <>
                  <div className='flex justify-between gap-4 text-on-surface'>
                    <dt>{t('customer.booking.review.depositNow', { percent: facts.depositPercent })}</dt>
                    <dd className='tabular-nums'>{format.money(facts.deposit)}</dd>
                  </div>
                  <div className='flex justify-between gap-4 text-on-surface-variant'>
                    <dt>
                      {facts.remainingDue
                        ? t('customer.booking.review.remainingDue', { time: format.dateTime(facts.remainingDue) })
                        : t('customer.booking.review.remainingLater')}
                    </dt>
                    <dd className='tabular-nums'>{format.money(facts.remaining)}</dd>
                  </div>
                </>
              )}
            </dl>
            <p className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-primary'>
              <Icon className='text-base' name='lock_clock' />
              {t('customer.booking.review.nothingNow')}
            </p>
          </>
        )}
      </section>

      <section
        aria-labelledby='review-next'
        className='rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5'
      >
        <h3 className='font-semibold text-on-surface' id='review-next'>
          {t('customer.booking.review.nextTitle')}
        </h3>
        <NextSteps assign={!form.selectedCaregiverId} confirmMinutes={policy?.confirmationTimeoutMinutes} />
      </section>

      <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary'>
        <input
          checked={form.agreed}
          className='mt-0.5 h-5 w-5 shrink-0 accent-primary'
          onChange={(event) => form.setAgreed(event.target.checked)}
          type='checkbox'
        />
        <span className='text-sm text-on-surface'>
          {t('customer.booking.review.agreePrefix')}{' '}
          <button
            className='font-semibold text-primary underline underline-offset-2'
            onClick={(event) => {
              event.preventDefault()
              setPolicyOpen(true)
            }}
            type='button'
          >
            {t('customer.booking.review.policyLink')}
          </button>
        </span>
      </label>

      {form.create.isError ? (
        <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
          {t(bookingErrorKey(form.create.error))}
        </p>
      ) : null}

      <Modal
        footer={<Button onClick={() => setPolicyOpen(false)}>{t('customer.booking.review.policy.close')}</Button>}
        onClose={() => setPolicyOpen(false)}
        open={policyOpen}
        title={t('customer.booking.review.policy.title')}
      >
        <ul className='flex list-disc flex-col gap-2 pl-5 leading-6'>
          {policy ? (
            <>
              <li>
                {t('customer.booking.review.policy.before', {
                  duration: format.duration(policy.refundThresholdMinutes),
                  percent: policy.refundPercentBeforeThreshold
                })}
              </li>
              <li>{t('customer.booking.review.policy.after', { percent: policy.refundPercentAfterThreshold })}</li>
              <li>{t('customer.booking.review.policy.overdue', { percent: policy.overduePaymentForfeitPercent })}</li>
            </>
          ) : null}
          <li>{t('customer.booking.review.policy.center')}</li>
        </ul>
      </Modal>
    </div>
  )
}

function ReviewRow({
  label,
  step,
  onEdit,
  children
}: {
  label: string
  step: WizardStep
  onEdit: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className='flex items-start gap-4 px-4 py-3.5 sm:px-5' data-step={step}>
      <div className='min-w-0 flex-1'>
        <dt className='text-xs font-medium text-on-surface-variant'>{label}</dt>
        <dd className='mt-0.5 text-sm text-on-surface'>{children}</dd>
      </div>
      <button
        aria-label={t('customer.booking.summary.edit', { section: label })}
        className='shrink-0 rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
        onClick={onEdit}
        type='button'
      >
        {t('customer.booking.review.edit')}
      </button>
    </div>
  )
}
