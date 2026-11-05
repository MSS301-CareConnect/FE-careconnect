import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AddressFields } from '~/entities/address/address-fields'
import { addressIssues, hasAddressIssues, normalizeAddress, type AddressParts } from '~/entities/address/admin-units'
import { useAdminUnits } from '~/entities/address/use-admin-units'
import {
  careRecipientKeys,
  createRecipientAddress,
  fetchRecipientAddresses,
  formatRecipientAddress,
  removeRecipientAddress,
  saveRecipientAddress
} from '~/entities/care-recipient/care-recipient-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { RecipientAddressRecord, RecipientAddressRequest } from '~/shared/api/generated/contracts'
import { ActionMenu } from '~/shared/ui/action-menu'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormField, Input, Textarea } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'

import { DetailSection } from './detail-ui'

const key = 'customer.patientDetail.addressBook' as const
const EMPTY: RecipientAddressRequest = { label: '', addressLine: '', ward: '', district: '', province: '', note: '' }

/**
 * Address book of the person cared for (2026-11-05): places they may stay besides the profile address, such as another
 * child's home. Picked when booking and when moving some visits elsewhere; every co-manager sees the same list.
 */
export function AddressesCard({
  recipientId,
  profileAddress,
  canEdit
}: {
  recipientId: string
  profileAddress: string
  canEdit: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<'new' | RecipientAddressRecord | null>(null)
  const [deleting, setDeleting] = useState<RecipientAddressRecord | null>(null)
  const addresses = useQuery({
    queryKey: careRecipientKeys.addresses(recipientId),
    queryFn: () => fetchRecipientAddresses(recipientId),
    retry: false
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.addresses(recipientId) })
  const save = useMutation({
    mutationFn: (request: RecipientAddressRequest) =>
      editing === 'new' || editing === null
        ? createRecipientAddress(recipientId, request)
        : saveRecipientAddress(recipientId, editing.id, request),
    onSuccess: async () => {
      toastSuccess(t(`${key}.saved`))
      setEditing(null)
      await refresh()
    }
  })
  const remove = useMutation({
    mutationFn: (addressId: string) => removeRecipientAddress(recipientId, addressId),
    onSuccess: async () => {
      setDeleting(null)
      await refresh()
    }
  })
  const items = addresses.data ?? []

  return (
    <div className='flex flex-col gap-5'>
      <DetailSection
        action={
          canEdit ? (
            <Button
              className='whitespace-nowrap'
              leftIcon={<Icon className='text-lg' name='add_location_alt' />}
              onClick={() => {
                save.reset()
                setEditing('new')
              }}
              size='sm'
              variant='outline'
            >
              {t(`${key}.add`)}
            </Button>
          ) : undefined
        }
        icon='home_pin'
        title={t(`${key}.title`)}
      >
        <p className='-mt-2 mb-4 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>
        <ul className='flex flex-col divide-y divide-outline-variant/70'>
          <li className='flex items-start gap-3 pb-3'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'>
              <Icon className='text-lg' name='home' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='flex flex-wrap items-center gap-2 font-semibold text-on-surface'>
                {t(`${key}.profileAddress`)}
                <span className='rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
                  {t(`${key}.defaultBadge`)}
                </span>
              </p>
              <p className='text-sm text-on-surface-variant'>{profileAddress || t(`${key}.noProfileAddress`)}</p>
            </div>
          </li>
          {addresses.isPending ? (
            <li className='py-3 text-sm text-on-surface-variant' role='status'>
              {t(`${key}.loading`)}
            </li>
          ) : null}
          {addresses.isError ? (
            <li className='py-3 text-sm text-error' role='alert'>
              {t(`${key}.error`)}
            </li>
          ) : null}
          {items.map((address) => (
            <li className='flex items-start gap-3 py-3 last:pb-0' key={address.id}>
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-container-high text-on-surface-variant'>
                <Icon className='text-lg' name='bookmark' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='font-semibold text-on-surface'>{address.label}</p>
                <p className='text-sm text-on-surface-variant'>{formatRecipientAddress(address)}</p>
                {address.note ? <p className='mt-0.5 text-xs text-on-surface-variant italic'>{address.note}</p> : null}
              </div>
              {canEdit ? (
                <ActionMenu
                  items={[
                    {
                      id: 'edit',
                      label: t(`${key}.edit`),
                      icon: 'edit',
                      onSelect: () => {
                        save.reset()
                        setEditing(address)
                      }
                    },
                    {
                      id: 'delete',
                      label: t(`${key}.delete`),
                      icon: 'delete',
                      tone: 'danger' as const,
                      onSelect: () => {
                        remove.reset()
                        setDeleting(address)
                      }
                    }
                  ]}
                  label={t(`${key}.more`, { name: address.label })}
                />
              ) : null}
            </li>
          ))}
        </ul>
        {addresses.isSuccess && items.length === 0 ? (
          <p className='mt-3 rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant'>
            {t(`${key}.empty`)}
          </p>
        ) : null}
      </DetailSection>

      <Modal
        dismissOnBackdrop={false}
        maxWidthClass='max-w-2xl'
        onClose={() => !save.isPending && setEditing(null)}
        open={editing !== null}
        title={editing === 'new' ? t(`${key}.addTitle`) : t(`${key}.editTitle`)}
      >
        {editing !== null ? (
          <AddressForm
            error={save.isError ? t(apiRequestErrorKey(save.error, `${key}.actionError`)) : undefined}
            initial={editing === 'new' ? EMPTY : { ...EMPTY, ...editing }}
            key={editing === 'new' ? 'new' : editing.id}
            onCancel={() => setEditing(null)}
            onSubmit={(request) => save.mutate(request)}
            saving={save.isPending}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        confirmLabel={t(`${key}.delete`)}
        danger
        description={t(`${key}.deleteHint`)}
        error={remove.isError ? t(apiRequestErrorKey(remove.error, `${key}.actionError`)) : undefined}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        open={deleting !== null}
        title={t(`${key}.deleteTitle`, { name: deleting?.label ?? '' })}
      />
    </div>
  )
}

/** Name of the place, then province → ward → street in today's units, and a note. */
function AddressForm({
  initial,
  saving,
  error,
  onSubmit,
  onCancel
}: {
  initial: RecipientAddressRequest
  saving: boolean
  error?: string
  onSubmit: (request: RecipientAddressRequest) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const units = useAdminUnits()
  const [label, setLabel] = useState(initial.label)
  const [note, setNote] = useState(initial.note ?? '')
  const [address, setAddress] = useState<AddressParts>({
    addressLine: initial.addressLine,
    ward: initial.ward ?? '',
    province: initial.province
  })
  const [submitted, setSubmitted] = useState(false)
  const issues = addressIssues(address, units.data)
  const missingLabel = !label.trim()

  return (
    <form
      className='flex flex-col gap-4'
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
        if (missingLabel || hasAddressIssues(issues)) return
        const parts = normalizeAddress(address, units.data)
        onSubmit({
          label: label.trim(),
          addressLine: parts.addressLine,
          ward: parts.ward || undefined,
          district: undefined,
          province: parts.province,
          note: note.trim() || undefined
        })
      }}
    >
      <FormField
        error={submitted && missingLabel ? t(`${key}.labelRequired`) : undefined}
        hint={t(`${key}.labelHint`)}
        label={t(`${key}.label`)}
      >
        {(props) => (
          <Input {...props} maxLength={100} onChange={(event) => setLabel(event.target.value)} value={label} />
        )}
      </FormField>
      <AddressFields
        idPrefix='address-book'
        issues={submitted ? issues : undefined}
        onChange={setAddress}
        value={address}
      />
      <FormField hint={t(`${key}.noteHint`)} label={t('booking.address.note')}>
        {(props) => (
          <Textarea
            {...props}
            className='min-h-20'
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            value={note}
          />
        )}
      </FormField>
      {error ? (
        <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
          {error}
        </p>
      ) : null}
      <div className='flex justify-end gap-2'>
        <Button onClick={onCancel} type='button' variant='ghost'>
          {t('booking.address.cancel')}
        </Button>
        <Button loading={saving} type='submit'>
          {t(`${key}.save`)}
        </Button>
      </div>
    </form>
  )
}
