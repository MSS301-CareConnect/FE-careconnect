import { useTranslation } from 'react-i18next'

import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { StickyActionBar } from '../../ui/action-bits'
import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { AnswerDeadline } from './answer-deadline'

const heading = 'text-sm font-semibold text-on-surface-variant'

/** Who booked and where (area only), the customer's note. */
export function RequestCustomer({ request, area }: { request: CaregiverBookingRequestRecord; area: string }) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby='request-customer' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className={heading} id='request-customer'>
        {t('caregiver.requests.detail.customer.title')}
      </h2>
      <dl className='mt-2 flex flex-col gap-3 text-sm'>
        <div>
          <dt className='text-xs text-on-surface-variant'>{t('caregiver.requests.detail.customer.name')}</dt>
          <dd className='mt-0.5 text-[15px] font-semibold text-on-surface'>
            {request.customerName || t('caregiver.requests.detail.customer.nameUnknown')}
          </dd>
        </div>
        {area ? (
          <div>
            <dt className='text-xs text-on-surface-variant'>{t('caregiver.requests.detail.customer.area')}</dt>
            <dd className='mt-0.5 flex items-start gap-1 text-on-surface'>
              <Icon className='text-base text-primary' name='location_on' />
              {area}
            </dd>
          </div>
        ) : null}
        {request.customerNote ? (
          <div>
            <dt className='text-xs text-on-surface-variant'>{t('caregiver.requests.note')}</dt>
            <dd className='mt-1 rounded-lg bg-surface-container-low p-2.5 whitespace-pre-line text-on-surface'>
              {request.customerNote}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className='mt-3 flex items-start gap-1.5 text-xs text-on-surface-variant'>
        <Icon className='text-sm' name='lock' />
        {t('caregiver.requests.detail.customer.contactLocked')}
      </p>
    </section>
  )
}

/** Booked services with plan, unit price × quantity and line total, then the booking value. */
export function RequestPricing({ request }: { request: CaregiverBookingRequestRecord }) {
  const { t } = useTranslation()
  const money = useFormat().money
  return (
    <section aria-labelledby='request-pricing' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className={heading} id='request-pricing'>
        {t('caregiver.requests.detail.pricing.title')}
      </h2>
      <ul className='mt-2 divide-y divide-outline-variant'>
        {(request.services ?? []).map((item) => (
          <li className='flex items-start justify-between gap-3 py-2.5 text-sm' key={item.id}>
            <span className='min-w-0'>
              <span className='block font-semibold text-on-surface'>{item.serviceName}</span>
              <span className='block text-xs text-on-surface-variant'>
                {[
                  item.planName ? t('caregiver.requests.detail.pricing.plan', { name: item.planName }) : null,
                  item.unitType ? t(`booking.unitType.${item.unitType}`) : null
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              {item.unitPrice !== undefined && item.quantity !== undefined ? (
                <span className='block text-xs text-on-surface-variant tabular-nums'>
                  {t('caregiver.requests.detail.pricing.line', {
                    price: money(item.unitPrice),
                    quantity: item.quantity
                  })}
                </span>
              ) : null}
            </span>
            <span className='shrink-0 font-semibold text-on-surface tabular-nums'>
              {item.totalPrice !== undefined ? money(item.totalPrice) : ''}
            </span>
          </li>
        ))}
      </ul>
      <p className='mt-1 flex items-baseline justify-between gap-3 border-t border-outline-variant pt-3'>
        <span className='text-sm font-semibold text-on-surface'>{t('caregiver.requests.detail.pricing.total')}</span>
        <span className='text-lg font-bold text-primary tabular-nums'>
          {request.totalAmount !== undefined ? money(request.totalAmount) : '—'}
        </span>
      </p>
    </section>
  )
}

/** Deadline, what each answer leads to, and the two buttons (a sticky bar on phones). */
export function RequestAnswer({
  request,
  now,
  busy,
  onAccept,
  onDecline
}: {
  request: CaregiverBookingRequestRecord
  now: number
  busy: boolean
  onAccept: () => void
  onDecline: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  return (
    <section aria-labelledby='request-answer' className={`${cgCard} border-brand-200 p-4 sm:p-5`}>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-base font-semibold text-on-surface' id='request-answer'>
          {t('caregiver.requests.detail.answer.title')}
        </h2>
        <AnswerDeadline dueAt={request.acceptanceDueAt} now={now} />
      </div>
      {request.acceptanceDueAt ? (
        <p className='mt-1 text-sm text-on-surface-variant tabular-nums'>
          {t('caregiver.requests.detail.answer.deadline', { time: format.shortDateTime(request.acceptanceDueAt) })}
        </p>
      ) : null}
      <ul className='mt-3 flex flex-col gap-1.5 text-sm text-on-surface'>
        <li className='flex items-start gap-2'>
          <Icon className='text-base text-success' name='check_circle' />
          {t('caregiver.requests.detail.answer.acceptHint')}
        </li>
        <li className='flex items-start gap-2'>
          <Icon className='text-base text-on-surface-variant' name='cancel' />
          {request.bookingType === 'SHIFT'
            ? t('caregiver.requests.detail.answer.declineShift')
            : t('caregiver.requests.detail.answer.declineCenter')}
        </li>
      </ul>
      <div className='lg:mt-4 lg:[&>div>div>*]:flex-1'>
        <StickyActionBar>
          <Button disabled={busy} onClick={onDecline} variant='outline'>
            {t('caregiver.requests.decline')}
          </Button>
          <Button leftIcon={<Icon className='text-lg' name='check' />} loading={busy} onClick={onAccept}>
            {t('caregiver.requests.accept')}
          </Button>
        </StickyActionBar>
      </div>
    </section>
  )
}
