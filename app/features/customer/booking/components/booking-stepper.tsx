import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const STEPS = ['patient', 'provider', 'services', 'schedule', 'confirm'] as const
export type BookingStep = (typeof STEPS)[number]
const ICONS: Record<BookingStep, string> = {
  patient: 'person',
  provider: 'home_health',
  services: 'medical_services',
  schedule: 'calendar_month',
  confirm: 'task_alt'
}

/** Shows which parts of the booking request are already filled in; it does not gate navigation. */
export function BookingStepper({ done }: { done: Record<BookingStep, boolean> }) {
  const { t } = useTranslation()
  const current = STEPS.find((step) => !done[step])

  return (
    <ol
      aria-label={t('customer.booking.stepper.label')}
      className='grid grid-cols-2 gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm sm:grid-cols-5 md:p-5'
    >
      {STEPS.map((step) => {
        const complete = done[step]
        const active = step === current
        return (
          <li
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-3 rounded-lg p-2 ${active ? 'bg-surface-container-low' : ''}`}
            key={step}
          >
            <span
              aria-hidden='true'
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${complete ? 'bg-primary text-on-primary' : active ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'}`}
            >
              <Icon className='text-[20px]' name={complete ? 'check' : ICONS[step]} />
            </span>
            <span className={`min-w-0 truncate text-sm font-semibold ${active ? 'text-secondary' : 'text-on-surface'}`}>
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
