import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export interface BookingReasonDialogProps {
  title: string
  label: string
  confirmLabel: string
  description?: string
  /** Characters the backend requires, e.g. 10 for a no-show note. */
  minLength?: number
  maxLength?: number
  danger?: boolean
  pending?: boolean
  error?: string
  /** Optional content between the description and the reason field, such as a refund preview. */
  children?: ReactNode
  /** Optional secondary column content for two-column desktop layouts. */
  sideContent?: ReactNode
  /** False keeps the confirm button disabled while extra content is not ready. */
  canConfirm?: boolean
  /** Explains what is missing when canConfirm is false. */
  missingRequirement?: string
  /** Custom max width class, defaults to 'max-w-lg' */
  maxWidth?: string
  onConfirm: (reason: string) => void
  onClose: () => void
}

/** Modal that collects the reason BookingService requires for reject, cancel, force-end and no-show actions. */
export function BookingReasonDialog({
  title,
  label,
  confirmLabel,
  description,
  minLength = 1,
  maxLength = 1000,
  danger = false,
  pending = false,
  error,
  children,
  sideContent,
  canConfirm = true,
  missingRequirement,
  maxWidth = 'max-w-lg',
  onConfirm,
  onClose
}: BookingReasonDialogProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const fieldId = useId()
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const valid = trimmed.length >= minLength && trimmed.length <= maxLength

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  const isReasonMissing = !valid
  const isConfirmDisabled = !valid || !canConfirm || pending

  const missingList: string[] = []
  if (!canConfirm && missingRequirement) {
    missingList.push(missingRequirement)
  }
  if (isReasonMissing) {
    missingList.push(
      minLength > 1
        ? `Nhập lý do hủy (tối thiểu ${minLength} ký tự)`
        : 'Nhập lý do cụ thể'
    )
  }
  const tooltipText = isConfirmDisabled
    ? pending
      ? t('booking.actions.working')
      : `Chưa thể ${confirmLabel}:\n• ` + missingList.join('\n• ')
    : undefined

  const reasonField = (
    <div>
      <label className='flex items-center gap-1 font-semibold text-on-surface' htmlFor={fieldId}>
        <span>{label}</span>
        <span aria-hidden='true' className='text-rose-600 font-bold'>*</span>
      </label>
      <textarea
        className='mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-normal text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 transition-all'
        id={fieldId}
        maxLength={maxLength}
        onChange={(event) => setReason(event.target.value)}
        placeholder='Nhập lý do cụ thể...'
        required
        rows={4}
        value={reason}
      />
      {minLength > 1 ? (
        <p className='mt-1 text-xs text-on-surface-variant'>
          {t('booking.dialog.minLength', { count: minLength })}
        </p>
      ) : null}
    </div>
  )

  return (
    <dialog
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%_-_2rem)] ${maxWidth} max-h-[calc(100vh-2.5rem)] rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-0 text-on-surface shadow-2xl backdrop:bg-on-surface/55 backdrop:backdrop-blur-sm overflow-hidden`}
      onClose={onClose}
      ref={dialog}
    >
      <form
        className='flex max-h-[calc(100vh-2.5rem)] flex-col'
        onSubmit={(event) => {
          event.preventDefault()
          if (valid && canConfirm && !pending) onConfirm(trimmed)
        }}
      >
        <div className='flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant/40 px-6 py-4'>
          <h2 className='text-lg font-bold text-on-surface' id={titleId}>
            {title}
          </h2>
          <button
            aria-label={t('booking.actions.close')}
            className='grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary transition-colors'
            onClick={() => dialog.current?.close()}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto min-h-0 p-6 text-sm'>
          {sideContent ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Left Column: Selection & Reason */}
              <div className='flex flex-col gap-4 min-w-0'>
                {description ? <p className='leading-6 text-on-surface-variant'>{description}</p> : null}
                {children}
                <div className='mt-1'>{reasonField}</div>
              </div>

              {/* Right Column: Policies & Refund Previews */}
              <div className='flex flex-col gap-4 min-w-0 md:border-l md:border-outline-variant/50 md:pl-6'>
                {sideContent}
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {description ? <p className='leading-6 text-on-surface-variant'>{description}</p> : null}
              {children}
              {reasonField}
            </div>
          )}
          {error ? (
            <p className='mt-4 rounded-xl bg-error-container p-3 text-sm font-medium text-on-error-container' role='alert'>
              {error}
            </p>
          ) : null}
        </div>
        <div className='flex shrink-0 justify-end gap-3 border-t border-outline-variant/40 bg-surface-container-low px-6 py-4'>
          <button
            className='min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary transition-colors'
            onClick={() => dialog.current?.close()}
            type='button'
          >
            {t('booking.actions.back')}
          </button>
          <div className='relative inline-flex group' title={tooltipText}>
            <button
              aria-busy={pending || undefined}
              className={`min-h-11 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                danger ? 'bg-error hover:bg-error/90 active:scale-[0.98]' : 'bg-primary hover:bg-primary-container active:scale-[0.98]'
              }`}
              disabled={isConfirmDisabled}
              type='submit'
            >
              {pending ? t('booking.actions.working') : confirmLabel}
            </button>
            {isConfirmDisabled && missingList.length > 0 && !pending ? (
              <div className='pointer-events-none absolute bottom-full right-0 mb-2.5 hidden w-max max-w-xs rounded-xl bg-neutral-900/95 p-3 text-xs font-normal text-white shadow-2xl ring-1 ring-white/10 group-hover:block z-50 whitespace-pre-line leading-relaxed backdrop-blur-xs'>
                <div className='font-bold text-amber-300 mb-1 flex items-center gap-1.5'>
                  <Icon className='text-sm' name='info' />
                  <span>Cần hoàn thành trước khi hủy:</span>
                </div>
                <div className='space-y-1 text-neutral-200'>
                  {missingList.map((item, idx) => (
                    <div key={idx} className='flex items-start gap-1.5'>
                      <span className='text-amber-400'>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className='absolute top-full right-6 -mt-1 border-4 border-transparent border-t-neutral-900/95' />
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </dialog>
  )
}
