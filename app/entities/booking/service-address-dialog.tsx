import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  careRecipientKeys,
  createRecipientAddress,
  fetchRecipientAddresses,
  formatRecipientAddress
} from '~/entities/care-recipient/care-recipient-api'
import type {
  BookingDetailRecord,
  BookingOccurrenceRecord,
  ServiceAddressRequest
} from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { bookingKeys, updateServiceAddressRequest } from './booking-api'
import { bookingErrorKey } from './booking-format'

const NOTE_MAX = 500
/** A customer changes only visits starting at least this far ahead (BookingService `address-change-lead`). */
export const CUSTOMER_ADDRESS_LEAD_MS = 24 * 60 * 60_000

/** Statuses where a booking still has a schedule (BookingService also needs an upcoming visit). */
const ADDRESS_EDITABLE = new Set<BookingDetailRecord['status']>([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])
const NOT_STARTED = new Set(['PENDING_ASSIGNMENT', 'RESERVED', 'SCHEDULED', 'ACKNOWLEDGED'])

/** Visits that have not started yet, in time order. */
function upcomingVisits(booking: BookingDetailRecord, now: number) {
  return (booking.occurrences ?? [])
    .filter((visit) => NOT_STARTED.has(visit.status) && new Date(visit.startAt).getTime() > now)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
}

/**
 * Whether some upcoming visit can still move to another address: a customer needs one at least 24 hours away
 * (2026-11-05), the center any visit that has not started.
 */
export function canChangeServiceAddress(booking: BookingDetailRecord, now: number, customer = true) {
  if (!ADDRESS_EDITABLE.has(booking.status)) return false
  const lead = customer ? CUSTOMER_ADDRESS_LEAD_MS : 0
  return upcomingVisits(booking, now).some((visit) => new Date(visit.startAt).getTime() > now + lead)
}

type Source = 'current' | 'new' | string

/**
 * Moves chosen visits to another care address (the person cared for stays somewhere else for a while). The customer
 * ticks the visits — those under 24 hours keep their address — and picks a saved address of the person or types a new
 * one, which can be saved to the address book. The center and the assigned caregivers are notified by BookingService.
 */
