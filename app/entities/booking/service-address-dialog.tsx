import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressFields } from '~/entities/address/address-fields'
import { addressIssues, hasAddressIssues, normalizeAddress, type AddressParts } from '~/entities/address/admin-units'
import { useAdminUnits } from '~/entities/address/use-admin-units'
import {
  careRecipientKeys,
  createRecipientAddress,
  fetchRecipientAddresses,
  formatRecipientAddress
} from '~/entities/care-recipient/care-recipient-api'
import type { BookingDetailRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { bookingKeys, updateServiceAddressRequest } from './booking-api'
import { bookingErrorKey } from './booking-format'
import { ServiceAddressSource, type AddressSource } from './service-address-source'
import { ServiceAddressVisits, StepNumber } from './service-address-visits'

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

/**
 * Moves chosen visits to another care address (the person cared for stays somewhere else for a while). Step 1 ticks
 * the visits — a customer's visits under 24 hours keep their address — and step 2 picks the booking's current address,
 * a saved address from the person's address book, or another address typed in today's province → ward lists, which can
 * be saved to the book. The center and the assigned caregivers are notified by BookingService.
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
  const queryClient = useQueryClient()
  const units = useAdminUnits()
  const [openedAt] = useState(() => Date.now())
  const visits = upcomingVisits(booking, openedAt)
  const lead = customer ? CUSTOMER_ADDRESS_LEAD_MS : 0
  const editable = (visit: BookingOccurrenceRecord) => new Date(visit.startAt).getTime() > openedAt + lead
  const editableIds = visits.filter(editable).map((visit) => visit.id)
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(editableIds))
  const snapshot = booking.recipientSnapshot
  const [source, setSource] = useState<AddressSource | null>(null)
  const [typed, setTyped] = useState<AddressParts>(() => ({
    addressLine: '',
    ward: '',
    province: snapshot?.province ?? ''
  }))
  const [note, setNote] = useState('')
  const [saveToBook, setSaveToBook] = useState(false)
  const [bookLabel, setBookLabel] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const book = useQuery({
    queryKey: careRecipientKeys.addresses(booking.recipientId ?? ''),
    queryFn: () => fetchRecipientAddresses(booking.recipientId ?? ''),
    enabled: customer && open && Boolean(booking.recipientId),
    retry: false
  })

  const currentAddress =
    snapshot?.addressLine && snapshot.province
      ? formatRecipientAddress({ ...snapshot, addressLine: snapshot.addressLine, province: snapshot.province })
      : ''
  const typedIssues = source === 'new' ? addressIssues(typed, units.data) : {}
  const missingVisits = chosen.size === 0
  const missingSource = source === null
  const missingLabel = customer && source === 'new' && saveToBook && !bookLabel.trim()

  /** The address sent for the chosen source; a saved or current address keeps its stored parts as they are. */
  function chosenAddress() {
    if (source === 'new') {
      const parts = normalizeAddress(typed, units.data)
      return {
        addressLine: parts.addressLine,
        ward: parts.ward || undefined,
        district: undefined,
        province: parts.province
      }
    }
    const from = source === 'current' ? snapshot : book.data?.find((item) => item.id === source)
    return {
      addressLine: from?.addressLine?.trim() ?? '',
      ward: from?.ward?.trim() || undefined,
      district: from?.district?.trim() || undefined,
      province: from?.province?.trim() ?? ''
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const address = chosenAddress()
      if (customer && saveToBook && source === 'new' && booking.recipientId) {
        await createRecipientAddress(booking.recipientId, { ...address, label: bookLabel.trim() })
        void queryClient.invalidateQueries({ queryKey: careRecipientKeys.addresses(booking.recipientId) })
      }
      return updateServiceAddressRequest(booking.id, {
        ...address,
        note: note.trim() || undefined,
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
    if (missingVisits || missingSource || hasAddressIssues(typedIssues) || missingLabel || save.isPending) return
    save.mutate()
  }

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Modal
      description={t('booking.address.description')}
      dismissOnBackdrop={false}
      footer={
        <>
          <p className='mr-auto flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant tabular-nums'>
            <Icon className='text-base' name='event_available' />
            {t('booking.address.selectedCount', { count: chosen.size, total: visits.length })}
          </p>
          <Button onClick={onClose} variant='ghost'>
            {t('booking.address.cancel')}
          </Button>
          <Button loading={save.isPending} onClick={submit}>
            {t('booking.address.saveCount', { count: chosen.size })}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size='xl'
      title={t('booking.address.title')}
    >
      <form
        className='grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-8'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <ServiceAddressVisits
          chosen={chosen}
          editable={editable}
          error={submitted && missingVisits ? t('booking.address.noneSelected') : undefined}
          hint={customer ? t('booking.address.visitsHint') : t('booking.address.visitsHintCenter')}
          onToggle={toggle}
          onToggleAll={() => setChosen(chosen.size === editableIds.length ? new Set() : new Set(editableIds))}
          visits={visits}
        />

        <div className='flex min-w-0 flex-col gap-4 md:border-l md:border-outline-variant/60 md:pl-8'>
          <div>
            <p className='flex items-center gap-2.5 text-base font-semibold text-on-surface'>
              <StepNumber value={2} />
              {t('booking.address.sourceTitle')}
            </p>
            <p className='mt-1.5 pl-[2.375rem] text-xs leading-5 text-on-surface-variant'>
              {t('booking.address.sourceHint')}
            </p>
          </div>
          <ServiceAddressSource
            book={
              customer
                ? {
                    ownerName: snapshot?.fullName ?? '',
                    profileLink: booking.recipientId
                      ? `/customer/patient-profiles/${booking.recipientId}?tab=addresses`
                      : undefined,
                    addresses: book.data,
                    loading: book.isPending && book.fetchStatus !== 'idle',
                    failed: book.isError
                  }
                : undefined
            }
            currentAddress={currentAddress}
            onPick={setSource}
            source={source}
          />
          {submitted && missingSource ? (
            <p className='-mt-2 text-xs font-semibold text-error' role='alert'>
              {t('booking.address.sourceRequired')}
            </p>
          ) : null}

          {source === 'new' ? (
            <div className='cc-fade-up flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low/60 p-4'>
              <AddressFields
                idPrefix='service-address'
                issues={submitted ? typedIssues : undefined}
                onChange={setTyped}
                value={typed}
              />
              {customer ? (
                <div className='rounded-xl border border-outline-variant bg-surface-container-lowest p-3'>
                  <label className='flex cursor-pointer items-center gap-2.5 text-sm font-medium text-on-surface'>
                    <input
                      checked={saveToBook}
                      className='h-[1.125rem] w-[1.125rem] accent-[var(--color-primary)]'
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
            </div>
          ) : null}

          <FormField hint={t('booking.address.noteHint')} label={t('booking.address.note')}>
            {(props) => (
              <Textarea
                {...props}
                className='min-h-20'
                maxLength={NOTE_MAX}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                value={note}
              />
            )}
          </FormField>
          <p className='flex items-start gap-2 rounded-xl bg-info-container/60 px-3 py-2.5 text-xs leading-5 text-on-info-container'>
            <Icon className='mt-px text-base' name='notifications_active' />
            {t('booking.address.notice')}
          </p>
          {save.isError ? <FormAlert tone='error'>{t(bookingErrorKey(save.error))}</FormAlert> : null}
        </div>
      </form>
    </Modal>
  )
}
