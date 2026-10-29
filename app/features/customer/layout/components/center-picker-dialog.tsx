import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { closeCenterPicker, promptCenterPickerOnce, useSelectedCenter } from '~/entities/care-center/selected-center'
import { Icon } from '~/shared/ui/icon'

import { usePickCenter } from '../hooks/use-pick-center'
import { CenterOptions } from './center-options'

const key = 'customer.centerPicker' as const

/** Modal center step: opens on the first visit of a session without a center, and on any "choose a center" action. */
export function CenterPickerDialog() {
  const { t } = useTranslation()
  const { pickerOpen } = useSelectedCenter()
  const pickCenter = usePickCenter()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    promptCenterPickerOnce()
  }, [])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (pickerOpen && !element.open) element.showModal()
    if (!pickerOpen && element.open) element.close()
  }, [pickerOpen])

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className='m-auto w-[calc(100%_-_2rem)] max-w-xl rounded-2xl border border-outline-variant/60 bg-surface p-0 text-on-surface shadow-xl backdrop:bg-inverse-surface/60 motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:starting:open:translate-y-3 motion-safe:starting:open:opacity-0'
      // Escape and the close button both end in the native close event.
      onClose={closeCenterPicker}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCenterPicker()
      }}
      ref={dialog}
    >
      {pickerOpen ? (
        <div className='flex max-h-[calc(100dvh-2rem)] flex-col'>
          <div className='flex items-start justify-between gap-4 px-6 pt-6 sm:px-7 sm:pt-7'>
            <span
              aria-hidden='true'
              className='grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-on-primary'
            >
              <Icon className='text-2xl' name='home_health' />
            </span>
            <button
              aria-label={t(`${key}.dialog.close`)}
              className='grid h-11 w-11 place-items-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
              onClick={closeCenterPicker}
              type='button'
            >
              <Icon name='close' />
            </button>
          </div>
          <div className='px-6 pt-4 sm:px-7'>
            <h2
              className='text-2xl font-bold leading-tight tracking-[-0.035em] text-on-surface sm:text-[1.75rem]'
              id={titleId}
            >
              {t(`${key}.dialog.title`)}
            </h2>
            <p className='mt-2 text-sm leading-6 text-on-surface-variant sm:text-base sm:leading-7' id={descriptionId}>
              {t(`${key}.dialog.description`)}
            </p>
          </div>
          <div className='mx-6 mt-5 min-h-0 flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3 sm:mx-7'>
            <CenterOptions onPick={pickCenter} size='dialog' />
          </div>
          <div className='flex justify-end px-6 py-5 sm:px-7'>
            <button
              className='inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
              onClick={closeCenterPicker}
              type='button'
            >
              {t(`${key}.dialog.skip`)}
              <Icon aria-hidden='true' className='text-lg' name='arrow_forward' />
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
