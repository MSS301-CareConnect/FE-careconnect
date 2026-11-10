import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

/**
 * "What happens next" (2026-11-09): every booking is held 5 minutes right after sending → the customer pays the first
 * part → (a caregiver is assigned, when none was chosen or picked yet) → care begins. No center confirmation step.
 */
export function NextSteps({ assign }: { assign: boolean }) {
  const { t } = useTranslation()
  const steps = [
    {
      icon: 'timer',
      title: t('customer.booking.review.next.held'),
      hint: t('customer.booking.review.next.heldHint')
    },
    {
      icon: 'credit_card',
      title: t('customer.booking.review.next.pay'),
      hint: t('customer.booking.review.next.payHint')
    },
    ...(assign
      ? [
          {
            icon: 'person_check',
            title: t('customer.booking.review.next.assign'),
            hint: t('customer.booking.review.next.assignHint')
          }
        ]
      : []),
    {
      icon: 'favorite',
      title: t('customer.booking.review.next.start'),
      hint: t('customer.booking.review.next.startHint')
    }
  ]

  return (
    <ol className='mt-4 flex flex-col'>
      {steps.map((step, index) => (
        <li className='relative flex gap-3 pb-4 last:pb-0' key={step.title}>
          {index < steps.length - 1 ? (
            <span aria-hidden='true' className='absolute top-9 bottom-0 left-[17px] w-0.5 bg-outline-variant' />
          ) : null}
          <span
            aria-hidden='true'
            className='relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'
          >
            <Icon className='text-lg' name={step.icon} />
          </span>
          <span className='pt-1.5'>
            <span className='block text-sm font-medium text-on-surface'>{step.title}</span>
            {step.hint ? <span className='block text-xs text-on-surface-variant'>{step.hint}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  )
}
