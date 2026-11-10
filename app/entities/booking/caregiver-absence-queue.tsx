import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  bookingKeys,
  concludeAbsence,
  explainAbsence,
  fetchCaregiverAbsences
} from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CaregiverAbsenceRecord, ListCaregiverAbsencesParams } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { CaregiverAbsenceCard } from './caregiver-absence-card'

const VISIBLE = 5
const key = 'caregiverAbsence' as const
const button =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const primary = `${button} bg-primary text-on-primary hover:bg-primary-container`
const outline = `${button} border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low`

/** Absences still waiting for the center, newest visit first; BookingService scopes them to the signed-in role. */
export function usePendingAbsences(bookingId?: string) {
  const params: ListCaregiverAbsencesParams = { status: 'PENDING', bookingId, page: 0, size: 50 }
  return useQuery({
    queryKey: bookingKeys.absences(params),
    queryFn: () => fetchCaregiverAbsences(params),
    refetchInterval: 60_000,
    retry: false
  })
}

type Pending = { item: CaregiverAbsenceRecord; action: 'excuse' | 'confirm' | 'explain' }

/**
 * Absences awaiting a conclusion (2026-11-10). `role='manager'` lists the center's and concludes each one (excused or
 * violation, with a note); `role='caregiver'` lists the caregiver's own and sends or edits the explanation. Hidden when
 * nothing waits. Money is not handled here: the customer was already refunded the visit in full.
 */
export function CaregiverAbsenceQueue({
  role,
  nameOf
}: {
  role: 'manager' | 'caregiver'
  /** Manager only: caregiver ID → name. */
  nameOf?: (caregiverId: string) => string | undefined
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const absences = usePendingAbsences()
  const [pending, setPending] = useState<Pending | null>(null)
  const mutation = useMutation({
    mutationFn: ({ item, action, text }: Pending & { text: string }) =>
      action === 'explain'
        ? explainAbsence(item.id, { explanation: text })
        : concludeAbsence(item.id, { decision: action === 'excuse' ? 'EXCUSED' : 'CONFIRMED', note: text }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.allAbsences })
      setPending(null)
    }
  })
  const items = absences.data?.items ?? []
  if (!absences.isSuccess || items.length === 0) return null
  const total = absences.data.totalElements
  const copy = role === 'manager' ? (`${key}.manager` as const) : (`${key}.caregiverPanel` as const)

  function open(item: CaregiverAbsenceRecord, action: Pending['action']) {
    mutation.reset()
    setPending({ item, action })
  }

  return (
    <section
      aria-labelledby='caregiver-absences-title'
      className='rounded-2xl border border-error/30 bg-error-container/30 p-4 sm:p-5'
    >
      <h2 className='flex items-center gap-2 text-base font-semibold text-on-surface' id='caregiver-absences-title'>
        <Icon className='text-xl text-error' name='person_off' />
        {t(`${copy}.title`, { count: total })}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>{t(`${copy}.description`)}</p>
      <ul className='mt-3 flex flex-col gap-2'>
        {items.slice(0, VISIBLE).map((item) => (
          <CaregiverAbsenceCard
            actions={
              role === 'manager' ? (
                <>
                  <Link className={outline} to={`/center-manager/bookings/${item.bookingId}`}>
                    {t(`${key}.openBooking`)}
                  </Link>
                  <button className={outline} onClick={() => open(item, 'excuse')} type='button'>
                    {t(`${key}.manager.excuse`)}
                  </button>
                  <button className={primary} onClick={() => open(item, 'confirm')} type='button'>
                    {t(`${key}.manager.confirm`)}
                  </button>
                </>
              ) : (
                <>
                  <Link className={outline} to={`/caregiver/visits/${item.occurrenceId}`}>
                    {t(`${key}.openVisit`)}
                  </Link>
                  <button className={primary} onClick={() => open(item, 'explain')} type='button'>
                    {t(`${key}.caregiverPanel.${item.explanation ? 'editExplanation' : 'explain'}`)}
                  </button>
                </>
              )
            }
            item={item}
            key={item.id}
            meta={
              role === 'manager'
                ? t(`${key}.caregiver`, { name: nameOf?.(item.caregiverId) ?? t(`${key}.unknownCaregiver`) })
                : t(`${key}.refunded`)
            }
          />
        ))}
      </ul>
      {total > VISIBLE ? (
        <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.more`, { count: total - VISIBLE })}</p>
      ) : null}

      {pending?.action === 'explain' ? (
        <BookingReasonDialog
          confirmLabel={t(`${key}.caregiverPanel.explain`)}
          description={t(`${key}.caregiverPanel.explainHint`)}
          error={mutation.error ? t(bookingErrorKey(mutation.error)) : undefined}
          label={t(`${key}.caregiverPanel.explanationLabel`)}
          minLength={10}
          onClose={() => setPending(null)}
          onConfirm={(text) => mutation.mutate({ ...pending, text })}
          pending={mutation.isPending}
          title={t(`${key}.caregiverPanel.explainTitle`, { number: pending.item.occurrenceNo ?? '' })}
        />
      ) : null}
      {pending && pending.action !== 'explain' ? (
        <BookingReasonDialog
          confirmLabel={t(`${key}.manager.${pending.action}`)}
          danger={pending.action === 'confirm'}
          description={t(`${key}.manager.${pending.action}Hint`)}
          error={mutation.error ? t(bookingErrorKey(mutation.error)) : undefined}
          label={t(`${key}.manager.note`)}
          onClose={() => setPending(null)}
          onConfirm={(text) => mutation.mutate({ ...pending, text })}
          pending={mutation.isPending}
          title={t(`${key}.manager.${pending.action}Title`, { number: pending.item.occurrenceNo ?? '' })}
        />
      ) : null}
    </section>
  )
}
