import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { Highlight, ReviewDraft } from '../hooks/use-booking-review-draft'

const highlights: Highlight[] = ['punctual', 'expertise', 'communication', 'gentle', 'reports']
const tips = [0, 20000, 50000, 100000] as const
const maxCommentLength = 500

interface BookingReviewFieldsProps {
  id: string
  draft: ReviewDraft
  onChange: (patch: Partial<ReviewDraft>) => void
  onToggleHighlight: (highlight: Highlight) => void
}

export function BookingReviewFields({ id, draft, onChange, onToggleHighlight }: BookingReviewFieldsProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

  return (
    <>
      <fieldset>
        <legend className='text-sm font-semibold'>{t('customer.bookingReview.highlights')}</legend>
        <div className='mt-3 flex flex-wrap gap-2'>
          {highlights.map((highlight) => (
            <button
              key={highlight}
              type='button'
              aria-pressed={draft.highlights.includes(highlight)}
              onClick={() => onToggleHighlight(highlight)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${draft.highlights.includes(highlight) ? 'border-primary bg-emerald-50 text-primary' : 'border-slate-200 text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <Icon name={draft.highlights.includes(highlight) ? 'check' : 'add'} className='text-base' />
              {t(`customer.bookingReview.tags.${highlight}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <label htmlFor={`${id}-comment`} className='text-sm font-semibold'>
            {t('customer.bookingReview.comment')}
          </label>
          <span id={`${id}-counter`} className='text-xs text-on-surface-variant'>
            {t('customer.bookingReview.counter', { count: draft.comment.length, max: number.format(maxCommentLength) })}
          </span>
        </div>
        <textarea
          id={`${id}-comment`}
          value={draft.comment}
          onChange={(event) => onChange({ comment: event.target.value.slice(0, maxCommentLength) })}
          maxLength={maxCommentLength}
          aria-describedby={`${id}-counter`}
          placeholder={t('customer.bookingReview.commentPlaceholder')}
          rows={4}
          className='mt-2 w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-sm leading-6 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />
      </div>
      <fieldset className='rounded-xl bg-emerald-50/60 p-4'>
        <legend className='px-1 text-sm font-semibold'>{t('customer.bookingReview.tip')}</legend>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {tips.map((amount) => (
            <label
              key={amount}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-semibold focus-within:ring-2 focus-within:ring-primary ${draft.tip === amount ? 'border-primary bg-white text-primary' : 'border-slate-200 bg-white text-on-surface-variant'}`}
            >
              <input
                type='radio'
                name={`${id}-tip`}
                value={amount}
                checked={draft.tip === amount}
                onChange={() => onChange({ tip: amount })}
                className='sr-only'
              />
              {amount === 0 ? t('customer.bookingReview.noTip') : money.format(amount)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className='space-y-3 text-sm'>
        <label className='flex items-start gap-2'>
          <input
            type='checkbox'
            checked={draft.isPublic}
            onChange={(event) => onChange({ isPublic: event.target.checked })}
            className='mt-1 h-4 w-4 shrink-0 accent-primary'
          />
          {t('customer.bookingReview.public')}
        </label>
        <label className={`flex items-start gap-2 ${!draft.isPublic ? 'opacity-50' : ''}`}>
          <input
            type='checkbox'
            disabled={!draft.isPublic}
            checked={draft.isAnonymous}
            onChange={(event) => onChange({ isAnonymous: event.target.checked })}
            className='mt-1 h-4 w-4 shrink-0 accent-primary'
          />
          {t('customer.bookingReview.anonymous')}
        </label>
      </div>
      <p role='status' className='rounded-lg bg-surface-container-low p-3 text-xs leading-5 text-on-surface-variant'>
        {t('customer.bookingReview.draft')}
      </p>
    </>
  )
}
