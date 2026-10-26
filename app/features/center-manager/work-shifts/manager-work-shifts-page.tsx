import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { formatProviderDate, formatProviderTime } from '~/entities/provider/provider-format'

import {
  createWorkShift,
  fetchShiftRegistrations,
  fetchWorkShift,
  fetchWorkShifts,
  providerKeys,
  removeWorkShift,
  reviewShiftRegistration,
  saveWorkShift
} from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { ProviderWorkShiftRecord, WorkShiftRequest } from '~/shared/api/generated/contracts'
import { apiErrorCode, apiErrorStatus } from '~/shared/api/error-details'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

const key = 'centerManager.provider' as const
const inputClass =
  'mt-1 w-full rounded-lg bg-surface-container-low px-3 py-3 outline-none focus:ring-2 focus:ring-primary/30'
const shiftStatuses = ['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'] as const
const shiftStatusKeys = {
  DRAFT: 'centerManager.provider.draft',
  OPEN: 'centerManager.provider.open',
  CLOSED: 'centerManager.provider.closed',
  CANCELLED: 'centerManager.provider.cancelled',
  COMPLETED: 'centerManager.provider.completed'
} as const
const registrationStatusKeys = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const

function shiftSaveErrorKey(error: unknown) {
  const status = apiErrorStatus(error)
  if (status === 400 || status === 422) return `${key}.shiftSaveInvalid` as const
  if (status === 401) return `${key}.shiftSaveUnauthenticated` as const
  if (status === 403) return `${key}.shiftSaveForbidden` as const
  if (status === 404) return `${key}.shiftSaveNotFound` as const
  if (status === 409) return `${key}.shiftSaveConflict` as const
  return `${key}.actionError` as const
}

function localDateTimeInput(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function ShiftEditor({
  centerId,
  shift,
  onDone
}: {
  centerId: string
  shift?: ProviderWorkShiftRecord
  onDone: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [workDate, setWorkDate] = useState(shift?.workDate ?? '')
  const [startTime, setStartTime] = useState(shift?.startTime?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(shift?.endTime?.slice(0, 5) ?? '')
  const [shiftType, setShiftType] = useState(shift?.shiftType ?? '')
  const [shiftStatus, setShiftStatus] = useState<WorkShiftRequest['shiftStatus']>(shift?.shiftStatus ?? 'DRAFT')
  const [capacity, setCapacity] = useState(shift?.capacity ?? 1)
  const [deadline, setDeadline] = useState(localDateTimeInput(shift?.registrationDeadline))
  const [invalidDeadline, setInvalidDeadline] = useState(false)
  const [note, setNote] = useState(shift?.note ?? '')
  const save = useMutation({
    mutationFn: () => {
      const request: WorkShiftRequest = {
        workDate,
        startTime,
        endTime,
        shiftType: shiftType.trim(),
        shiftStatus,
        capacity,
        registrationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
        note: note.trim() || undefined,
        version: shift?.version
      }
      return shift ? saveWorkShift(shift.id, request) : createWorkShift(centerId, request)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      if (shift) await queryClient.invalidateQueries({ queryKey: providerKeys.shift(shift.id) })
      onDone()
    }
  })
  const saveErrorCode = apiErrorCode(save.error)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (deadline && workDate && startTime && deadline >= `${workDate}T${startTime}`) {
      setInvalidDeadline(true)
      return
    }
    setInvalidDeadline(false)
    save.mutate()
  }
  return (
    <form className='space-y-5 rounded-xl bg-white p-5' onSubmit={submit}>
      <h2 className='text-lg font-semibold'>{t(shift ? `${key}.editShift` : `${key}.createShift`)}</h2>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='text-sm'>
          {t(`${key}.workDate`)}
          <input
            className={inputClass}
            onChange={(event) => setWorkDate(event.target.value)}
            required
            type='date'
            value={workDate}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.startTime`)}
          <input
            className={inputClass}
            onChange={(event) => setStartTime(event.target.value)}
            required
            type='time'
            value={startTime}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.endTime`)}
          <input
            className={inputClass}
            onChange={(event) => setEndTime(event.target.value)}
            required
            type='time'
            value={endTime}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.shiftType`)}
          <input
            className={inputClass}
            onChange={(event) => setShiftType(event.target.value)}
            required
            value={shiftType}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.status`)}
          <select
            className={inputClass}
            onChange={(event) => setShiftStatus(event.target.value as WorkShiftRequest['shiftStatus'])}
            value={shiftStatus}
          >
            {shiftStatuses.map((item) => (
              <option key={item} value={item}>
                {t(shiftStatusKeys[item])}
              </option>
            ))}
          </select>
        </label>
        <label className='text-sm'>
          {t(`${key}.capacity`)}
          <input
            className={inputClass}
            max={1000}
            min={1}
            onChange={(event) => setCapacity(Number(event.target.value))}
            required
            type='number'
            value={capacity}
          />
        </label>
        <div className='text-sm'>
          <label>
            {t(`${key}.deadline`)}
            <input
              aria-describedby={invalidDeadline ? 'shift-deadline-error' : undefined}
              aria-invalid={invalidDeadline}
              className={inputClass}
              onChange={(event) => {
                setDeadline(event.target.value)
                setInvalidDeadline(false)
              }}
              type='datetime-local'
              value={deadline}
            />
          </label>
          {invalidDeadline ? (
            <span className='mt-1 block text-error' id='shift-deadline-error' role='alert'>
              {t(`${key}.deadlineBeforeStart`)}
            </span>
          ) : null}
        </div>
        <label className='text-sm sm:col-span-2'>
          {t(`${key}.note`)}
          <textarea className={inputClass} onChange={(event) => setNote(event.target.value)} value={note} />
        </label>
      </div>
      {save.isError ? (
        <p role='alert'>
          {t(shiftSaveErrorKey(save.error))}
          {saveErrorCode !== undefined ? ` ${t(`${key}.apiErrorCode`, { code: saveErrorCode })}` : null}
        </p>
      ) : null}
      <div className='flex gap-3'>
        <button
          className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
          disabled={save.isPending}
          type='submit'
        >
          {t(`${key}.save`)}
        </button>
        <button className='rounded-lg border px-4 py-2' onClick={onDone} type='button'>
          {t(`${key}.cancel`)}
        </button>
      </div>
    </form>
  )
}

