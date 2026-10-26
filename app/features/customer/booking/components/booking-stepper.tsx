import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const STEPS = ['patient', 'provider', 'services', 'schedule', 'confirm'] as const
export type BookingStep = (typeof STEPS)[number]

/** Shows which parts of the booking request are already filled in; it does not gate navigation. */
export function BookingStepper({ done }: { done: Record<BookingStep, boolean> }) {
  const { t } = useTranslation()
  const current = STEPS.find((step) => !done[step])

  return (
    <ol aria-label={t('customer.booking.stepper.label')} className='grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5'>
      {STEPS.map((step) => {
        const complete = done[step]
        const active = step === current
        return (
          <li
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 border-t-2 pt-3 text-sm font-semibold ${complete ? 'border-[#075b31] text-[#075b31]' : active ? 'border-[#1b2922] text-[#1b2922]' : 'border-[#dbe4db] text-[#76867a]'}`}
            key={step}
          >
            <Icon
              className='text-lg'
              filled={complete}
              name={complete ? 'check_circle' : active ? 'radio_button_checked' : 'radio_button_unchecked'}
            />
            <span className='min-w-0 truncate'>
              {t(`customer.booking.stepper.${step}`)}
              <span className='sr-only'>
                {' '}
                {complete ? t('customer.booking.stepper.complete') : t('customer.booking.stepper.incomplete')}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
