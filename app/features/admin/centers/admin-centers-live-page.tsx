import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import {
  changeCenterStatus,
  createCenter,
  fetchCenter,
  fetchCenters,
  providerKeys,
  removeCenter,
  saveCenter
} from '~/entities/provider/provider-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { ProviderMediaPanel } from '~/entities/provider/provider-media-panel'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ConfirmDialog } from '~/shared/ui/modal'

import { centerErrorKey } from './center-errors'
import { CenterManagerSelect } from './components/center-manager-select'
import { useCenterManagers } from './hooks/use-center-managers'

const key = 'admin.provider' as const
const inputClass = 'mt-1 w-full rounded-lg border border-outline-variant bg-white px-3 py-2'
const statuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED'] as const
type CenterStatusOption = (typeof statuses)[number]
// ProviderService's center transitions (PRV-04); ARCHIVED goes through the separate archive action.
const transitions: Record<string, readonly CenterStatusOption[]> = {
  PENDING: ['ACTIVE', 'REJECTED'],
  ACTIVE: ['SUSPENDED', 'INACTIVE'],
  SUSPENDED: ['ACTIVE'],
  INACTIVE: ['ACTIVE']
}
// ProviderService rejects these without a reason (CENTER_STATUS_REASON_REQUIRED).
const REASON_REQUIRED = new Set<CenterStatusOption>(['REJECTED', 'SUSPENDED', 'INACTIVE'])
const HOURS = /^(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})$/
const statusKeys = {
  PENDING: 'admin.provider.pending',
  ACTIVE: 'admin.provider.active',
  INACTIVE: 'admin.provider.inactive',
  SUSPENDED: 'admin.provider.suspended',
  REJECTED: 'admin.provider.rejected',
  ARCHIVED: 'admin.provider.archived'
} as const

