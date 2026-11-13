import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useCaregiverNames } from '~/entities/provider/use-provider-names'
import type { FeedbackRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { aftercareErrorKey, aftercareKeys, fetchFeedbacks, sendFeedbackReply } from './aftercare-api'

const key = 'aftercare.reviews' as const
const STARS = ['5', '4', '3', '2', '1'] as const
const REPLY_MAX = 1000

/**
 * Visible customer reviews, newest first, filtered by star (BookingService pages them). Given `caregiverId` it lists that
 * caregiver's reviews; given `centerId` the center's, naming the caregiver of each (`caregiverHref` links the name).
 * `canReply` lets the center manager answer a review once.
 */
export function FeedbackList({
  caregiverId,
  centerId,
  canReply = false,
  caregiverHref
}: {
  caregiverId?: string
  centerId?: string
  canReply?: boolean
  caregiverHref?: (caregiverId: string) => string
}) {
  const { t } = useTranslation()
  const [rating, setRating] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const params = { caregiverId, centerId, rating: rating ? Number(rating) : undefined, page, size }
  const feedbacks = useQuery({
    queryKey: aftercareKeys.feedbacks(params),
    queryFn: () => fetchFeedbacks(params),
    placeholderData: keepPreviousData,
    retry: false
  })
  const items = feedbacks.data?.items ?? []
  const nameOf = useCaregiverNames(caregiverId ? [] : items.map((item) => item.caregiverId))

  return (
    <div className='flex flex-col gap-3'>
      <FilterChips
        label={t(`${key}.filter`)}
        onChange={(value) => {
          setRating(value)
          setPage(0)
        }}
        options={[
          { value: '', label: t(`${key}.all`) },
          ...STARS.map((star) => ({ value: star, label: t(`${key}.stars`, { count: Number(star) }), icon: 'star' }))
        ]}
        value={rating}
      />
      {feedbacks.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {feedbacks.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t(aftercareErrorKey(feedbacks.error))}
        </p>
      ) : null}
      {feedbacks.isSuccess && items.length === 0 ? (
        <p className='rounded-xl bg-surface-container-low px-4 py-5 text-center text-sm text-on-surface-variant'>
          {t(`${key}.empty`)}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className='flex flex-col gap-2'>
          {items.map((item) => (
            <FeedbackItem
              canReply={canReply}
              caregiverHref={caregiverHref}
              caregiverName={caregiverId || !item.caregiverId ? undefined : nameOf(item.caregiverId)}
              item={item}
              key={item.id}
            />
          ))}
        </ul>
      ) : null}
      {feedbacks.data ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setSize(value)
            setPage(0)
          }}
          page={page}
          pageSize={size}
          pageSizeOptions={[5, 10, 20]}
          totalElements={feedbacks.data.totalElements}
          totalPages={feedbacks.data.totalPages}
        />
      ) : null}
    </div>
  )
}

function Stars({ value }: { value: number }) {
  const { t } = useTranslation()
  return (
    <span aria-label={t(`${key}.starsLabel`, { count: value })} className='inline-flex' role='img'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          className={`text-base ${star <= value ? 'text-warning' : 'text-outline-variant'}`}
          filled={star <= value}
          key={star}
          name='star'
        />
      ))}
    </span>
  )
}

function FeedbackItem({
  item,
  caregiverName,
  caregiverHref,
  canReply
}: {
  item: FeedbackRecord
  caregiverName?: string
  caregiverHref?: (caregiverId: string) => string
  canReply: boolean
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const notify = useActionToast()
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const send = useMutation({
    mutationFn: () => sendFeedbackReply(item.id, reply.trim()),
    onSuccess: async () => {
      notify.success(t(`${key}.replied`))
      setReplying(false)
      await queryClient.invalidateQueries({ queryKey: aftercareKeys.feedbacksAll })
    }
  })
  const tooLong = reply.trim().length > REPLY_MAX

  return (
    <li className='rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4'>
      <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
        <Stars value={item.rating} />
        <span className='text-sm font-semibold text-on-surface'>
          {item.customerDisplayName || t(`${key}.anonymous`)}
        </span>
        {item.createdAt ? (
          <span className='text-xs text-on-surface-variant tabular-nums'>{format.date(item.createdAt)}</span>
        ) : null}
      </div>
      {caregiverName && item.caregiverId ? (
        <p className='mt-1 text-xs text-on-surface-variant'>
          {caregiverHref ? (
            <Link className='font-medium text-primary hover:underline' to={caregiverHref(item.caregiverId)}>
              {t(`${key}.caregiver`, { name: caregiverName })}
            </Link>
          ) : (
            t(`${key}.caregiver`, { name: caregiverName })
          )}
        </p>
      ) : null}
      <p className={`mt-2 text-sm whitespace-pre-line ${item.comment ? 'text-on-surface' : 'text-on-surface-variant'}`}>
        {item.comment || t(`${key}.noComment`)}
      </p>
      {item.reply ? (
        <div className='mt-3 rounded-lg bg-mint-50 px-3 py-2 text-sm'>
          <p className='text-xs font-semibold text-forest-800'>
            {t(`${key}.centerReply`)}
            {item.repliedAt ? ` · ${format.date(item.repliedAt)}` : ''}
          </p>
          <p className='mt-0.5 whitespace-pre-line text-on-surface'>{item.reply}</p>
        </div>
      ) : null}
      {canReply && !item.reply && !replying ? (
        <Button
          className='mt-3'
          leftIcon={<Icon className='text-lg' name='reply' />}
          onClick={() => setReplying(true)}
          size='sm'
          variant='outline'
        >
          {t(`${key}.reply`)}
        </Button>
      ) : null}
      {replying ? (
        <form
          className='mt-3 flex flex-col gap-2'
          onSubmit={(event) => {
            event.preventDefault()
            if (reply.trim() && !tooLong) send.mutate()
          }}
        >
          <label className='text-sm font-medium' htmlFor={`feedback-reply-${item.id}`}>
            {t(`${key}.replyLabel`)}
          </label>
          <textarea
            aria-describedby={tooLong ? `feedback-reply-${item.id}-error` : undefined}
            aria-invalid={tooLong || undefined}
            className='w-full rounded-xl border border-outline-variant bg-white p-3 text-sm focus-visible:outline-2 focus-visible:outline-primary'
            id={`feedback-reply-${item.id}`}
            onChange={(event) => setReply(event.target.value)}
            placeholder={t(`${key}.replyPlaceholder`)}
            rows={3}
            value={reply}
          />
          {tooLong ? (
            <p className='text-sm text-error' id={`feedback-reply-${item.id}-error`}>
              {t(`${key}.replyTooLong`)}
            </p>
          ) : null}
          {send.isError ? (
            <p className='text-sm text-error' role='alert'>
              {t(aftercareErrorKey(send.error))}
            </p>
          ) : null}
          <div className='flex gap-2'>
            <Button disabled={!reply.trim() || tooLong} loading={send.isPending} size='sm' type='submit'>
              {t(`${key}.send`)}
            </Button>
            <Button onClick={() => setReplying(false)} size='sm' type='button' variant='ghost'>
              {t(`${key}.cancel`)}
            </Button>
          </div>
        </form>
      ) : null}
    </li>
  )
}
