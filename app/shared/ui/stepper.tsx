import { useTranslation } from 'react-i18next'

import { Icon } from './icon'

export type StepState = 'done' | 'current' | 'todo'

export interface StepperStep {
  id: string
  label: string
  state: StepState
  /** A short line under the label, e.g. the deadline of the current step. */
  note?: string
  /** Draws the note in the warning colour (a deadline that is close or past). */
  noteTone?: 'default' | 'warning'
}

/**
 * Horizontal stepper on desktop, "Step 2/4" with a progress bar on mobile. Completed steps are buttons that go back;
 * steps not reached are not clickable.
 */
export function Stepper({
  steps,
  label,
  onSelect
}: {
  steps: StepperStep[]
  label: string
  onSelect?: (id: string) => void
}) {
  const { t } = useTranslation()
  const found = steps.findIndex((step) => step.state === 'current')
  // Every step done (a finished process): the last step stands for where it ended.
  const allDone = found < 0 && steps.length > 0 && steps.every((step) => step.state === 'done')
  const currentIndex = found >= 0 ? found : allDone ? steps.length - 1 : 0
  const progress = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0

  return (
    <nav aria-label={label}>
      <div className='sm:hidden'>
        <p className='flex items-baseline justify-between text-sm'>
          <span className='font-semibold text-on-surface'>{steps[currentIndex]?.label}</span>
          <span className='text-on-surface-variant tabular-nums'>
            {t('common.kit.stepOf', { current: currentIndex + 1, total: steps.length })}
          </span>
        </p>
        {steps[currentIndex]?.note ? (
          <p
            className={`mt-0.5 text-xs whitespace-pre-line ${steps[currentIndex].noteTone === 'warning' ? 'font-medium text-caution' : 'text-on-surface-variant'}`}
          >
            {steps[currentIndex].note}
          </p>
        ) : null}
        <div aria-hidden='true' className='mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container'>
          <div
            className='h-full rounded-full bg-primary transition-[width] duration-300 ease-[var(--ease-out-soft)]'
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ol className='relative hidden grid-flow-col sm:grid' style={{ gridAutoColumns: '1fr' }}>
        <span
          aria-hidden='true'
          className='absolute top-4 h-0.5 bg-outline-variant'
          style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}
        >
          <span
            className='block h-full bg-primary transition-[width] duration-300 ease-[var(--ease-out-soft)]'
            style={{ width: `${progress}%` }}
          />
        </span>
        {steps.map((step, index) => {
          const done = step.state === 'done'
          const current = step.state === 'current'
          const marker = (
            <>
              <span
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-semibold transition-colors duration-200 ${done ? 'border-primary bg-primary text-on-primary' : current ? 'border-primary bg-surface-container-lowest text-primary ring-4 ring-brand-100' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
              >
                {done ? <Icon className='cc-pop text-lg' name='check' /> : index + 1}
              </span>
              <span
                className={`mt-2 text-center text-sm leading-5 ${current ? 'font-semibold text-on-surface' : done ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}
              >
                {step.label}
                {step.note ? (
                  <span
                    className={`mt-0.5 block text-xs font-normal whitespace-pre-line ${step.noteTone === 'warning' ? 'font-medium text-caution' : 'text-on-surface-variant'}`}
                  >
                    {step.note}
                  </span>
                ) : null}
                <span className='sr-only'>
                  {' '}
                  {done ? t('common.kit.stepDone') : current ? t('common.kit.stepCurrent') : t('common.kit.stepTodo')}
                </span>
              </span>
            </>
          )
          return (
            <li aria-current={current ? 'step' : undefined} className='flex flex-col items-center' key={step.id}>
              {done && onSelect ? (
                <button
                  className='group flex flex-col items-center rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&>span:last-child]:group-hover:text-primary [&>span:last-child]:group-hover:underline'
                  onClick={() => onSelect(step.id)}
                  type='button'
                >
                  {marker}
                </button>
              ) : (
                <span className='flex flex-col items-center px-2'>{marker}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
