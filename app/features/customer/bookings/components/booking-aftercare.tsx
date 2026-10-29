import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  aftercareErrorKey,
  aftercareKeys,
  escalate,
  fetchComplaints,
  fetchEligibleCaregivers,
  openComplaint,
  sendFeedback,
  withdraw
} from '~/entities/aftercare/aftercare-api'
import { CareReportList } from '~/entities/aftercare/care-report-list'
import type { ComplaintCategory, ComplaintRecord, ComplaintTargetType } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

const CATEGORIES = [
  'QUALITY',
  'ATTITUDE',
  'LATE',
  'SAFETY',
  'BILLING',
  'OTHER'
] as const satisfies readonly ComplaintCategory[]
// D20: the customer escalates a resolved case, or one the center left unhandled for 48 hours (backend checks the time).
const ESCALATABLE = new Set(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
const WITHDRAWABLE = new Set(['OPEN', 'IN_PROGRESS', 'ESCALATED'])
const inputClass =
  'mt-1 min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none'
const primaryButton =
  'min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'

/** Customer aftercare for one booking (H-04, H-05): care reports, a review per caregiver, complaints. */
export function BookingAftercare({
  bookingId,
  completed,
  visited
}: {
  bookingId: string
  completed: boolean
  /** A visit has taken place, so care reports and new complaints apply (D20 complaint window). */
  visited: boolean
}) {
  return (
    <div className='flex flex-col gap-4'>
      {visited ? <CareReportList bookingId={bookingId} /> : null}
      {completed ? <ReviewForm bookingId={bookingId} /> : null}
      <Complaints bookingId={bookingId} canOpen={visited} />
    </div>
  )
}

function ReviewForm({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  // No preset rating: the customer chooses one so reviews are not biased toward 5 stars.
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const eligible = useQuery({
    queryKey: aftercareKeys.eligible(bookingId),
    queryFn: () => fetchEligibleCaregivers(bookingId),
    retry: false
  })
  const caregiverId = eligible.data?.[0]?.caregiverId
  const send = useMutation({
    mutationFn: () =>
      sendFeedback({
        bookingId,
        caregiverId: caregiverId ?? '',
        rating: rating ?? 0,
        comment: comment.trim() || undefined
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aftercareKeys.eligible(bookingId) })
  })
  if (!caregiverId) {
    return send.isSuccess ? (
      <p className='rounded-2xl bg-surface-container-lowest p-5 text-sm shadow-sm' role='status'>
        {t('aftercare.review.thanks')}
      </p>
    ) : null
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (rating !== null) send.mutate()
  }

  return (
    <form
      aria-labelledby={`review-${bookingId}`}
      className='rounded-2xl bg-surface-container-lowest p-5 shadow-sm'
      onSubmit={submit}
    >
      <h2 className='text-base font-bold' id={`review-${bookingId}`}>
        {t('aftercare.review.title')}
      </h2>
      <fieldset className='mt-3'>
        <legend className='text-sm font-medium'>{t('aftercare.review.rating')}</legend>
        <div className='mt-1 flex flex-wrap gap-2'>
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              className='flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-sm has-checked:border-primary has-checked:bg-surface-container-low has-focus-visible:outline-2 has-focus-visible:outline-primary'
              key={value}
            >
              <input
                aria-label={t('aftercare.review.stars', { count: value })}
                checked={rating === value}
                className='sr-only'
                name='rating'
                onChange={() => setRating(value)}
                type='radio'
              />
              <Icon
                className={rating !== null && value <= rating ? 'text-warning' : 'text-outline'}
                filled={rating !== null && value <= rating}
                name='star'
              />
              <span aria-hidden='true'>{t('aftercare.review.stars', { count: value })}</span>
            </label>
          ))}
        </div>
        {rating === null ? <p className='mt-1 text-xs text-on-surface-variant'>{t('aftercare.review.pick')}</p> : null}
      </fieldset>
      <label className='mt-3 block text-sm font-medium'>
        {t('aftercare.review.comment')}
        <textarea
          className={inputClass}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          value={comment}
        />
      </label>
      {send.isError ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t(aftercareErrorKey(send.error))}
        </p>
      ) : null}
      <button className={`mt-3 ${primaryButton}`} disabled={send.isPending || rating === null} type='submit'>
        {t('aftercare.review.submit')}
      </button>
    </form>
  )
}