export function ManagerWorkShiftsPage() {
  const { t, i18n } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? ''
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const keyword = params.get('q') ?? ''
  const statusFilter = params.get('status') ?? 'all'
  const shifts = useQuery({
    queryKey: [...providerKeys.shifts(centerId), page],
    queryFn: () => fetchWorkShifts({ centerId, page, size: 20 }),
    enabled: Boolean(centerId),
    retry: false
  })
  useDocumentTitle(t(`${key}.shiftsTitle`))
  const rows = shifts.data?.items ?? []
  const visible = rows.filter(
    (shift) =>
      (!keyword ||
        [shift.shiftType, shift.workDate, shift.id].some((value) =>
          value.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase())
        )) &&
      (statusFilter === 'all' || shift.shiftStatus === statusFilter)
  )
  const countOnPage = (status: ProviderWorkShiftRecord['shiftStatus']) =>
    rows.filter((shift) => shift.shiftStatus === status).length
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const metrics = [
    {
      label: 'shiftMetricTotal',
      icon: 'calendar_month',
      value: shifts.data?.totalElements ?? 0,
      hint: 'shiftTotalScope'
    },
    { label: 'shiftMetricOpen', icon: 'event_available', value: countOnPage('OPEN'), hint: 'pageScope' },
    { label: 'shiftMetricDraft', icon: 'edit_calendar', value: countOnPage('DRAFT'), hint: 'pageScope' },
    {
      label: 'shiftMetricCapacity',
      icon: 'groups',
      value: rows.reduce((sum, shift) => sum + shift.capacity, 0),
      hint: 'pageScope'
    }
  ] as const
  function updateFilter(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      return next
    })
  }
  function setPage(value: number) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value > 0) next.set('page', String(value))
      else next.delete('page')
      return next
    })
  }
  if (!centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t(`${key}.noCenter`)}
      </main>
    )
  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.shiftsTitle`)}</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>{t(`${key}.workShiftsSubtitle`)}</p>
        </div>
        <button
          className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90'
          onClick={() => setCreating(true)}
          type='button'
        >
          <Icon name='add' />
          {t(`${key}.createShift`)}
        </button>
      </header>
      <section aria-label={t(`${key}.shiftOverview`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((metric) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={metric.label}>
            <div className='flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              <span>{t(`${key}.${metric.label}`)}</span>
              <Icon className='text-xl text-primary' name={metric.icon} />
            </div>
            <strong className='mt-4 block text-3xl tabular-nums'>
              {shifts.isSuccess ? number.format(metric.value) : '—'}
            </strong>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.${metric.hint}`)}</p>
          </div>
        ))}
      </section>
      <section aria-label={t(`${key}.shiftFilters`)} className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
        <div className='relative'>
          <Icon className='absolute left-3 top-3 text-xl text-outline' name='search' />
          <input
            aria-label={t(`${key}.searchShifts`)}
            className='w-full rounded-lg bg-surface-container-low py-3 pl-11 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder={t(`${key}.searchShifts`)}
            type='search'
            value={keyword}
          />
        </div>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {(['all', ...shiftStatuses] as const).map((status) => (
              <button
                aria-pressed={statusFilter === status}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-container'}`}
                key={status}
                onClick={() => updateFilter('status', status)}
                type='button'
              >
                {status === 'all' ? t(`${key}.all`) : t(shiftStatusKeys[status])}
              </button>
            ))}
          </div>
          <span className='text-xs text-on-surface-variant'>{t(`${key}.shiftFilterScope`)}</span>
        </div>
        <div className='flex items-center justify-between text-sm text-on-surface-variant'>
          <span>{t(`${key}.shiftResults`, { count: visible.length })}</span>
          <button
            className='font-semibold text-primary'
            onClick={() =>
              setParams((previous) => {
                const next = new URLSearchParams(previous)
                next.delete('q')
                next.delete('status')
                return next
              })
            }
            type='button'
          >
            {t(`${key}.clearFilters`)}
          </button>
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        {shifts.isPending && (
          <p className='p-8' role='status'>
            {t(`${key}.loading`)}
          </p>
        )}
        {shifts.isError && (
          <div className='p-8' role='alert'>
            <p>{t(`${key}.shiftsError`)}</p>
            <button
              className='mt-2 font-semibold text-primary underline'
              onClick={() => void shifts.refetch()}
              type='button'
            >
              {t(`${key}.retry`)}
            </button>
          </div>
        )}
        {shifts.isSuccess && (
          <>
            {visible.length ? (
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[820px] text-left text-sm'>
                  <thead className='bg-surface-container-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
                    <tr>
                      {(['workDate', 'shiftType', 'status', 'capacity', 'registrations'] as const).map((column) => (
                        <th className='px-5 py-4' key={column} scope='col'>
                          {t(`${key}.${column}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-outline-variant/20'>
                    {visible.map((shift) => (
                      <tr className='hover:bg-surface-container-low/50' key={shift.id}>
                        <td className='px-5 py-4'>
                          <Link className='font-bold hover:text-primary' to={`/center-manager/work-shifts/${shift.id}`}>
                            {formatProviderDate(shift.workDate, i18n.language)}
                          </Link>
                          <small className='mt-1 block text-outline'>
                            {formatProviderTime(shift.startTime, i18n.language)}–
                            {formatProviderTime(shift.endTime, i18n.language)}
                          </small>
                        </td>
                        <td className='px-5 py-4'>{shift.shiftType}</td>
                        <td className='px-5 py-4'>
                          <span className='rounded-full bg-secondary-container/50 px-2.5 py-1 text-xs font-semibold text-primary'>
                            {t(shiftStatusKeys[shift.shiftStatus])}
                          </span>
                        </td>
                        <td className='px-5 py-4'>
                          <strong>
                            {number.format(shift.approvedCount ?? 0)} / {number.format(shift.capacity)}
                          </strong>
                        </td>
                        <td className='px-5 py-4'>
                          <Link
                            aria-label={`${t(`${key}.registrations`)}: ${formatProviderDate(shift.workDate, i18n.language)}`}
                            className='inline-flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-primary hover:bg-secondary-container/50'
                            to={`/center-manager/work-shifts/${shift.id}`}
                          >
                            <Icon name='visibility' />
                            {t(`${key}.registrations`)}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : rows.length === 0 ? (
              <div className='flex flex-col items-center px-6 py-16 text-center'>
                <span className='flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container text-primary'>
                  <Icon className='text-4xl' name='event_note' />
                </span>
                <h2 className='mt-5 text-lg font-bold'>{t(`${key}.shiftsEmpty`)}</h2>
                <p className='mt-2 max-w-md text-sm leading-6 text-on-surface-variant'>{t(`${key}.shiftsEmptyHint`)}</p>
                <button
                  className='mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white'
                  onClick={() => setCreating(true)}
                  type='button'
                >
                  <Icon name='add' />
                  {t(`${key}.addFirstShift`)}
                </button>
              </div>
            ) : (
              <p className='p-10 text-center text-sm text-outline'>{t(`${key}.shiftFilterEmpty`)}</p>
            )}
            <div className='flex items-center justify-between border-t border-outline-variant/20 px-5 py-4 text-sm'>
              <button
                className='font-semibold text-primary disabled:opacity-40'
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                type='button'
              >
                {t(`${key}.previous`)}
              </button>
              <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, shifts.data.totalPages) })}</span>
              <button
                className='font-semibold text-primary disabled:opacity-40'
                disabled={page + 1 >= shifts.data.totalPages}
                onClick={() => setPage(page + 1)}
                type='button'
              >
                {t(`${key}.next`)}
              </button>
            </div>
          </>
        )}
      </section>
      {creating && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCreating(false)
          }}
        >
          <div
            aria-label={t(`${key}.createShift`)}
            aria-modal='true'
            className='max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl'
            role='dialog'
          >
            <ShiftEditor centerId={centerId} onDone={() => setCreating(false)} />
          </div>
        </div>
      )}
    </main>
  )
}

export function ManagerWorkShiftDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [reason, setReason] = useState('')
  const [registrationPage, setRegistrationPage] = useState(0)
  const shift = useQuery({
    queryKey: providerKeys.shift(id),
    queryFn: () => fetchWorkShift(id),
    enabled: Boolean(id),
    retry: false
  })
  const registrations = useQuery({
    queryKey: [...providerKeys.registrations(id), registrationPage],
    queryFn: () => fetchShiftRegistrations(id, registrationPage),
    enabled: Boolean(id) && shift.data?.centerId === centerId,
    retry: false
  })
  const archive = useMutation({
    mutationFn: () => removeWorkShift(id, shift.data!.version),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      navigate('/center-manager/work-shifts')
    }
  })
  const review = useMutation({
    mutationFn: ({
      registrationId,
      version,
      status
    }: {
      registrationId: string
      version: number
      status: 'APPROVED' | 'REJECTED'
    }) => reviewShiftRegistration(registrationId, { version, status, reason: reason.trim() || undefined }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.registrations(id) })
      await queryClient.invalidateQueries({ queryKey: providerKeys.shift(id) })
    }
  })
  useDocumentTitle(t(`${key}.shiftsTitle`))
  if (!centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t(`${key}.noCenter`)}
      </main>
    )
  if (shift.isPending)
    return (
      <main className='mx-auto max-w-6xl p-6' role='status'>
        {t(`${key}.loading`)}
      </main>
    )
  if (shift.isError)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        <p>{t(`${key}.shiftError`)}</p>
        <button className='text-primary underline' onClick={() => void shift.refetch()} type='button'>
          {t(`${key}.retry`)}
        </button>
      </main>
    )
  if (shift.data.centerId !== centerId)
    return (
      <main className='mx-auto max-w-6xl p-6' role='alert'>
        {t(`${key}.noAccess`)}
      </main>
    )
  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {formatProviderDate(shift.data.workDate, i18n.language)}
          </h1>
          <p className='mt-2 text-sm text-on-surface-variant'>
            {formatProviderTime(shift.data.startTime, i18n.language)}–
            {formatProviderTime(shift.data.endTime, i18n.language)} · {shift.data.shiftType}
          </p>
          <span className='mt-3 inline-flex rounded-full bg-secondary-container/50 px-3 py-1 text-xs font-semibold text-primary'>
            {t(shiftStatusKeys[shift.data.shiftStatus])}
          </span>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white'
            onClick={() => setEditing(true)}
            type='button'
          >
            <Icon name='edit' />
            {t(`${key}.editShift`)}
          </button>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-error-container px-4 py-2.5 text-sm font-semibold text-on-error-container disabled:opacity-50'
            disabled={archive.isPending}
            onClick={() => {
              if (window.confirm(t(`${key}.confirmArchiveShift`))) archive.mutate()
            }}
            type='button'
          >
            <Icon name='event_busy' />
            {t(`${key}.archiveShift`)}
          </button>
        </div>
      </header>
      <section aria-label={t(`${key}.shiftDetail`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            [t(`${key}.shiftType`), shift.data.shiftType, 'schedule'],
            [t(`${key}.capacity`), `${shift.data.approvedCount ?? 0} / ${shift.data.capacity}`, 'groups'],
            [t(`${key}.shiftDetailStatus`), t(shiftStatusKeys[shift.data.shiftStatus]), 'event_available'],
            [
              t(`${key}.deadline`),
              shift.data.registrationDeadline
                ? new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }).format(new Date(shift.data.registrationDeadline))
                : t(`${key}.noDeadline`),
              'event_note'
            ]
          ] as const
        ).map(([label, value, icon]) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={label}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              <span>{label}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <strong className='mt-4 block text-xl'>{value}</strong>
          </div>
        ))}
      </section>
      {shift.data.note && (
        <section className='rounded-xl bg-white p-5 shadow-sm'>
          <h2 className='text-sm font-bold'>{t(`${key}.note`)}</h2>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{shift.data.note}</p>
        </section>
      )}
      {archive.isError ? (
        <p className='rounded-lg bg-error-container p-4 text-on-error-container' role='alert'>
          {t(`${key}.actionError`)}
        </p>
      ) : null}
      {editing ? (
        <ShiftEditor centerId={centerId} key={shift.data.version} onDone={() => setEditing(false)} shift={shift.data} />
      ) : null}
      <section className='space-y-4 rounded-xl bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-3 border-b border-outline-variant/20 pb-4'>
          <Icon className='text-xl text-primary' name='assignment_ind' />
          <h2 className='text-lg font-bold'>{t(`${key}.registrations`)}</h2>
        </div>
        <label className='block text-sm'>
          {t(`${key}.reason`)}
          <input className={inputClass} onChange={(event) => setReason(event.target.value)} value={reason} />
        </label>
        {registrations.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
        {registrations.isError ? (
          <div role='alert'>
            <p>{t(`${key}.registrationsError`)}</p>
            <button className='text-primary underline' onClick={() => void registrations.refetch()} type='button'>
              {t(`${key}.retry`)}
            </button>
          </div>
        ) : null}
        {registrations.isSuccess && registrations.data.items.length === 0 ? (
          <p>{t(`${key}.registrationsEmpty`)}</p>
        ) : null}
        {registrations.isSuccess ? (
          <ul className='divide-y divide-outline-variant/20'>
            {registrations.data.items.map((registration) => (
              <li className='flex flex-wrap items-center justify-between gap-3 py-4' key={registration.id}>
                <div className='flex items-center gap-3'>
                  <span
                    aria-hidden='true'
                    className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-primary'
                  >
                    <Icon name='person' />
                  </span>
                  <div>
                    <strong>{registration.caregiverName || registration.caregiverId}</strong>
                    <p className='text-sm text-outline'>
                      {t(`${key}.${registrationStatusKeys[registration.registrationStatus]}`)}
                    </p>
                  </div>
                </div>
                {registration.registrationStatus === 'PENDING' ? (
                  <div className='flex gap-3'>
                    <button
                      className='rounded-lg bg-secondary-container px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50'
                      disabled={review.isPending}
                      onClick={() =>
                        review.mutate({
                          registrationId: registration.id,
                          version: registration.version,
                          status: 'APPROVED'
                        })
                      }
                      type='button'
                    >
                      {t(`${key}.approve`)}
                    </button>
                    <button
                      className='rounded-lg bg-error-container px-3 py-2 text-sm font-semibold text-on-error-container disabled:opacity-50'
                      disabled={review.isPending}
                      onClick={() =>
                        review.mutate({
                          registrationId: registration.id,
                          version: registration.version,
                          status: 'REJECTED'
                        })
                      }
                      type='button'
                    >
                      {t(`${key}.reject`)}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {registrations.isSuccess && registrations.data.totalPages > 1 ? (
          <div className='flex justify-between border-t pt-3 text-sm'>
            <button
              className='text-primary disabled:opacity-40'
              disabled={registrationPage === 0}
              onClick={() => setRegistrationPage(registrationPage - 1)}
              type='button'
            >
              {t(`${key}.previous`)}
            </button>
            <span>{t(`${key}.page`, { page: registrationPage + 1, pages: registrations.data.totalPages })}</span>
            <button
              className='text-primary disabled:opacity-40'
              disabled={registrationPage + 1 >= registrations.data.totalPages}
              onClick={() => setRegistrationPage(registrationPage + 1)}
              type='button'
            >
              {t(`${key}.next`)}
            </button>
          </div>
        ) : null}
        {review.isError ? <p role='alert'>{t(`${key}.actionError`)}</p> : null}
      </section>
    </main>
  )
}
