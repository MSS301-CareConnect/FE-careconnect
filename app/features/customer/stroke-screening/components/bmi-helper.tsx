import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/shared/ui/button'
import { FormField, Input } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'

import { bmiFrom, parseDecimal } from '../stroke-screening-form'

const key = 'customer.strokeScreening.bmiHelper' as const

/** Optional calculator under the BMI field: height and weight give a BMI the customer can copy into the form. */
export function BmiHelper({ onApply }: { onApply: (bmi: string) => void }) {
  const { t, i18n } = useTranslation()
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const heightCm = parseDecimal(height) ?? undefined
  const weightKg = parseDecimal(weight) ?? undefined
  const bmi = bmiFrom(heightCm, weightKg)
  const typed = height.trim() !== '' && weight.trim() !== ''
  const format = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })

  return (
    <div className='rounded-2xl bg-surface-container-low/70 ring-1 ring-forest-900/5'>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className='flex min-h-11 w-full items-center gap-2 rounded-2xl px-4 text-left text-sm font-semibold text-forest-800 hover:text-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
        onClick={() => setOpen((value) => !value)}
        type='button'
      >
        <Icon className='text-lg' name='calculate' />
        <span className='flex-1'>{t(`${key}.toggle`)}</span>
        <Icon className={`text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`} name='expand_more' />
      </button>
      {open ? (
        <div className='cc-fade-up grid gap-3 px-4 pb-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end' id={panelId}>
          <FormField label={t(`${key}.height`)}>
            {(props) => (
              <Input
                {...props}
                inputMode='decimal'
                onChange={(event) => setHeight(event.target.value)}
                value={height}
              />
            )}
          </FormField>
          <FormField label={t(`${key}.weight`)}>
            {(props) => (
              <Input
                {...props}
                inputMode='decimal'
                onChange={(event) => setWeight(event.target.value)}
                value={weight}
              />
            )}
          </FormField>
          <Button
            disabled={bmi === null}
            onClick={() => {
              if (bmi === null) return
              onApply(String(bmi))
              setOpen(false)
            }}
            variant='dark'
          >
            {t(`${key}.apply`)}
          </Button>
          <p aria-live='polite' className='text-sm sm:col-span-3'>
            {bmi !== null ? (
              <span className='font-semibold text-forest-900 tabular-nums'>
                {t(`${key}.result`, { value: format.format(bmi) })}
              </span>
            ) : typed ? (
              <span className='text-on-surface-variant'>{t(`${key}.invalid`)}</span>
            ) : null}
          </p>
        </div>
      ) : null}
    </div>
  )
}
