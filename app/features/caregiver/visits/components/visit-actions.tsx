import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingKeys, reportNoShow } from '~/entities/booking/booking-api'
import { bookingErrorKey, hasStarted } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { checkInWindow, nextVisitStep, useVisitActions } from '../../data/use-visit-actions'
import { StickyActionBar, SuccessCheck } from '../../ui/action-bits'
import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { useNow } from '../../ui/use-now'

/**
 * Next step of a visit without a care session: accept it, start it inside the check-in window, or report that the
 * customer is not there. The main button sits in the sticky bar on phones.
 */
export function VisitActions({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const now = useNow()
  const [reporting, setReporting] = useState(false)
  const [celebrate, setCelebrate] = useState<string | null>(null)
  const { accept, start } = useVisitActions(visit)
  const noShow = useMutation({
    mutationFn: (note: string) => reportNoShow(visit.id, note),
    onSuccess: async () => {
      setReporting(false)
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    }
  })

  const waiting = visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED'
  if (!waiting) return null
  if (visit.noShowReportedAt)
    return (
      <p className='flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-container p-4 text-sm font-medium text-on-warning-container'>
        <Icon className='text-lg' name='pending' />
        {t('caregiver.visitDetail.noShowAwaiting')}
      </p>
    )

  const step = nextVisitStep(visit, now)
  const { opens, closes } = checkInWindow(visit)
  const opensAt = format.clock(new Date(opens).toISOString())
  const closesAt = format.clock(new Date(closes).toISOString())
  const tooLate = now >= closes
  const started = hasStarted(visit.startAt, now)
  const hasAction = step === 'accept' || step === 'start' || step === 'waitToStart' || started

  return (
    <section aria-labelledby='visit-next-step' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='text-base font-semibold text-on-surface' id='visit-next-step'>
        {t('caregiver.visitDetail.nextStep')}
      </h2>
      {celebrate ? <SuccessCheck label={celebrate} /> : null}
      {tooLate ? (
        <p className='mt-2 rounded-lg bg-warning-container p-3 text-sm text-on-warning-container tabular-nums'>
          {t('caregiver.visitDetail.checkInClosed', { time: closesAt })}
        </p>
      ) : (
        <p className='mt-1 text-sm text-on-surface-variant tabular-nums'>
          {t('caregiver.visitDetail.checkInHint', { time: opensAt, closes: closesAt })}
        </p>
      )}

      {hasAction ? (
        <StickyActionBar>
          {step === 'accept' ? (
            <Button
              leftIcon={<Icon className='text-lg' name='thumb_up' />}
              loading={accept.isPending}
              onClick={() =>
                accept.mutate(undefined, { onSuccess: () => setCelebrate(t('caregiver.visitDetail.actions.accepted')) })
              }
              size='lg'
            >
              {t('caregiver.visitDetail.actions.accept')}
            </Button>
          ) : null}
          {step === 'start' || step === 'waitToStart' ? (
            <Button
              disabled={step === 'waitToStart'}
              leftIcon={<Icon className='text-lg' name='play_arrow' />}
              loading={start.isPending}
              onClick={() => start.mutate()}
              size='lg'
            >
              {step === 'waitToStart'
                ? t('caregiver.visitDetail.actions.opensAt', { time: opensAt })
                : t('caregiver.visitDetail.actions.start')}
            </Button>
          ) : null}
          {started ? (
            <Button
              className='text-error'
              leftIcon={<Icon className='text-lg' name='person_off' />}
              onClick={() => setReporting(true)}
              size='lg'
              variant='outline'
            >
              {t('caregiver.visitDetail.reportNoShow')}
            </Button>
          ) : null}
        </StickyActionBar>
      ) : null}

      {reporting ? (
        <BookingReasonDialog
          confirmLabel={t('caregiver.visitDetail.reportNoShow')}
          danger
          description={t('caregiver.visitDetail.noShowHint')}
          error={noShow.error ? t(bookingErrorKey(noShow.error)) : undefined}
          label={t('caregiver.visitDetail.noShowNote')}
          minLength={10}
          onClose={() => setReporting(false)}
          onConfirm={(note) => noShow.mutate(note)}
          pending={noShow.isPending}
          title={t('caregiver.visitDetail.noShowTitle')}
        />
      ) : null}
    </section>
  )
}