function Complaints({ bookingId, canOpen }: { bookingId: string; canOpen: boolean }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<ComplaintTargetType>('CAREGIVER_SERVICE')
  const [category, setCategory] = useState<ComplaintCategory>('QUALITY')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const complaints = useQuery({
    queryKey: aftercareKeys.complaints('mine'),
    queryFn: () => fetchComplaints(),
    retry: false
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: aftercareKeys.complaintsAll })
  const create = useMutation({
    mutationFn: () =>
      openComplaint({ bookingId, targetType: target, category, title: title.trim(), content: content.trim() }),
    onSuccess: async () => {
      setOpen(false)
      setTitle('')
      setContent('')
      await refresh()
    }
  })
  const mine = (complaints.data ?? []).filter((complaint) => complaint.bookingId === bookingId)

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }
  // Before any visit has taken place there is nothing to complain about yet (backend error 5926).
  if (!canOpen && mine.length === 0) return null

  return (
    <section
      aria-labelledby={`complaints-${bookingId}`}
      className='rounded-2xl bg-surface-container-lowest p-5 shadow-sm'
    >
      <div className='flex items-center justify-between gap-2'>
        <h2 className='text-base font-bold' id={`complaints-${bookingId}`}>
          {t('aftercare.complaint.title')}
        </h2>
        {canOpen ? (
          <button
            aria-expanded={open}
            className='min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => setOpen((value) => !value)}
            type='button'
          >
            {t('aftercare.complaint.new')}
          </button>
        ) : null}
      </div>
      {open ? (
        <form className='mt-3 flex flex-col gap-2' onSubmit={submit}>
          <p className='text-xs text-on-surface-variant'>{t('aftercare.complaint.windowHint')}</p>
          <div className='grid gap-2 sm:grid-cols-2'>
            <label className='text-sm font-medium'>
              {t('aftercare.complaint.target')}
              <select
                className={inputClass}
                onChange={(event) => setTarget(event.target.value as ComplaintTargetType)}
                value={target}
              >
                <option value='CAREGIVER_SERVICE'>{t('aftercare.complaint.targets.CAREGIVER_SERVICE')}</option>
                <option value='CENTER'>{t('aftercare.complaint.targets.CENTER')}</option>
              </select>
            </label>
            <label className='text-sm font-medium'>
              {t('aftercare.complaint.category')}
              <select
                className={inputClass}
                onChange={(event) => setCategory(event.target.value as ComplaintCategory)}
                value={category}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {t(`aftercare.categories.${item}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className='text-sm font-medium'>
            {t('aftercare.complaint.subject')}
            <input className={inputClass} onChange={(event) => setTitle(event.target.value)} required value={title} />
          </label>
          <label className='text-sm font-medium'>
            {t('aftercare.complaint.content')}
            <textarea
              className={inputClass}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={3}
              value={content}
            />
          </label>
          {create.isError ? (
            <p className='text-sm text-error' role='alert'>
              {t(aftercareErrorKey(create.error))}
            </p>
          ) : null}
          <button className={`self-start ${primaryButton}`} disabled={create.isPending} type='submit'>
            {t('aftercare.complaint.send')}
          </button>
        </form>
      ) : null}
      <ul className='mt-3 flex flex-col gap-2'>
        {mine.map((complaint) => (
          <ComplaintItem complaint={complaint} key={complaint.id} onChange={refresh} />
        ))}
      </ul>
    </section>
  )
}

/** One complaint with its own escalation reason, so typing for one complaint never escalates another. */
function ComplaintItem({ complaint, onChange }: { complaint: ComplaintRecord; onChange: () => Promise<void> }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const raise = useMutation({ mutationFn: () => escalate(complaint.id, reason.trim()), onSuccess: onChange })
  const pullBack = useMutation({
    mutationFn: () => withdraw(complaint.id),
    onSuccess: async () => {
      setConfirmWithdraw(false)
      await onChange()
    }
  })
  const reasonId = `escalate-${complaint.id}`

  return (
    <li className='rounded-xl border border-outline-variant/60 p-3 text-sm'>
      <p className='font-semibold'>{complaint.title}</p>
      <p className='text-xs text-on-surface-variant'>{t(`aftercare.complaintStatus.${complaint.status}`)}</p>
      {complaint.resolution ? <p className='mt-1'>{complaint.resolution}</p> : null}
      {complaint.level !== 'ADMIN' && ESCALATABLE.has(complaint.status) ? (
        <div className='mt-2 flex flex-wrap items-end gap-2'>
          {complaint.status === 'RESOLVED' ? null : (
            <p className='w-full text-xs text-on-surface-variant'>{t('aftercare.complaint.escalateHint')}</p>
          )}
          <div className='min-w-48 flex-1'>
            <label className='text-xs font-medium' htmlFor={reasonId}>
              {t('aftercare.complaint.escalateReason')}
            </label>
            <input
              className={inputClass}
              id={reasonId}
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </div>
          <button
            className='min-h-11 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
            disabled={raise.isPending || !reason.trim()}
            onClick={() => raise.mutate()}
            type='button'
          >
            {t('aftercare.complaint.escalate')}
          </button>
        </div>
      ) : null}
      {raise.isError ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t(aftercareErrorKey(raise.error))}
        </p>
      ) : null}
      {WITHDRAWABLE.has(complaint.status) ? (
        <button
          className='mt-2 min-h-11 rounded-lg px-2 text-sm font-semibold text-error hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-error'
          onClick={() => setConfirmWithdraw(true)}
          type='button'
        >
          {t('aftercare.complaint.withdraw')}
        </button>
      ) : null}
      <ConfirmDialog
        confirmLabel={t('aftercare.complaint.withdraw')}
        description={t('aftercare.complaint.withdrawConfirm')}
        error={pullBack.isError ? t(aftercareErrorKey(pullBack.error)) : undefined}
        loading={pullBack.isPending}
        onClose={() => setConfirmWithdraw(false)}
        onConfirm={() => pullBack.mutate()}
        open={confirmWithdraw}
        title={complaint.title ?? t('aftercare.complaint.withdraw')}
        tone='danger'
      />
    </li>
  )
}
