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
import type { ComplaintCategory, ComplaintTargetType } from '~/shared/api/generated/contracts'

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
const inputClass = 'mt-1 w-full rounded-lg border border-outline-variant p-2 text-sm'

/** Customer aftercare for one booking (H-04, H-05): care reports, a review per caregiver, complaints. */
export function BookingAftercare({ bookingId, completed }: { bookingId: string; completed: boolean }) {
  return (
    <div className='flex flex-col gap-4'>
      <CareReportList bookingId={bookingId} />
      {completed ? <ReviewForm bookingId={bookingId} /> : null}
      <Complaints bookingId={bookingId} />
    </div>
  )
}

function ReviewForm({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const eligible = useQuery({
    queryKey: aftercareKeys.eligible(bookingId),
    queryFn: () => fetchEligibleCaregivers(bookingId),
    retry: false
  })
  const caregiverId = eligible.data?.[0]?.caregiverId
  const send = useMutation({
    mutationFn: () =>
      sendFeedback({ bookingId, caregiverId: caregiverId ?? '', rating, comment: comment.trim() || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aftercareKeys.eligible(bookingId) })
  })
  if (!caregiverId) {
    return send.isSuccess ? (
      <p className='rounded-2xl bg-white p-5 text-sm shadow-sm' role='status'>
        {t('aftercare.review.thanks')}
      </p>
    ) : null
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    send.mutate()
  }

  return (
    <form aria-labelledby={`review-${bookingId}`} className='rounded-2xl bg-white p-5 shadow-sm' onSubmit={submit}>
      <h2 className='text-base font-bold' id={`review-${bookingId}`}>
        {t('aftercare.review.title')}
      </h2>
      <fieldset className='mt-3'>
        <legend className='text-sm font-medium'>{t('aftercare.review.rating')}</legend>
        <div className='mt-1 flex gap-2'>
          {[1, 2, 3, 4, 5].map((value) => (
            <label className='flex items-center gap-1 text-sm' key={value}>
              <input checked={rating === value} name='rating' onChange={() => setRating(value)} type='radio' />
              {t('aftercare.review.stars', { count: value })}
            </label>
          ))}
        </div>
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
      <button
        className='mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
        disabled={send.isPending}
        type='submit'
      >
        {t('aftercare.review.submit')}
      </button>
    </form>
  )
}

function Complaints({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<ComplaintTargetType>('CAREGIVER_SERVICE')
  const [category, setCategory] = useState<ComplaintCategory>('QUALITY')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [reason, setReason] = useState('')
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
  const raise = useMutation({ mutationFn: (id: string) => escalate(id, reason.trim()), onSuccess: refresh })
  const pullBack = useMutation({ mutationFn: (id: string) => withdraw(id), onSuccess: refresh })
  const mine = (complaints.data ?? []).filter((complaint) => complaint.bookingId === bookingId)
  const error = create.error ?? raise.error ?? pullBack.error

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }

  return (
    <section aria-labelledby={`complaints-${bookingId}`} className='rounded-2xl bg-white p-5 shadow-sm'>
      <div className='flex items-center justify-between gap-2'>
        <h2 className='text-base font-bold' id={`complaints-${bookingId}`}>
          {t('aftercare.complaint.title')}
        </h2>
        <button className='text-sm font-semibold text-primary' onClick={() => setOpen((value) => !value)} type='button'>
          {t('aftercare.complaint.new')}
        </button>
      </div>
      {open ? (
        <form className='mt-3 flex flex-col gap-2' onSubmit={submit}>
          <p className='text-xs text-on-surface-variant'>{t('aftercare.complaint.windowHint')}</p>
          <div className='grid grid-cols-2 gap-2'>
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
          <button
            className='self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
            disabled={create.isPending}
            type='submit'
          >
            {t('aftercare.complaint.send')}
          </button>
        </form>
      ) : null}
      {error ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t(aftercareErrorKey(error))}
        </p>
      ) : null}
      <ul className='mt-3 flex flex-col gap-2'>
        {mine.map((complaint) => (
          <li className='rounded-xl border border-outline-variant/60 p-3 text-sm' key={complaint.id}>
            <p className='font-semibold'>{complaint.title}</p>
            <p className='text-xs text-on-surface-variant'>{t(`aftercare.complaintStatus.${complaint.status}`)}</p>
            {complaint.resolution ? <p className='mt-1'>{complaint.resolution}</p> : null}
            {complaint.level !== 'ADMIN' && ESCALATABLE.has(complaint.status) ? (
              <div className='mt-2 flex flex-wrap items-end gap-2'>
                {complaint.status === 'RESOLVED' ? null : (
                  <p className='w-full text-xs text-on-surface-variant'>{t('aftercare.complaint.escalateHint')}</p>
                )}
                <label className='flex-1 text-xs font-medium'>
                  {t('aftercare.complaint.escalateReason')}
                  <input className={inputClass} onChange={(event) => setReason(event.target.value)} value={reason} />
                </label>
                <button
                  className='rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold disabled:opacity-50'
                  disabled={raise.isPending || !reason.trim()}
                  onClick={() => raise.mutate(complaint.id)}
                  type='button'
                >
                  {t('aftercare.complaint.escalate')}
                </button>
              </div>
            ) : null}
            {WITHDRAWABLE.has(complaint.status) ? (
              <button
                className='mt-2 text-xs font-semibold text-error disabled:opacity-50'
                disabled={pullBack.isPending}
                onClick={() => pullBack.mutate(complaint.id)}
                type='button'
              >
                {t('aftercare.complaint.withdraw')}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
