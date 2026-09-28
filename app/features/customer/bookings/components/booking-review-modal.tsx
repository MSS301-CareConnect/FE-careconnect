import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { Icon } from '~/shared/ui/icon'
import type { BookingPreview } from '../bookings-data'
import { useBookingReviewDraft, type Rating } from '../hooks/use-booking-review-draft'
import { BookingReviewFields } from './booking-review-fields'

const ratings: Rating[] = [1, 2, 3, 4, 5]

interface BookingReviewModalProps {
  booking: BookingPreview
  open: boolean
  onClose: () => void
}

export function BookingReviewModal({ booking, open, onClose }: BookingReviewModalProps) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { draft, updateDraft, toggleHighlight } = useBookingReviewDraft()
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${booking.date}T12:00:00`)
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLButtonElement>('button')?.focus()
    }
    if (!open && dialog.open) dialog.close()
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-subtitle`}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose()
      }}
      className='fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-0 text-on-surface shadow-2xl backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm print:hidden'
    >
      <div className='sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-5 sm:px-7'>
        <div>
          <h2 id={`${id}-title`} className='flex items-center gap-2 text-lg font-bold sm:text-xl'>
            <Icon name='hotel_class' className='text-primary' />
            {t('customer.bookingReview.title')}
          </h2>
          <p id={`${id}-subtitle`} className='mt-1 text-xs text-on-surface-variant'>
            {t('customer.bookingReview.subtitle', { code: booking.code, date })}
          </p>
        </div>
        <button
          type='button'
          aria-label={t('customer.bookingReview.close')}
          onClick={onClose}
          className='rounded-lg p-2 text-on-surface-variant hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary'
        >
          <Icon name='close' />
        </button>
      </div>
      <div className='space-y-6 px-5 py-6 sm:px-7'>
        <div className='flex items-center gap-3 rounded-xl bg-surface-container-low p-4'>
          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-primary'>
            <Icon name='medical_services' className='text-3xl' />
          </div>
          <div>
            <p className='text-xs text-on-surface-variant'>{t('customer.bookingReview.caregiver')}</p>
            <p className='mt-1 font-bold'>{booking.caregiver}</p>
            <p className='mt-1 text-xs text-on-surface-variant'>
              {t('customer.myBookings.items.completed.caregiverRole')}
            </p>
          </div>
        </div>
        <fieldset className='text-center'>
          <legend className='w-full text-sm font-semibold'>
            {t('customer.bookingReview.satisfaction', { caregiver: booking.caregiver })}
          </legend>
          <div className='mt-4 flex justify-center gap-2'>
            {ratings.map((value) => (
              <label
                key={value}
                className='cursor-pointer rounded-lg p-1 focus-within:ring-2 focus-within:ring-primary'
              >
                <input
                  type='radio'
                  name={`${id}-rating`}
                  checked={draft.rating === value}
                  onChange={() => updateDraft({ rating: value })}
                  value={value}
                  aria-label={t('customer.careReport.ratingOption', { count: value })}
                  className='sr-only'
                />
                <Icon
                  name='star'
                  filled={value <= draft.rating}
                  className={`text-4xl ${value <= draft.rating ? 'text-amber-500' : 'text-slate-300'}`}
                />
              </label>
            ))}
          </div>
          <p className='mt-2 text-sm font-semibold text-primary' aria-live='polite'>
            {t('customer.bookingReview.score', {
              score: number.format(draft.rating),
              description: t(`customer.bookingReview.descriptions.${draft.rating}`)
            })}
          </p>
        </fieldset>
        <BookingReviewFields id={id} draft={draft} onChange={updateDraft} onToggleHighlight={toggleHighlight} />
      </div>
      <div className='sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-7'>
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg bg-surface-container px-5 py-3 text-sm font-semibold hover:bg-surface-container-high'
          >
            {t('customer.bookingReview.later')}
          </button>
          <button
            type='button'
            disabled
            className='flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white opacity-50'
          >
            <Icon name='send' className='text-lg' />
            {t('customer.bookingReview.submit')}
          </button>
        </div>
        <p className='mt-3 text-center text-xs text-on-surface-variant'>{t('customer.bookingReview.privacy')}</p>
      </div>
    </dialog>,
    document.body
  )
}