export function ServiceAddressDialog({
  booking,
  open,
  onClose,
  customer = true
}: {
  booking: BookingDetailRecord
  open: boolean
  onClose: () => void
  customer?: boolean
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const [openedAt] = useState(() => Date.now())
  const visits = upcomingVisits(booking, openedAt)
  const lead = customer ? CUSTOMER_ADDRESS_LEAD_MS : 0
  const editable = (visit: BookingOccurrenceRecord) => new Date(visit.startAt).getTime() > openedAt + lead
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(visits.filter(editable).map((visit) => visit.id)))
  const snapshot = booking.recipientSnapshot
  const [form, setForm] = useState<ServiceAddressRequest>(() => ({
    addressLine: snapshot?.addressLine ?? '',
    ward: snapshot?.ward ?? '',
    district: snapshot?.district ?? '',
    province: snapshot?.province ?? '',
    note: ''
  }))
  const [source, setSource] = useState<Source>('current')
  const [saveToBook, setSaveToBook] = useState(false)
  const [bookLabel, setBookLabel] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const book = useQuery({
    queryKey: careRecipientKeys.addresses(booking.recipientId ?? ''),
    queryFn: () => fetchRecipientAddresses(booking.recipientId ?? ''),
    enabled: customer && open && Boolean(booking.recipientId),
    retry: false
  })
  const missingLine = !form.addressLine.trim()
  const missingProvince = !form.province.trim()
  const missingVisits = chosen.size === 0
  const missingLabel = saveToBook && source === 'new' && !bookLabel.trim()
  const editableCount = visits.filter(editable).length

  const save = useMutation({
    mutationFn: async () => {
      const address = {
        addressLine: form.addressLine.trim(),
        ward: form.ward?.trim() || undefined,
        district: form.district?.trim() || undefined,
        province: form.province.trim()
      }
      if (customer && saveToBook && source === 'new' && booking.recipientId) {
        await createRecipientAddress(booking.recipientId, { ...address, label: bookLabel.trim() })
        void queryClient.invalidateQueries({ queryKey: careRecipientKeys.addresses(booking.recipientId) })
      }
      return updateServiceAddressRequest(booking.id, {
        ...address,
        note: form.note?.trim() || undefined,
        occurrenceIds: [...chosen]
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), updated)
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })

  function submit() {
    setSubmitted(true)
    if (missingLine || missingProvince || missingVisits || missingLabel || save.isPending) return
    save.mutate()
  }

  function pick(next: Source) {
    setSource(next)
    if (next === 'new') {
      setForm((current) => ({ ...current, addressLine: '', ward: '', district: '', province: '' }))
      return
    }
    const saved = book.data?.find((item) => item.id === next)
    const from = saved ?? snapshot
    setForm((current) => ({
      ...current,
      addressLine: from?.addressLine ?? '',
      ward: from?.ward ?? '',
      district: from?.district ?? '',
      province: from?.province ?? ''
    }))
  }

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const field = (key: keyof ServiceAddressRequest) => ({
    value: (form[key] as string | undefined) ?? '',
    onChange: (event: { target: { value: string } }) => {
      setForm((current) => ({ ...current, [key]: event.target.value }))
      if (key !== 'note' && source !== 'new') setSource('new')
    }
  })
  const chip = (active: boolean) =>
    `inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${active ? 'border-primary bg-brand-50 text-primary' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'}`

  return (
    <Modal
      description={t('booking.address.description')}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button onClick={onClose} variant='ghost'>
            {t('booking.address.cancel')}
          </Button>
          <Button loading={save.isPending} onClick={submit}>
            {t('booking.address.saveCount', { count: chosen.size })}
          </Button>
        </>
      }
      maxWidthClass='max-w-3xl'
      onClose={onClose}
      open={open}
      title={t('booking.address.title')}
    >
      <form
        className='grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <fieldset className='min-w-0'>
          <legend className='flex w-full items-center justify-between gap-2 text-sm font-semibold text-on-surface'>
            {t('booking.address.visitsTitle')}
            <button
              className='rounded-md px-1.5 py-0.5 text-xs font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() =>
                setChosen(
                  chosen.size === editableCount ? new Set() : new Set(visits.filter(editable).map((visit) => visit.id))
                )
              }
              type='button'
            >
              {chosen.size === editableCount ? t('booking.address.selectNone') : t('booking.address.selectAll')}
            </button>
          </legend>
          <p className='mt-1 text-xs text-on-surface-variant'>
            {customer ? t('booking.address.visitsHint') : t('booking.address.visitsHintCenter')}
          </p>
          <ul className='mt-3 flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1'>
            {visits.map((visit) => {
              const allowed = editable(visit)
              return (
                <li key={visit.id}>
                  <label
                    className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${allowed ? 'cursor-pointer border-outline-variant hover:bg-surface-container-low' : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant'}`}
                  >
                    <input
                      checked={chosen.has(visit.id)}
                      className='mt-0.5 h-4 w-4 accent-[var(--color-primary)]'
                      disabled={!allowed}
                      onChange={() => toggle(visit.id)}
                      type='checkbox'
                    />
                    <span className='min-w-0'>
                      <span className='block font-medium tabular-nums'>
                        {format.visitRange(visit.startAt, visit.endAt)}
                      </span>
                      {visit.serviceAddress ? (
                        <span className='block truncate text-xs text-on-surface-variant'>
                          {t('booking.address.visitAt', { address: visit.serviceAddress })}
                        </span>
                      ) : null}
                      {!allowed ? (
                        <span className='block text-xs font-semibold text-warning'>{t('booking.address.tooLate')}</span>
                      ) : null}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <p className='mt-2 text-xs font-semibold text-on-surface-variant tabular-nums'>
            {t('booking.address.selectedCount', { count: chosen.size, total: visits.length })}
          </p>
          {submitted && missingVisits ? (
            <p className='mt-1 text-xs font-semibold text-error' role='alert'>
              {t('booking.address.noneSelected')}
            </p>
          ) : null}
        </fieldset>

        <div className='flex min-w-0 flex-col gap-4'>
          <div>
            <p className='text-sm font-semibold text-on-surface'>{t('booking.address.sourceTitle')}</p>
            <div aria-label={t('booking.address.sourceTitle')} className='mt-2 flex flex-wrap gap-2' role='group'>
              <button
                aria-pressed={source === 'current'}
                className={chip(source === 'current')}
                onClick={() => pick('current')}
                type='button'
              >
                <Icon className='text-base' name='home' />
                {t('booking.address.sourceCurrent')}
              </button>
              {(book.data ?? []).map((saved) => (
                <button
                  aria-pressed={source === saved.id}
                  className={chip(source === saved.id)}
                  key={saved.id}
                  onClick={() => pick(saved.id)}
                  title={formatRecipientAddress(saved)}
                  type='button'
                >
                  <Icon className='text-base' name='bookmark' />
                  <span className='truncate'>{saved.label}</span>
                </button>
              ))}
              <button
                aria-pressed={source === 'new'}
                className={chip(source === 'new')}
                onClick={() => pick('new')}
                type='button'
              >
                <Icon className='text-base' name='add_location_alt' />
                {t('booking.address.sourceNew')}
              </button>
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              className='sm:col-span-2'
              error={submitted && missingLine ? t('booking.errors.e5113') : undefined}
              label={t('booking.address.addressLine')}
            >
              {(props) => <Input {...props} autoComplete='street-address' maxLength={255} {...field('addressLine')} />}
            </FormField>
            <FormField label={t('booking.address.ward')}>
              {(props) => <Input {...props} maxLength={100} {...field('ward')} />}
            </FormField>
            <FormField label={t('booking.address.district')}>
              {(props) => <Input {...props} maxLength={100} {...field('district')} />}
            </FormField>
            <FormField
              className='sm:col-span-2'
              error={submitted && missingProvince ? t('booking.errors.e5114') : undefined}
              label={t('booking.address.province')}
            >
              {(props) => <Input {...props} maxLength={100} {...field('province')} />}
            </FormField>
          </div>
          {customer && source === 'new' ? (
            <div className='rounded-xl border border-outline-variant p-3'>
              <label className='flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface'>
                <input
                  checked={saveToBook}
                  className='h-4 w-4 accent-[var(--color-primary)]'
                  onChange={(event) => setSaveToBook(event.target.checked)}
                  type='checkbox'
                />
                {t('booking.address.saveToBook', { name: snapshot?.fullName ?? '' })}
              </label>
              {saveToBook ? (
                <FormField
                  className='mt-3'
                  error={submitted && missingLabel ? t('booking.address.labelRequired') : undefined}
                  hint={t('booking.address.labelHint')}
                  label={t('booking.address.label')}
                >
                  {(props) => (
                    <Input
                      {...props}
                      maxLength={100}
                      onChange={(event) => setBookLabel(event.target.value)}
                      value={bookLabel}
                    />
                  )}
                </FormField>
              ) : null}
            </div>
          ) : null}
          <FormField hint={t('booking.address.noteHint')} label={t('booking.address.note')}>
            {(props) => <Textarea {...props} maxLength={NOTE_MAX} rows={2} {...field('note')} />}
          </FormField>
          <p className='text-xs text-on-surface-variant'>{t('booking.address.notice')}</p>
          {save.isError ? <FormAlert tone='error'>{t(bookingErrorKey(save.error))}</FormAlert> : null}
        </div>
      </form>
    </Modal>
  )
}