export function CenterForm({ center, onDone }: { center?: ProviderCenterRecord; onDone: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(center?.centerName ?? '')
  const [email, setEmail] = useState(center?.email ?? '')
  const [phone, setPhone] = useState(center?.phoneNumber ?? '')
  const [address, setAddress] = useState(center?.address ?? '')
  // Hours are stored as one text field; the form edits them as an opening and closing time.
  const storedHours = HOURS.exec(center?.operatingHours ?? '')
  const [opensAt, setOpensAt] = useState(storedHours?.[1] ?? '')
  const [closesAt, setClosesAt] = useState(storedHours?.[2] ?? '')
  const [hoursInvalid, setHoursInvalid] = useState(false)
  const legacyHours = center?.operatingHours && !storedHours ? center.operatingHours : ''
  const [managerId, setManagerId] = useState(center?.managerUserId ?? '')
  const mutation = useMutation({
    mutationFn: () => {
      const fields = {
        centerName: name.trim(),
        email: email.trim(),
        address: address.trim(),
        phoneNumber: phone.trim() || undefined,
        operatingHours: opensAt && closesAt ? `${opensAt} - ${closesAt}` : legacyHours || undefined
      }
      // H-12: a manager account belongs to one center in Identity, so it is assigned after the center exists.
      return center
        ? saveCenter(center.id, { ...fields, managerUserId: managerId.trim() || undefined, version: center.version })
        : createCenter(fields)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      if (center) await queryClient.invalidateQueries({ queryKey: providerKeys.center(center.id) })
      onDone()
    }
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    // Both times or neither; a center closes after it opens.
    if (Boolean(opensAt) !== Boolean(closesAt) || (opensAt && closesAt && closesAt <= opensAt)) {
      setHoursInvalid(true)
      return
    }
    setHoursInvalid(false)
    mutation.mutate()
  }
  return (
    <form className='space-y-4 rounded-xl border border-outline-variant bg-white p-5' onSubmit={submit}>
      <h2 className='text-lg font-semibold'>{t(center ? `${key}.editCenter` : `${key}.createCenter`)}</h2>
      <div className='grid gap-4 sm:grid-cols-2'>
        {(
          [
            [t(`${key}.centerName`), name, setName, 'text', true],
            [t(`${key}.email`), email, setEmail, 'email', true],
            [t(`${key}.phone`), phone, setPhone, 'tel', false],
            [t(`${key}.address`), address, setAddress, 'text', true]
          ] as const
        ).map(([label, value, setValue, type, required]) => (
          <label className='text-sm font-medium' key={label}>
            {label}
            <input
              className={inputClass}
              onChange={(event) => setValue(event.target.value)}
              required={required}
              type={type}
              value={value}
            />
          </label>
        ))}
        <fieldset
          aria-describedby={hoursInvalid ? 'center-hours-error' : legacyHours ? 'center-hours-current' : undefined}
          className='text-sm font-medium sm:col-span-2'
        >
          <legend>{t(`${key}.hours`)}</legend>
          <div className='mt-1 grid grid-cols-2 gap-3'>
            <label className='font-normal'>
              {t(`${key}.opensAt`)}
              <input
                aria-invalid={hoursInvalid}
                className={inputClass}
                onChange={(event) => {
                  setOpensAt(event.target.value)
                  setHoursInvalid(false)
                }}
                type='time'
                value={opensAt}
              />
            </label>
            <label className='font-normal'>
              {t(`${key}.closesAt`)}
              <input
                aria-invalid={hoursInvalid}
                className={inputClass}
                onChange={(event) => {
                  setClosesAt(event.target.value)
                  setHoursInvalid(false)
                }}
                type='time'
                value={closesAt}
              />
            </label>
          </div>
          {legacyHours ? (
            <p className='mt-1 font-normal text-on-surface-variant' id='center-hours-current'>
              {t(`${key}.currentHours`, { hours: legacyHours })}
            </p>
          ) : null}
          {hoursInvalid ? (
            <p className='mt-1 font-normal text-error' id='center-hours-error' role='alert'>
              {t(`${key}.hoursInvalid`)}
            </p>
          ) : null}
        </fieldset>
        {center ? (
          <CenterManagerSelect centerId={center.id} className={inputClass} onChange={setManagerId} value={managerId} />
        ) : null}
      </div>
      {mutation.isError ? <p role='alert'>{t(centerErrorKey(mutation.error, `${key}.saveError`))}</p> : null}
      <div className='flex gap-3'>
        <button
          className='rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50'
          disabled={mutation.isPending}
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

export function CenterDetails({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [chosenStatus, setChosenStatus] = useState<CenterStatusOption | ''>('')
  const [reason, setReason] = useState('')
  const [reasonMissing, setReasonMissing] = useState(false)
  const center = useQuery({ queryKey: providerKeys.center(id), queryFn: () => fetchCenter(id), retry: false })
  const managers = useCenterManagers()
  const allowed = transitions[center.data?.centerStatus ?? ''] ?? []
  const status = chosenStatus && allowed.includes(chosenStatus) ? chosenStatus : allowed[0]
  const changeStatus = useMutation({
    mutationFn: (target: CenterStatusOption) =>
      changeCenterStatus(id, { status: target, reason: reason.trim() || undefined, version: center.data!.version }),
    onSuccess: async () => {
      setChosenStatus('')
      setReason('')
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      await queryClient.invalidateQueries({ queryKey: providerKeys.center(id) })
    }
  })
  const archive = useMutation({
    mutationFn: () => removeCenter(id, center.data!.version),
    onSuccess: async () => {
      setConfirmArchive(false)
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      onClose()
    },
    onError: () => setConfirmArchive(false)
  })
  if (center.isPending) return <p role='status'>{t(`${key}.loading`)}</p>
  if (center.isError)
    return (
      <div role='alert'>
        <p>{t(`${key}.centerLoadError`)}</p>
        <button className='text-primary underline' onClick={() => void center.refetch()} type='button'>
          {t(`${key}.retry`)}
        </button>
      </div>
    )
  if (editing) return <CenterForm center={center.data} onDone={() => setEditing(false)} />
  function managerName(managerId: string | undefined) {
    if (!managerId) return t(`${key}.manager.none`)
    const manager = managers.data?.find((item) => item.id === managerId)
    if (manager)
      return manager.email
        ? t(`${key}.manager.option`, { name: manager.fullName, email: manager.email })
        : manager.fullName
    return managers.isSuccess ? t(`${key}.manager.inactive`) : t(`${key}.manager.loading`)
  }
  return (
    <section className='space-y-4 rounded-xl border border-outline-variant bg-white p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold'>{center.data.centerName}</h2>
          <div className='mt-1'>
            <ProviderStatusBadge status={center.data.centerStatus}>
              {t(statusKeys[center.data.centerStatus])}
            </ProviderStatusBadge>
          </div>
          {center.data.statusReason ? (
            <p className='mt-1 text-sm text-on-surface-variant'>
              {t(`${key}.statusReasonValue`, { reason: center.data.statusReason })}
            </p>
          ) : null}
        </div>
        <button className='text-primary underline' onClick={onClose} type='button'>
          {t(`${key}.close`)}
        </button>
      </div>
      <dl className='grid gap-3 text-sm sm:grid-cols-2'>
        {(
          [
            [t(`${key}.email`), center.data.email],
            [t(`${key}.phone`), center.data.phoneNumber],
            [t(`${key}.address`), center.data.address],
            [t(`${key}.hours`), center.data.operatingHours],
            [t(`${key}.manager.label`), managerName(center.data.managerUserId)]
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className='text-outline'>{label}</dt>
            <dd className='font-medium'>{value || t(`${key}.unknown`)}</dd>
          </div>
        ))}
      </dl>
      <div className='flex flex-wrap gap-3'>
        <button className='rounded-lg border px-3 py-2' onClick={() => setEditing(true)} type='button'>
          {t(`${key}.editCenter`)}
        </button>
        <Link className='rounded-lg border px-3 py-2' to={`/admin/centers/${id}/caregivers`}>
          {t(`${key}.viewCaregivers`)}
        </Link>
      </div>
      {center.data.managerUserId ? null : (
        <p className='rounded-lg bg-surface-container-low p-3 text-sm'>
          {t(`${key}.manager.requiredHint`)}{' '}
          <button className='text-primary underline' onClick={() => setEditing(true)} type='button'>
            {t(`${key}.manager.assign`)}
          </button>
        </p>
      )}
      {status ? (
        <form
          className='flex flex-wrap items-start gap-3 border-t pt-4'
          onSubmit={(event) => {
            event.preventDefault()
            if (REASON_REQUIRED.has(status) && !reason.trim()) {
              setReasonMissing(true)
              return
            }
            setReasonMissing(false)
            changeStatus.mutate(status)
          }}
        >
          <label className='text-sm'>
            {t(`${key}.newStatus`)}
            <select
              className={inputClass}
              onChange={(event) => {
                setChosenStatus(event.target.value as CenterStatusOption)
                setReasonMissing(false)
              }}
              value={status}
            >
              {allowed.map((item) => (
                <option key={item} value={item}>
                  {t(statusKeys[item])}
                </option>
              ))}
            </select>
          </label>
          <div className='min-w-56 flex-1 text-sm'>
            <label htmlFor='center-status-reason'>
              {REASON_REQUIRED.has(status) ? t(`${key}.reasonRequiredLabel`) : t(`${key}.reason`)}
            </label>
            <input
              aria-describedby={reasonMissing ? 'center-status-reason-error' : undefined}
              aria-invalid={reasonMissing}
              className={inputClass}
              id='center-status-reason'
              onChange={(event) => {
                setReason(event.target.value)
                setReasonMissing(false)
              }}
              value={reason}
            />
            {reasonMissing ? (
              <p className='mt-1 text-error' id='center-status-reason-error' role='alert'>
                {t(`${key}.reasonMissing`)}
              </p>
            ) : null}
          </div>
          <button
            className='mt-6 rounded-lg bg-primary px-3 py-2 text-on-primary disabled:opacity-50'
            disabled={changeStatus.isPending}
            type='submit'
          >
            {t(`${key}.statusAction`)}
          </button>
          {status === 'SUSPENDED' ? (
            <p className='w-full rounded-lg bg-warning-container p-3 text-sm text-on-warning-container'>
              {t(`${key}.suspendHint`)}
            </p>
          ) : null}
        </form>
      ) : (
        <p className='border-t pt-4 text-sm text-on-surface-variant'>{t(`${key}.noTransitions`)}</p>
      )}
      <button
        className='rounded-lg border border-error px-3 py-2 text-error disabled:opacity-50'
        disabled={archive.isPending}
        onClick={() => setConfirmArchive(true)}
        type='button'
      >
        {t(`${key}.archive`)}
      </button>
      {changeStatus.isError || archive.isError ? (
        <p role='alert'>{t(centerErrorKey(changeStatus.error ?? archive.error, `${key}.actionError`))}</p>
      ) : null}
      <ProviderMediaPanel ownerId={id} ownerType='CARE_CENTER' />
      <ConfirmDialog
        cancelLabel={t(`${key}.cancel`)}
        confirmLabel={t(`${key}.archive`)}
        description={t(`${key}.confirmArchive`)}
        loading={archive.isPending}
        onClose={() => setConfirmArchive(false)}
        onConfirm={() => archive.mutate()}
        open={confirmArchive}
        title={t(`${key}.archive`)}
        tone='danger'
      />
    </section>
  )
}

export function AdminCentersPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const statusValue = params.get('status') ?? ''
  const status = statuses.find((item) => item === statusValue)
  const keyword = params.get('q') ?? ''
  const selected = params.get('center')
  const centers = useQuery({
    queryKey: [...providerKeys.centers, { page, status, keyword }],
    queryFn: () => fetchCenters({ page, size: 20, status, keyword: keyword.trim() || undefined }),
    retry: false
  })
  useDocumentTitle(t(`${key}.centersTitle`))
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page' && name !== 'center') next.delete('page')
      return next
    })
  }
  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold'>{t(`${key}.centersTitle`)}</h1>
        <button className='rounded-lg bg-primary px-4 py-2 text-white' onClick={() => setCreating(true)} type='button'>
          {t(`${key}.createCenter`)}
        </button>
      </header>
      {creating ? <CenterForm onDone={() => setCreating(false)} /> : null}
      <div className='grid gap-3 sm:grid-cols-2'>
        <label className='text-sm'>
          {t(`${key}.centersSearch`)}
          <input
            className={inputClass}
            onChange={(event) => update('q', event.target.value)}
            type='search'
            value={keyword}
          />
        </label>
        <label className='text-sm'>
          {t(`${key}.centersStatus`)}
          <select
            className={inputClass}
            onChange={(event) => update('status', event.target.value)}
            value={status ?? ''}
          >
            <option value=''>{t(`${key}.centersAll`)}</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {t(statusKeys[item])}
              </option>
            ))}
          </select>
        </label>
      </div>
      {centers.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
      {centers.isError ? (
        <div role='alert'>
          <p>{t(`${key}.centersLoadError`)}</p>
          <button className='text-primary underline' onClick={() => void centers.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {centers.isSuccess ? (
        <section className='overflow-hidden rounded-xl border border-outline-variant bg-white'>
          {centers.data.items.length === 0 ? (
            <p className='p-6'>{t(`${key}.centersEmpty`)}</p>
          ) : (
            <ul className='divide-y divide-outline-variant'>
              {centers.data.items.map((center) => (
                <li className='flex flex-wrap items-center justify-between gap-3 p-4' key={center.id}>
                  <div>
                    <strong>{center.centerName}</strong>
                    <p className='text-sm text-outline'>{center.address || center.email}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <ProviderStatusBadge status={center.centerStatus}>
                      {t(statusKeys[center.centerStatus])}
                    </ProviderStatusBadge>
                    <button
                      className='text-primary underline'
                      onClick={() => update('center', center.id)}
                      type='button'
                    >
                      {t(`${key}.centerDetails`)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className='flex items-center justify-between border-t p-4 text-sm'>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page === 0}
              onClick={() => update('page', String(page - 1))}
              type='button'
            >
              {t(`${key}.previous`)}
            </button>
            <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, centers.data.totalPages) })}</span>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page + 1 >= centers.data.totalPages}
              onClick={() => update('page', String(page + 1))}
              type='button'
            >
              {t(`${key}.next`)}
            </button>
          </div>
        </section>
      ) : null}
      {selected ? <CenterDetails id={selected} key={selected} onClose={() => update('center', '')} /> : null}
    </div>
  )
}
