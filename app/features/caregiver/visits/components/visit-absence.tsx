import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, explainAbsence } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { useAbsencesByVisit } from '../../data/caregiver-queries'
import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { AbsenceStateBadge } from '../../ui/visit-absence-badge'

/**
 * A missed visit's absence record on the visit page (2026-11-10): where it stands, the caregiver's explanation and the
 * center's conclusion, with "explain" while the center has not concluded — the same record as the visits tab panel.
 */
export function VisitAbsence({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const missed = visit.status === 'CAREGIVER_MISSED'
  const { byVisit } = useAbsencesByVisit(missed, visit.bookingId)
  const absence = missed ? byVisit.get(visit.id) : undefined
  const [explaining, setExplaining] = useState(false)
  const explain = useMutation({
    mutationFn: (text: string) => explainAbsence(absence?.id ?? '', { explanation: text }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.allAbsences })
      setExplaining(false)
    }
  })
  if (!absence) return null

  return (
    <section aria-labelledby='visit-absence-title' className={`${cgCard} border-error/25 p-4 sm:p-5`}>
      <div className='flex flex-wrap items-start gap-3'>
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-error-container text-on-error-container'>
          <Icon className='text-xl' name='person_off' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='flex flex-wrap items-center gap-2 font-semibold text-on-surface' id='visit-absence-title'>
            {t('caregiver.visits.absence.detailTitle')}
            <AbsenceStateBadge absence={absence} />
          </h2>
          <p className='mt-0.5 text-sm text-on-surface-variant'>{t('caregiverAbsence.refunded')}</p>
        </div>
        {absence.status === 'PENDING' ? (
          <Button
            leftIcon={<Icon className='text-lg' name='edit_note' />}
            onClick={() => {
              explain.reset()
              setExplaining(true)
            }}
            size='sm'
            variant='dark'
          >
            {absence.explanation
              ? t('caregiverAbsence.caregiverPanel.editExplanation')
              : t('caregiverAbsence.caregiverPanel.explain')}
          </Button>
        ) : null}
      </div>
      <dl className='mt-3 grid gap-2 text-sm sm:grid-cols-2'>
        <div className='rounded-xl bg-surface-container-low p-3'>
          <dt className='text-xs font-semibold text-on-surface-variant'>
            {t('caregiver.visits.absence.yourExplanation')}
          </dt>
          <dd className='mt-0.5 whitespace-pre-line text-on-surface'>
            {absence.explanation ?? t('caregiverAbsence.noExplanation')}
          </dd>
          {absence.explainedAt ? (
            <dd className='mt-1 text-xs text-on-surface-variant'>{format.shortDateTime(absence.explainedAt)}</dd>
          ) : null}
        </div>
        <div className='rounded-xl bg-surface-container-low p-3'>
          <dt className='text-xs font-semibold text-on-surface-variant'>
            {t('caregiver.visits.absence.centerConclusion')}
          </dt>
          <dd className='mt-0.5 whitespace-pre-line text-on-surface'>
            {absence.status === 'PENDING'
              ? t('caregiver.visits.absence.notConcluded')
              : (absence.conclusionNote ?? t(`caregiverAbsence.status.${absence.status}`))}
          </dd>
          {absence.concludedAt ? (
            <dd className='mt-1 text-xs text-on-surface-variant'>{format.shortDateTime(absence.concludedAt)}</dd>
          ) : null}
        </div>
      </dl>

      {explaining ? (
        <BookingReasonDialog
          confirmLabel={t('caregiverAbsence.caregiverPanel.explain')}
          description={t('caregiverAbsence.caregiverPanel.explainHint')}
          error={explain.error ? t(bookingErrorKey(explain.error)) : undefined}
          label={t('caregiverAbsence.caregiverPanel.explanationLabel')}
          minLength={10}
          onClose={() => setExplaining(false)}
          onConfirm={(text) => explain.mutate(text)}
          pending={explain.isPending}
          title={t('caregiverAbsence.caregiverPanel.explainTitle', { number: visit.occurrenceNo })}
        />
      ) : null}
    </section>
  )
}
