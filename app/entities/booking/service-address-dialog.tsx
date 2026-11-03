import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BookingDetailRecord, ServiceAddressRequest } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'

import { bookingKeys, updateServiceAddressRequest } from './booking-api'
import { bookingErrorKey } from './booking-format'

const NOTE_MAX = 500

/** Statuses where a booking still has a schedule (BookingService also needs an upcoming visit and none running). */
const ADDRESS_EDITABLE = new Set<BookingDetailRecord['status']>([
  'PENDING_CENTER_CONFIRMATION',
  'PENDING_CAREGIVER_CONFIRMATION',
  'PENDING_CAREGIVER_ASSIGNMENT',
  'AWAITING_INITIAL_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS'
])

/** CR-2: whether the customer or the center can still move the upcoming visits to another address. */
export function canChangeServiceAddress(booking: BookingDetailRecord, now: number) {
  if (!ADDRESS_EDITABLE.has(booking.status)) return false
  const visits = booking.occurrences ?? []
  if (visits.some((visit) => visit.status === 'IN_PROGRESS')) return false
  return visits.some(
    (visit) =>
      ['PENDING_ASSIGNMENT', 'RESERVED', 'SCHEDULED', 'ACKNOWLEDGED'].includes(visit.status) &&
      new Date(visit.startAt).getTime() > now
  )
}

/**
 * CR-2: a centred two-column form that moves every upcoming visit to another care address (the person cared for is
 * staying somewhere else). The center and the assigned caregivers are notified by BookingService.
 */
export function ServiceAddressDialog({
  booking,
  open,
  onClose
}: {
  booking: BookingDetailRecord
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const snapshot = booking.recipientSnapshot
  const [form, setForm] = useState<ServiceAddressRequest>(() => ({
    addressLine: snapshot?.addressLine ?? '',
    ward: snapshot?.ward ?? '',
    district: snapshot?.district ?? '',
    province: snapshot?.province ?? '',
    note: ''
  }))
  const [submitted, setSubmitted] = useState(false)
  const missingLine = !form.addressLine.trim()
  const missingProvince = !form.province.trim()

  const save = useMutation({
    mutationFn: () =>
      updateServiceAddressRequest(booking.id, {
        addressLine: form.addressLine.trim(),
        ward: form.ward?.trim() || undefined,
        district: form.district?.trim() || undefined,
        province: form.province.trim(),
        note: form.note?.trim() || undefined
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), updated)
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })

  function submit() {
    setSubmitted(true)
    if (missingLine || missingProvince || save.isPending) return
    save.mutate()
  }

  const field = (key: keyof ServiceAddressRequest) => ({
    value: form[key] ?? '',
    onChange: (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }))
  })

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
            {t('booking.address.save')}
          </Button>
        </>
      }
      maxWidthClass='max-w-2xl'
      onClose={onClose}
      open={open}
      title={t('booking.address.title')}
    >
      <form
        className='grid gap-4 sm:grid-cols-2'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
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
          error={submitted && missingProvince ? t('booking.errors.e5114') : undefined}
          label={t('booking.address.province')}
        >
          {(props) => <Input {...props} maxLength={100} {...field('province')} />}
        </FormField>
        <FormField className='sm:col-span-2' hint={t('booking.address.noteHint')} label={t('booking.address.note')}>
          {(props) => <Textarea {...props} maxLength={NOTE_MAX} rows={2} {...field('note')} />}
        </FormField>
        <p className='text-xs text-on-surface-variant sm:col-span-2'>{t('booking.address.notice')}</p>
        {save.isError ? (
          <FormAlert className='sm:col-span-2' tone='error'>
            {t(bookingErrorKey(save.error))}
          </FormAlert>
        ) : null}
      </form>
    </Modal>
  )
}
