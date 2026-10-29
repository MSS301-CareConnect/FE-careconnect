import { useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { formatDateTime } from '~/entities/booking/booking-format'
import {
  cancelMyShiftRegistration,
  fetchMyCaregiverProfile,
  fetchMyShiftRegistrations,
  fetchWorkShift,
  fetchWorkShifts,
  providerKeys,
  registerForShift
} from '~/entities/provider/provider-api'
import { formatProviderDate, formatProviderTime } from '~/entities/provider/provider-format'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

const key = 'caregiver.provider' as const
const registrationStatusKeys = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const
// A registration that still holds the caregiver's place on the shift.
const ACTIVE_REGISTRATION = new Set(['PENDING', 'APPROVED'])
const panel = 'overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs'

function shiftStart(shift: ProviderWorkShiftRecord) {
  return new Date(`${shift.workDate}T${shift.startTime}`).getTime()
}

/** Open shifts of the caregiver's center to register for, and the caregiver's own registrations. */
export function CaregiverWorkShiftsPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [registrationPage, setRegistrationPage] = useState(0)
  const [registering, setRegistering] = useState<ProviderWorkShiftRecord | null>(null)
  const [note, setNote] = useState('')
  const [pendingCancel, setPendingCancel] = useState<{ id: string; version: number } | null>(null)
  const profile = useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
  const centerId = profile.data?.centerId ?? ''
  const shifts = useQuery({
    queryKey: [...providerKeys.shifts(centerId), 'OPEN', page],
    queryFn: () => fetchWorkShifts({ centerId, status: 'OPEN', page, size: 20 }),
    enabled: Boolean(centerId),
    retry: false
  })
  const registrations = useQuery({
    queryKey: [...providerKeys.myRegistrations, registrationPage],
    queryFn: () => fetchMyShiftRegistrations({ page: registrationPage, size: 20 }),
    retry: false
  })
  // A registration carries only the shift ID, so the shift's date and hours are read separately.
  const registeredShifts = useQueries({
    queries: (registrations.data?.items ?? []).map((item) => ({
      queryKey: providerKeys.shift(item.workShiftId),
      queryFn: () => fetchWorkShift(item.workShiftId),
      retry: false,
      staleTime: 5 * 60_000
    }))
  })
  const register = useMutation({
    mutationFn: (shift: ProviderWorkShiftRecord) =>
      registerForShift(shift.id, { caregiverNote: note.trim() || undefined }),
    onSuccess: async () => {
      closeRegister()
      await queryClient.invalidateQueries({ queryKey: providerKeys.myRegistrations })
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
    }
  })
  const cancel = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => cancelMyShiftRegistration(id, version),
    onSuccess: async () => {
      setPendingCancel(null)
      await queryClient.invalidateQueries({ queryKey: providerKeys.myRegistrations })
    }
  })
  useDocumentTitle(t(`${key}.workShiftsTitle`))

  // Fixed when the page opens so the list does not shift between renders.
  const [now] = useState(() => Date.now())
  // A shift that has already started can no longer be worked from registration.
  const upcoming = (shifts.data?.items ?? []).filter((shift) => shiftStart(shift) > now)
  const registeredIds = new Set(
    (registrations.data?.items ?? [])
      .filter((item) => ACTIVE_REGISTRATION.has(item.registrationStatus))
      .map((item) => item.workShiftId)
  )

  function openRegister(shift: ProviderWorkShiftRecord) {
    register.reset()
    setNote('')
    setRegistering(shift)
  }
  function closeRegister() {
    setRegistering(null)
    setNote('')
  }
  const timeRange = (shift: ProviderWorkShiftRecord) =>
    `${formatProviderTime(shift.startTime, language)}–${formatProviderTime(shift.endTime, language)}`

  return (
    <main className='mx-auto max-w-5xl space-y-7 px-4 py-8 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='max-w-2xl'>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.workShiftsTitle`)}</h1>
          {profile.data?.centerName ? (
            <p className='mt-1 text-sm font-semibold text-primary'>{profile.data.centerName}</p>
          ) : null}
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.shiftsIntro`)}</p>
        </div>
        {shifts.isSuccess ? (
          <span className='rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary tabular-nums'>
            {t(`${key}.openShiftsCount`, { count: upcoming.length })}
          </span>
        ) : null}
      </header>
      {profile.isError ? <p role='alert'>{t(`${key}.profileError`)}</p> : null}

      <section aria-labelledby='open-shifts-title' className={panel}>
        <h2
          className='flex items-center gap-2 border-b border-outline-variant/60 p-5 text-lg font-bold'
          id='open-shifts-title'
        >
          <Icon className='text-primary' name='event_available' />
          {t(`${key}.openShiftsTitle`)}
        </h2>
        {shifts.isPending && !profile.isError ? (
          <p className='p-5 text-sm text-on-surface-variant' role='status'>
            {t(`${key}.loading`)}
          </p>
        ) : null}
        {shifts.isError ? (
          <p className='p-5 text-sm text-error' role='alert'>
            {t(`${key}.shiftsError`)}
          </p>
        ) : null}
        {shifts.isSuccess && upcoming.length === 0 ? (
          <p className='p-5 text-sm text-on-surface-variant'>{t(`${key}.shiftsEmpty`)}</p>
        ) : null}
        <ul className='divide-y divide-outline-variant/40'>
          {upcoming.map((shift) => {
            const closed = Boolean(shift.registrationDeadline) && new Date(shift.registrationDeadline!).getTime() <= now
            const registered = registeredIds.has(shift.id)
            return (
              <li className='flex flex-wrap items-center justify-between gap-3 p-5' key={shift.id}>
                <div className='min-w-0 space-y-1'>
                  <p className='font-bold tabular-nums'>
                    {formatProviderDate(shift.workDate, language)} · {timeRange(shift)}
                  </p>
                  <p className='text-sm text-on-surface-variant'>
                    {[shift.shiftType, shift.capacity ? t(`${key}.capacity`, { count: shift.capacity }) : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {shift.registrationDeadline ? (
                    <p className='text-sm text-on-surface-variant'>
                      {t(`${key}.deadline`, { time: formatDateTime(shift.registrationDeadline, language) })}
                    </p>
                  ) : null}
                  {shift.note ? <p className='text-sm text-on-surface-variant'>{shift.note}</p> : null}
                </div>
                {registered ? (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-success-container px-3 py-1.5 text-sm font-semibold text-on-success-container'>
                    <Icon className='text-base' name='check' />
                    {t(`${key}.alreadyRegistered`)}
                  </span>
                ) : closed ? (
                  <span className='text-sm font-semibold text-on-surface-variant'>{t(`${key}.deadlinePassed`)}</span>
                ) : (
                  <button
                    className='min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container'
                    onClick={() => openRegister(shift)}
                    type='button'
                  >
                    {t(`${key}.register`)}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {shifts.isSuccess && shifts.data.totalPages > 1 ? (
          <Pager
            onChange={setPage}
            page={page}
            pageLabel={t(`${key}.page`, { page: page + 1, pages: shifts.data.totalPages })}
            pages={shifts.data.totalPages}
          />
        ) : null}
      </section>

      <section aria-labelledby='my-registrations-title' className={panel}>
        <h2
          className='flex items-center gap-2 border-b border-outline-variant/60 p-5 text-lg font-bold'
          id='my-registrations-title'
        >
          <Icon className='text-primary' name='fact_check' />
          {t(`${key}.registrationsTitle`)}
        </h2>
        {registrations.isPending ? (
          <p className='p-5 text-sm text-on-surface-variant' role='status'>
            {t(`${key}.loading`)}
          </p>
        ) : null}
        {registrations.isError ? (
          <p className='p-5 text-sm text-error' role='alert'>
            {t(`${key}.registrationsError`)}
          </p>
        ) : null}
        {registrations.isSuccess && registrations.data.items.length === 0 ? (
          <p className='p-5 text-sm text-on-surface-variant'>{t(`${key}.registrationsEmpty`)}</p>
        ) : null}
        <ul className='divide-y divide-outline-variant/40'>
          {(registrations.data?.items ?? []).map((item, index) => {
            const shift = registeredShifts[index]
            return (
              <li className='flex flex-wrap items-center justify-between gap-3 p-5' key={item.id}>
                <div className='min-w-0 space-y-1'>
                  <p className='font-bold tabular-nums'>
                    {shift?.data
                      ? `${formatProviderDate(shift.data.workDate, language)} · ${timeRange(shift.data)}`
                      : shift?.isError
                        ? t(`${key}.shiftUnavailable`)
                        : t(`${key}.shiftLoading`)}
                  </p>
                  <ProviderStatusBadge
                    label={t(`${key}.${registrationStatusKeys[item.registrationStatus]}`)}
                    status={item.registrationStatus}
                  />
                  {item.caregiverNote ? (
                    <p className='text-sm text-on-surface-variant'>
                      {t(`${key}.yourNote`, { note: item.caregiverNote })}
                    </p>
                  ) : null}
                  {item.registrationStatus === 'REJECTED' && item.rejectionReason ? (
                    <p className='text-sm text-error'>
                      {t(`${key}.rejectionReason`, { reason: item.rejectionReason })}
                    </p>
                  ) : null}
                </div>
                {item.registrationStatus === 'PENDING' ? (
                  <button
                    className='min-h-11 rounded-xl border border-error/30 px-4 py-2 text-sm font-semibold text-error hover:bg-error-container'
                    onClick={() => setPendingCancel({ id: item.id, version: item.version })}
                    type='button'
                  >
                    {t(`${key}.cancelRegistration`)}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
        {registrations.isSuccess && registrations.data.totalPages > 1 ? (
          <Pager
            onChange={setRegistrationPage}
            page={registrationPage}
            pageLabel={t(`${key}.page`, { page: registrationPage + 1, pages: registrations.data.totalPages })}
            pages={registrations.data.totalPages}
          />
        ) : null}
      </section>

      <ConfirmDialog
        confirmLabel={t(`${key}.register`)}
        description={
          registering
            ? t(`${key}.registerDescription`, {
                date: formatProviderDate(registering.workDate, language),
                start: formatProviderTime(registering.startTime, language),
                end: formatProviderTime(registering.endTime, language)
              })
            : undefined
        }
        error={register.isError ? t(`${key}.actionError`) : undefined}
        loading={register.isPending}
        onClose={closeRegister}
        onConfirm={() => {
          if (registering) register.mutate(registering)
        }}
        open={registering !== null}
        title={t(`${key}.registerTitle`)}
      >
        <label className='block text-sm font-semibold text-on-surface' htmlFor='shift-registration-note'>
          {t(`${key}.noteOptional`)}
        </label>
        <textarea
          className='mt-2 min-h-20 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25'
          id='shift-registration-note'
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
      </ConfirmDialog>
      <ConfirmDialog
        confirmLabel={t(`${key}.cancelRegistration`)}
        description={t(`${key}.confirmCancel`)}
        error={cancel.isError ? t(`${key}.actionError`) : undefined}
        loading={cancel.isPending}
        onClose={() => setPendingCancel(null)}
        onConfirm={() => {
          if (pendingCancel) cancel.mutate(pendingCancel)
        }}
        open={Boolean(pendingCancel)}
        title={t(`${key}.cancelRegistration`)}
        tone='danger'
      />
    </main>
  )
}

function Pager({
  page,
  pages,
  pageLabel,
  onChange
}: {
  page: number
  pages: number
  pageLabel: string
  onChange: (page: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className='flex items-center justify-between border-t border-outline-variant/40 p-3 text-sm text-primary'>
      <button
        className='min-h-11 px-3 font-semibold disabled:opacity-40'
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        type='button'
      >
        {t(`${key}.previous`)}
      </button>
      <span className='tabular-nums text-on-surface-variant'>{pageLabel}</span>
      <button
        className='min-h-11 px-3 font-semibold disabled:opacity-40'
        disabled={page + 1 >= pages}
        onClick={() => onChange(page + 1)}
        type='button'
      >
        {t(`${key}.next`)}
      </button>
    </div>
  )
}
