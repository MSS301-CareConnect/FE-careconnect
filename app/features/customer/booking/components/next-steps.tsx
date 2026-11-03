import { useTranslation } from 'react-i18next'

import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

/** "What happens next": confirm → (assign) → pay → care begins. */
export function NextSteps({ assign, confirmMinutes }: { assign: boolean; confirmMinutes?: number }) {
  const { t } = useTranslation()
  const format = useFormat()
  const steps = [
    {
      icon: 'fact_check',
      title: t('customer.booking.review.next.confirm'),
      hint: confirmMinutes
        ? t('customer.booking.review.next.confirmHint', { duration: format.duration(confirmMinutes) })
        : ''
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
      icon: 'credit_card',
      title: t('customer.booking.review.next.pay'),
      hint: t('customer.booking.review.next.payHint')
    },
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
