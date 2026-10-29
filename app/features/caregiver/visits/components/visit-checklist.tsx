import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  addSessionTask,
  bookingKeys,
  checkOut,
  fetchCareSession,
  saveSessionTask
} from '~/entities/booking/booking-api'
import { bookingErrorKey, formatClock, shortTime } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CareTaskRecord, CareTaskUpdateRequest } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import { currentPosition } from '../current-position'

const TASK_TONE: Record<CareTaskRecord['status'], string> = {
  PENDING: 'bg-surface-container-low',
  DONE: 'bg-secondary-container/60',
  SKIPPED: 'bg-neutral-container/70'
}
const TASK_ICON: Record<CareTaskRecord['status'], string> = {
  PENDING: 'radio_button_unchecked',
  DONE: 'check_circle',
  SKIPPED: 'do_not_disturb_on'
}

/** The care session of a checked-in visit: work through each task, then check out. */
export function VisitChecklist({ sessionId }: { sessionId: string }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [skipping, setSkipping] = useState<CareTaskRecord | null>(null)
  const session = useQuery({
    queryKey: bookingKeys.session(sessionId),
    queryFn: () => fetchCareSession(sessionId),
    retry: false
  })

  const update = useMutation({
    mutationFn: ({ task, request }: { task: CareTaskRecord; request: CareTaskUpdateRequest }) =>
      saveSessionTask(sessionId, task.id, request),
    onSuccess: () => {
      setSkipping(null)
      void queryClient.invalidateQueries({ queryKey: bookingKeys.session(sessionId) })
    }
  })
  const add = useMutation({
    mutationFn: (value: string) => addSessionTask(sessionId, value),
    onSuccess: () => {
      setTitle('')
      void queryClient.invalidateQueries({ queryKey: bookingKeys.session(sessionId) })
    }
  })
  const finish = useMutation({
    mutationFn: async () => checkOut(sessionId, await currentPosition()),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.session(sessionId), updated)
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    }
  })

  if (session.isPending)
    return (
      <p className='rounded-2xl bg-white p-6 text-sm text-on-surface-variant shadow-sm' role='status'>
        {t('caregiver.visitDetail.session.loading')}
      </p>
    )
  if (session.isError)
    return (
      <p className='rounded-2xl bg-white p-6 text-sm text-error shadow-sm' role='alert'>
        {t(bookingErrorKey(session.error))}
      </p>
    )

  const data = session.data
  const tasks = [...(data.tasks ?? [])].sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0))
  const pending = tasks.filter((task) => task.status === 'PENDING').length
  const active = data.status === 'IN_PROGRESS'
  const error = update.error ?? add.error ?? finish.error

  return (
    <SectionCard
      action={
        <span className='text-sm text-on-surface-variant tabular-nums'>
          {active
            ? t('caregiver.visitDetail.session.checkedIn', { time: formatClock(data.checkInAt, i18n.language) })
            : t('caregiver.visitDetail.session.ended', { time: formatClock(data.checkOutAt, i18n.language) })}
        </span>
      }
      icon='checklist'
      title={t('caregiver.visitDetail.session.title')}
    >
      <ul className='flex flex-col gap-2.5'>
        {tasks.map((task) => (
          <li className={`flex flex-wrap items-center gap-3 rounded-xl p-3.5 ${TASK_TONE[task.status]}`} key={task.id}>
            <Icon
              className={task.status === 'DONE' ? 'text-primary' : 'text-outline'}
              filled={task.status === 'DONE'}
              name={TASK_ICON[task.status]}
            />
            <div className='min-w-0 flex-1'>
              <p
                className={`font-semibold ${task.status === 'SKIPPED' ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}
              >
                {task.title}
              </p>
              <p className='text-xs text-on-surface-variant tabular-nums'>
                {t(`caregiver.visitDetail.session.taskTypes.${task.taskType}`)}
                {task.scheduledTime ? ` · ${shortTime(task.scheduledTime)}` : ''}
                {task.skipReason ? ` · ${task.skipReason}` : ''}
              </p>
            </div>
            {active ? (
              <div className='flex gap-2'>
                {task.status === 'PENDING' ? (
                  <>
                    <button
                      className='min-h-11 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-50'
                      disabled={update.isPending}
                      onClick={() => update.mutate({ task, request: { status: 'DONE' } })}
                      type='button'
                    >
                      {t('caregiver.visitDetail.session.done')}
                    </button>
                    <button
                      className='min-h-11 rounded-xl border border-outline-variant/30 bg-white px-3.5 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container'
                      onClick={() => setSkipping(task)}
                      type='button'
                    >
                      {t('caregiver.visitDetail.session.skip')}
                    </button>
                  </>
                ) : (
                  <button
                    className='min-h-11 rounded-xl border border-outline-variant/30 bg-white px-3.5 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50'
                    disabled={update.isPending}
                    onClick={() => update.mutate({ task, request: { status: 'PENDING' } })}
                    type='button'
                  >
                    {t('caregiver.visitDetail.session.undo')}
                  </button>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {active ? (
        <div className='mt-5 flex flex-col gap-4'>
          <form
            className='flex flex-wrap gap-2'
            onSubmit={(event) => {
              event.preventDefault()
              if (title.trim()) add.mutate(title.trim())
            }}
          >
            <label className='sr-only' htmlFor='custom-task'>
              {t('caregiver.visitDetail.session.addLabel')}
            </label>
            <input
              className='min-h-11 min-w-0 flex-1 rounded-xl border border-outline-variant/60 bg-white px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
              id='custom-task'
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('caregiver.visitDetail.session.addPlaceholder')}
              value={title}
            />
            <button
              className='min-h-11 rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-high disabled:opacity-50'
              disabled={!title.trim() || add.isPending}
              type='submit'
            >
              {t('caregiver.visitDetail.session.add')}
            </button>
          </form>
          {error ? (
            <p className='rounded-lg bg-error-container/40 p-3 text-sm text-error' role='alert'>
              {t(bookingErrorKey(error))}
            </p>
          ) : null}
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4'>
            <p className='text-sm text-on-surface-variant'>
              {pending > 0
                ? t('caregiver.visitDetail.session.pendingLeft', { count: pending })
                : t('caregiver.visitDetail.session.readyToFinish')}
            </p>
            <button
              className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-50'
              disabled={pending > 0 || finish.isPending}
              onClick={() => finish.mutate()}
              type='button'
            >
              <Icon className='text-lg' name='logout' />
              {finish.isPending ? t('booking.actions.working') : t('caregiver.visitDetail.session.checkOut')}
            </button>
          </div>
        </div>
      ) : null}

      {skipping ? (
        <BookingReasonDialog
          confirmLabel={t('caregiver.visitDetail.session.skip')}
          error={update.error ? t(bookingErrorKey(update.error)) : undefined}
          label={t('caregiver.visitDetail.session.skipReason')}
          maxLength={500}
          onClose={() => setSkipping(null)}
          onConfirm={(reason) => update.mutate({ task: skipping, request: { status: 'SKIPPED', skipReason: reason } })}
          pending={update.isPending}
          title={t('caregiver.visitDetail.session.skipTitle', { title: skipping.title })}
        />
      ) : null}
    </SectionCard>
  )
}
