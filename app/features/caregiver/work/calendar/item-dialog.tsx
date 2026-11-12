import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toastSuccess } from '~/shared/ui/app-toast'

import { providerKeys, updateCaregiverSchedule } from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'

import { minutesOfTimes, useCaregiverFormat } from '../../ui/caregiver-format'
import { VisitStatusBadge } from '../../ui/visit-status-badge'
import { clockOf, type CalendarItem } from './calendar-model'

const STATE_TONE = { open: 'info', past: 'neutral', cancelled: 'error' } as const

/**
 * Details of a calendar item in a centred dialog. An open future availability slot can be
 * cancelled here with a reason, sending the slot's version as before.
 */
export function CalendarItemDialog({ item, onClose }: { item: CalendarItem | null; onClose: () => void }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonMissing, setReasonMissing] = useState(false)
  const cancel = useMutation({
    mutationFn: () => {
      if (item?.kind !== 'availability') throw new Error('Not an availability slot')
      return updateCaregiverSchedule(item.slot.id, {
        status: 'CANCELLED',
        version: item.slot.version,
        reason: reason.trim()
      })
    },
    onSuccess: async () => {
      toastSuccess(t('caregiver.work.calendar.slot.cancelledToast'))
      closeConfirm()
      onClose()
      await queryClient.invalidateQueries({ queryKey: providerKeys.mySchedules })
    }
  })

  function closeConfirm() {
    setConfirming(false)
    setReason('')
    setReasonMissing(false)
  }

  if (!item) return null
  const range =
    item.kind === 'timeOff' && item.allDay
      ? t('caregiver.work.timeOff.allDay')
      : `${clockOf(item.start)}–${clockOf(item.end)}`
  const title =
    item.kind === 'availability'
      ? t('caregiver.work.calendar.slot.title')
      : item.kind === 'visit'
        ? (item.visit.recipientName ?? t('caregiver.work.calendar.layers.visit'))
        : t('caregiver.work.calendar.layers.timeOff')
  const canCancel = item.kind === 'availability' && item.state === 'open'

  return (
    <>
      <Modal
        description={`${format.weekdayLong(item.day)}, ${format.date(item.day)}`}
        footer={
          canCancel ? (
            <Button
              className='w-full sm:w-auto'
              leftIcon={<Icon className='text-lg' name='event_busy' />}
              onClick={() => {
                cancel.reset()
                setConfirming(true)
              }}
              variant='danger'
            >
              {t('caregiver.work.calendar.slot.cancel')}
            </Button>
          ) : item.kind === 'visit' ? (
            <Link
              className='cg-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container sm:w-auto'
              to={`/caregiver/visits/${item.visit.id}`}
            >
              {t('caregiver.ui.actions.viewDetail')}
              <Icon className='text-lg' name='arrow_forward' />
            </Link>
          ) : item.kind === 'timeOff' ? (
            <Link
              className='cg-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-brand-50 sm:w-auto'
              to='/caregiver/time-off'
            >
              {t('caregiver.work.calendar.manageTimeOff')}
            </Link>
          ) : undefined
        }
        onClose={onClose}
        open
        size='md'
        title={title}
      >
        <dl className='flex flex-col gap-4 text-[15px]'>
          <div>
            <dt className='text-sm text-on-surface-variant'>{t('caregiver.visitDetail.when')}</dt>
            <dd className='text-2xl font-bold text-on-surface tabular-nums'>{range}</dd>
            {item.kind === 'availability' ? (
              <dd className='text-sm text-on-surface-variant'>
                {format.duration(minutesOfTimes(item.slot.startTime, item.slot.endTime))}
              </dd>
            ) : null}
          </div>
          {item.kind === 'availability' ? (
            <>
              <div>
                <dt className='text-sm text-on-surface-variant'>{t('caregiver.work.calendar.slot.status')}</dt>
                <dd className='mt-1'>
                  <StatusBadge dot tone={STATE_TONE[item.state]}>
                    {t(`caregiver.work.calendar.slot.${item.state}`)}
                  </StatusBadge>
                </dd>
              </div>
              {item.state === 'open' ? (
                <p className='rounded-lg bg-brand-50 p-3 text-sm text-primary'>
                  {t('caregiver.work.calendar.slot.explain')}
                </p>
              ) : null}
              {item.slot.note ? (
                <div>
                  <dt className='text-sm text-on-surface-variant'>{t('caregiver.work.calendar.slot.note')}</dt>
                  <dd>{item.slot.note}</dd>
                </div>
              ) : null}
              {item.slot.cancellationReason ? (
                <p className='text-sm text-on-surface-variant'>
                  {t('caregiver.work.calendar.slot.cancelledReason', { reason: item.slot.cancellationReason })}
                </p>
              ) : null}
            </>
          ) : null}
          {item.kind === 'visit' ? (
            <div>
              <dt className='sr-only'>{t('caregiver.work.calendar.slot.status')}</dt>
              <dd className='flex flex-col items-start gap-2'>
                <VisitStatusBadge status={item.visit.status} />
                {item.visit.serviceAddress ? (
                  <span className='flex items-start gap-1.5 text-sm text-on-surface-variant'>
                    <Icon className='mt-0.5 text-base text-primary' name='location_on' />
                    {item.visit.serviceAddress}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          {item.kind === 'timeOff' && item.record.reason ? (
            <div>
              <dt className='text-sm text-on-surface-variant'>{t('caregiver.work.timeOff.form.reason')}</dt>
              <dd>{item.record.reason}</dd>
            </div>
          ) : null}
        </dl>
      </Modal>

      {item.kind === 'availability' ? (
        <ConfirmDialog
          confirmLabel={t('caregiver.work.calendar.slot.cancel')}
          danger
          description={t('caregiver.work.calendar.slot.cancelDescription', {
            date: `${format.weekday(item.day)}, ${format.date(item.day)}`,
            start: clockOf(item.start),
            end: clockOf(item.end)
          })}
          error={cancel.isError ? t(apiRequestErrorKey(cancel.error, 'caregiver.provider.actionError')) : undefined}
          loading={cancel.isPending}
          onClose={closeConfirm}
          onConfirm={() => {
            if (!reason.trim()) {
              setReasonMissing(true)
              return
            }
            cancel.mutate()
          }}
          open={confirming}
          title={t('caregiver.work.calendar.slot.cancelTitle')}
        >
          <label className='block text-sm font-semibold text-on-surface' htmlFor='slot-cancel-reason'>
            {t('caregiver.work.calendar.slot.reason')}
          </label>
          <textarea
            aria-describedby={reasonMissing ? 'slot-cancel-reason-error' : undefined}
            aria-invalid={reasonMissing}
            className='mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25'
            id='slot-cancel-reason'
            maxLength={500}
            onChange={(event) => {
              setReason(event.target.value)
              if (event.target.value.trim()) setReasonMissing(false)
            }}
            value={reason}
          />
          {reasonMissing ? (
            <p className='mt-1 text-sm text-error' id='slot-cancel-reason-error'>
              {t('caregiver.work.calendar.slot.reasonRequired')}
            </p>
          ) : null}
        </ConfirmDialog>
      ) : null}
    </>
  )
}
