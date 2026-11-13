import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, concludeAbsence, explainAbsence, fetchCaregiverAbsences } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CaregiverAbsenceRecord, ListCaregiverAbsencesParams } from '~/shared/api/generated/contracts'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { BookingGroupCard, groupByBooking } from './booking-group-card'
import { CaregiverAbsenceCard } from './caregiver-absence-card'
import { CenterCheckInDialog } from './center-check-in-dialog'

const key = 'caregiverAbsence' as const
const button =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const primary = `${button} bg-primary text-on-primary hover:bg-primary-container`
const outline = `${button} border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low`

/** Absences still waiting for the center, newest visit first; BookingService scopes them to the signed-in role. */
export function usePendingAbsences(bookingId?: string, page = 0, size = 50) {
  const params: ListCaregiverAbsencesParams = { status: 'PENDING', bookingId, page, size }
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
 * violation, with a note); `role='caregiver'` lists the caregiver's own and sends or edits the explanation. Visits are
 * folded per booking (2026-11-11; the first booking opens), paged by BookingService. Money is not handled here: the customer was already refunded the visit in full.
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
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const absences = usePendingAbsences(undefined, page, size)
  const [pending, setPending] = useState<Pending | null>(null)
  const [checkingIn, setCheckingIn] = useState<CaregiverAbsenceRecord | null>(null)
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
  if (absences.isPending) return <SkeletonBlock label={t('centerManager.attention.loading')} rows={2} />
  if (absences.isError) {
    return (
      <ErrorState
        message={t(bookingErrorKey(absences.error))}
        onRetry={() => void absences.refetch()}
        retryLabel={t('booking.actions.retry')}
      />
    )
  }
  if (items.length === 0) return <EmptyState icon='task_alt' title={t('centerManager.attention.empty')} />
  const total = absences.data.totalElements
  const copy = role === 'manager' ? (`${key}.manager` as const) : (`${key}.caregiverPanel` as const)

  function open(item: CaregiverAbsenceRecord, action: Pending['action']) {
    mutation.reset()
    setPending({ item, action })
  }

  return (
    <div>
      <p className='text-sm text-on-surface-variant'>{t(`${copy}.description`)}</p>
      <ul className='mt-3 flex flex-col gap-2'>
        {groupByBooking(items).map(({ bookingId, rows }, index) => (
          <BookingGroupCard
            bookingCode={rows[0].bookingCode}
            countLabel={t(`${key}.pendingCount`, { count: rows.length })}
            defaultOpen={index === 0}
            href={role === 'manager' ? `/center-manager/bookings/${bookingId}` : undefined}
            key={bookingId}
            recipientName={rows[0].recipientName}
          >
            {rows.map((item) => (
              <CaregiverAbsenceCard
                actions={
                  role === 'manager' ? (
                    <>
                      {/* 2026-11-13: the caregiver did the visit but forgot to check in; refused once refunded (5277). */}
                      {item.source === 'MISSED_CHECK_IN' ? (
                        <button className={primary} onClick={() => setCheckingIn(item)} type='button'>
                          {t('centerManager.bookingDetail.occurrence.checkIn')}
                        </button>
                      ) : null}
                      <button className={outline} onClick={() => open(item, 'excuse')} type='button'>
                        {t(`${key}.manager.excuse`)}
                      </button>
                      <button className={outline} onClick={() => open(item, 'confirm')} type='button'>
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
          </BookingGroupCard>
        ))}
      </ul>
      <Pagination
        className='mt-4'
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setSize(next)
          setPage(0)
        }}
        page={page}
        pageSize={size}
        pageSizeOptions={[5, 10, 20]}
        totalElements={total}
        totalPages={Math.ceil(total / size)}
      />

      {checkingIn ? (
        <CenterCheckInDialog
          occurrenceId={checkingIn.occurrenceId}
          occurrenceNo={checkingIn.occurrenceNo}
          onClose={() => setCheckingIn(null)}
          startAt={checkingIn.startAt}
        />
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
    </div>
  )
}
