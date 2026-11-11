import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, explainAbsence } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { usePendingAbsences } from '~/entities/booking/caregiver-absence-queue'
import type { CaregiverAbsenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { AbsenceStateBadge } from '../../ui/visit-absence-badge'

const BOOKINGS_PER_PAGE = 3
const key = 'caregiver.visits.absence' as const

interface AbsenceGroup {
  bookingId: string
  bookingCode?: string
  recipientName?: string
  items: CaregiverAbsenceRecord[]
}

function groupByBooking(items: CaregiverAbsenceRecord[]): AbsenceGroup[] {
  const groups = new Map<string, AbsenceGroup>()
  for (const item of items) {
    const group = groups.get(item.bookingId) ?? {
      bookingId: item.bookingId,
      bookingCode: item.bookingCode,
      recipientName: item.recipientName,
      items: []
    }
    group.items.push(item)
    groups.set(item.bookingId, group)
  }
  for (const group of groups.values()) group.items.sort((first, second) => first.startAt.localeCompare(second.startAt))
  return [...groups.values()]
}

/**
 * Absences still waiting for the center (2026-11-10), gathered per booking so many missed visits never stretch the
 * page: a collapsible red panel, three bookings a page, each booking folding its missed visits with the explanation
 * action. Hidden when nothing waits.
 */
export function AbsencePanel() {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const absences = usePendingAbsences()
  const [open, setOpen] = useState(true)
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [explaining, setExplaining] = useState<CaregiverAbsenceRecord | null>(null)
  const explain = useMutation({
    mutationFn: ({ item, text }: { item: CaregiverAbsenceRecord; text: string }) =>
      explainAbsence(item.id, { explanation: text }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.allAbsences })
      setExplaining(null)
    }
  })
  const items = absences.data?.items ?? []
  if (!absences.isSuccess || items.length === 0) return null

  const groups = groupByBooking(items)
  const totalPages = Math.ceil(groups.length / BOOKINGS_PER_PAGE)
  const currentPage = Math.min(page, totalPages - 1)
  const shown = groups.slice(currentPage * BOOKINGS_PER_PAGE, (currentPage + 1) * BOOKINGS_PER_PAGE)
  const unexplained = items.filter((item) => !item.explanation).length

  return (
    <section
      aria-labelledby='caregiver-absence-panel-title'
      className='overflow-hidden rounded-2xl border border-error/25 bg-gradient-to-br from-error-container/50 to-surface-container-lowest'
    >
      <button
        aria-controls='caregiver-absence-panel-body'
        aria-expanded={open}
        className='flex w-full items-start gap-3 p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-error sm:p-5'
        onClick={() => setOpen((value) => !value)}
        type='button'
      >
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-error text-on-error'>
          <Icon className='text-xl' name='person_off' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-base font-semibold text-on-surface' id='caregiver-absence-panel-title'>
            {t('caregiverAbsence.caregiverPanel.title', { count: absences.data.totalElements })}
          </span>
          <span className='mt-0.5 block text-sm text-on-surface-variant'>
            {t(`${key}.summary`, { bookings: groups.length, unexplained })}
          </span>
        </span>
        <Icon
          className={`mt-2 shrink-0 text-xl text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
          name='expand_more'
        />
      </button>

      {open ? (
        <div className='flex flex-col gap-2 px-4 pb-4 sm:px-5 sm:pb-5' id='caregiver-absence-panel-body'>
          <p className='text-sm text-on-surface-variant'>{t('caregiverAbsence.caregiverPanel.description')}</p>
          <ul className='flex flex-col gap-2'>
            {shown.map((group) => {
              const isOpen = expanded === group.bookingId || groups.length === 1
              const waiting = group.items.filter((item) => !item.explanation).length
              return (
                <li
                  className='rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/70'
                  key={group.bookingId}
                >
                  <div className='flex flex-wrap items-center gap-3 p-3'>
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-on-surface'>
                        {group.recipientName ?? t('caregiver.visits.patientFallback')}
                        <span className='ml-2 font-mono text-xs font-normal text-on-surface-variant'>
                          {group.bookingCode}
                        </span>
                      </p>
                      <p className='mt-0.5 flex flex-wrap gap-x-3 text-xs text-on-surface-variant'>
                        <span>{t(`${key}.missedCount`, { count: group.items.length })}</span>
                        {waiting ? (
                          <span className='font-semibold text-error'>{t(`${key}.waiting`, { count: waiting })}</span>
                        ) : null}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center gap-1.5'>
                      <Link
                        className='inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold text-forest-900 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-forest-900'
                        to={`/caregiver/visits/bookings/${group.bookingId}?from=done`}
                      >
                        {t(`${key}.openBooking`)}
                      </Link>
                      {groups.length > 1 ? (
                        <button
                          aria-expanded={isOpen}
                          className='inline-flex min-h-9 items-center gap-1 rounded-full border border-outline-variant bg-white px-3 text-xs font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-forest-900'
                          onClick={() => setExpanded(isOpen ? null : group.bookingId)}
                          type='button'
                        >
                          {isOpen ? t(`${key}.collapse`) : t(`${key}.expand`)}
                          <Icon
                            className={`text-base transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            name='expand_more'
                          />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {isOpen ? (
                    <ul className='divide-y divide-outline-variant/50 border-t border-outline-variant/60'>
                      {group.items.map((item) => (
                        <li className='flex flex-col gap-2 p-3 sm:flex-row sm:items-center' key={item.id}>
                          <div className='min-w-0 flex-1 text-sm'>
                            <p className='flex flex-wrap items-center gap-2 font-semibold text-on-surface tabular-nums'>
                              {t(`${key}.visitLine`, {
                                number: item.occurrenceNo ?? '',
                                day: format.shortDay(calendarDayOf(item.startAt)),
                                time: format.clockRange(item.startAt, item.endAt)
                              })}
                              <AbsenceStateBadge absence={item} />
                            </p>
                            <p className='mt-0.5 line-clamp-2 text-xs text-on-surface-variant'>
                              {item.explanation
                                ? t('caregiverAbsence.explanation', { text: item.explanation })
                                : t('caregiverAbsence.noExplanation')}
                            </p>
                          </div>
                          <div className='flex shrink-0 gap-1.5'>
                            <Link
                              className='inline-flex min-h-9 items-center rounded-full border border-outline-variant bg-white px-3 text-xs font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-forest-900'
                              to={`/caregiver/visits/${item.occurrenceId}`}
                            >
                              {t('caregiverAbsence.openVisit')}
                            </Link>
                            <button
                              className='inline-flex min-h-9 items-center rounded-full bg-forest-900 px-3 text-xs font-semibold text-white hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                              onClick={() => {
                                explain.reset()
                                setExplaining(item)
                              }}
                              type='button'
                            >
                              {item.explanation
                                ? t('caregiverAbsence.caregiverPanel.editExplanation')
                                : t('caregiverAbsence.caregiverPanel.explain')}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <Pagination
            ariaLabel={t(`${key}.pagination`)}
            className='mt-1'
            onPageChange={setPage}
            page={currentPage}
            totalPages={totalPages}
          />
          {absences.data.totalElements > items.length ? (
            <p className='text-xs text-on-surface-variant'>
              {t('caregiverAbsence.more', { count: absences.data.totalElements - items.length })}
            </p>
          ) : null}
        </div>
      ) : null}

      {explaining ? (
        <BookingReasonDialog
          confirmLabel={t('caregiverAbsence.caregiverPanel.explain')}
          description={t('caregiverAbsence.caregiverPanel.explainHint')}
          error={explain.error ? t(bookingErrorKey(explain.error)) : undefined}
          label={t('caregiverAbsence.caregiverPanel.explanationLabel')}
          minLength={10}
          onClose={() => setExplaining(null)}
          onConfirm={(text) => explain.mutate({ item: explaining, text })}
          pending={explain.isPending}
          title={t('caregiverAbsence.caregiverPanel.explainTitle', { number: explaining.occurrenceNo ?? '' })}
        />
      ) : null}
    </section>
  )
}
