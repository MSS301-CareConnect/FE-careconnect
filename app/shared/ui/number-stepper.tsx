import { useTranslation } from 'react-i18next'

import { Icon } from './icon'

export interface NumberStepperProps {
  id?: string
  value: number | ''
  onChange: (value: number | '') => void
  min: number
  max: number
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  className?: string
}

/**
 * − / number / + for small whole numbers (capacity, counts). The buttons clamp to [min, max]; a typed value is kept as
 * typed (never corrected) so the form can show a note under the input instead.
 */
export function NumberStepper({ id, value, onChange, min, max, className = '', ...aria }: NumberStepperProps) {
  const { t } = useTranslation()
  const current = value === '' ? min : value
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, current + delta)))
  const buttonClass =
    'grid h-11 w-11 shrink-0 place-items-center text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div
      className={`inline-flex items-stretch overflow-hidden rounded-xl border bg-surface-container-lowest ${aria['aria-invalid'] ? 'border-error' : 'border-outline-variant'} ${className}`}
    >
      <button
        aria-label={t('common.ui.decrease')}
        className={buttonClass}
        disabled={value !== '' && value <= min}
        onClick={() => step(-1)}
        type='button'
      >
        <Icon name='remove' />
      </button>
      <input
        {...aria}
        className='w-14 border-x border-outline-variant/60 bg-transparent text-center text-base font-semibold tabular-nums text-on-surface outline-none focus-visible:bg-brand-50'
        id={id}
        inputMode='numeric'
        onChange={(event) => {
          const text = event.target.value.replace(/\D/g, '')
          onChange(text === '' ? '' : Number(text))
        }}
        value={value}
      />
      <button
        aria-label={t('common.ui.increase')}
        className={buttonClass}
        disabled={value !== '' && value >= max}
        onClick={() => step(1)}
        type='button'
      >
        <Icon name='add' />
      </button>
    </div>
  )
}
