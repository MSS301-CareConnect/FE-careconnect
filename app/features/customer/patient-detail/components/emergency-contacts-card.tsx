import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  careRecipientKeys,
  createEmergencyContact,
  makePrimaryEmergencyContact,
  removeEmergencyContact,
  saveEmergencyContact
} from '~/entities/care-recipient/care-recipient-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { EmergencyContactRecord, EmergencyContactRequest } from '~/shared/api/generated/contracts'
import { ActionMenu } from '~/shared/ui/action-menu'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'

import { DetailSection, EmergencyCallout } from './detail-ui'
import { EmergencyContactForm } from './emergency-contact-form'

const key = 'customer.patientDetail.emergencySection' as const

/** People to call first, the primary one on top, each with a call button; add and edit open in a centred dialog. */
export function EmergencyContactsCard({
  recipientId,
  contacts,
  canEdit
}: {
  recipientId: string
  contacts: EmergencyContactRecord[]
  canEdit: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<'new' | EmergencyContactRecord | null>(null)
  const [deleting, setDeleting] = useState<EmergencyContactRecord | null>(null)
  const sorted = [...contacts].sort((a, b) => Number(b.primary) - Number(a.primary) || a.priority - b.priority)
  const refresh = () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.detail(recipientId) })

  const save = useMutation({
    mutationFn: (request: EmergencyContactRequest) =>
      editing === 'new' || editing === null
        ? createEmergencyContact(recipientId, request)
        : saveEmergencyContact(recipientId, editing.id, request),
    onSuccess: async () => {
      toastSuccess(t(`${key}.saved`))
      setEditing(null)
      await refresh()
    }
  })
  const makePrimary = useMutation({
    mutationFn: (contactId: string) => makePrimaryEmergencyContact(recipientId, contactId),
    onSuccess: refresh
  })
  const remove = useMutation({
    mutationFn: (contactId: string) => removeEmergencyContact(recipientId, contactId),
    onSuccess: async () => {
      setDeleting(null)
      await refresh()
    }
  })

  return (
    <div className='flex flex-col gap-5'>
      <DetailSection
        action={
          canEdit ? (
            <Button
              leftIcon={<Icon className='text-lg' name='add' />}
              onClick={() => {
                save.reset()
                setEditing('new')
              }}
              className='whitespace-nowrap'
              size='sm'
              variant='outline'
            >
              {t(`${key}.addShort`)}
            </Button>
          ) : undefined
        }
        icon='contact_emergency'
        title={t(`${key}.title`)}
      >
        {sorted.length === 0 ? (
          <p className='text-sm text-on-surface-variant'>{t(`${key}.empty`)}</p>
        ) : (
          <ul className='flex flex-col divide-y divide-outline-variant/70'>
            {sorted.map((contact) => (
              <li className='flex items-center gap-3 py-3 first:pt-0 last:pb-0' key={contact.id}>
                <Avatar className='h-10 w-10 shrink-0 rounded-full text-sm' decorative name={contact.fullName} />
                <div className='min-w-0 flex-1'>
                  <p className='flex flex-wrap items-center gap-2 font-semibold text-on-surface'>
                    {contact.fullName}
                    {contact.primary ? (
                      <span className='rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-primary'>
                        {t(`${key}.primaryBadge`)}
                      </span>
                    ) : null}
                  </p>
                  <p className='text-sm text-on-surface-variant tabular-nums'>
                    {contact.relationship} · {contact.phoneNumber}
                  </p>
                </div>
                <a
                  aria-label={t(`${key}.call`, { name: contact.fullName })}
                  className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  href={`tel:${contact.phoneNumber}`}
                >
                  <Icon className='text-lg' name='call' />
                </a>
                {canEdit ? (
                  <ActionMenu
                    items={[
                      {
                        id: 'edit',
                        label: t(`${key}.edit`),
                        icon: 'edit',
                        onSelect: () => {
                          save.reset()
                          setEditing(contact)
                        }
                      },
                      ...(contact.primary
                        ? []
                        : [
                            {
                              id: 'primary',
                              label: t(`${key}.makePrimary`),
                              icon: 'star',
                              onSelect: () => makePrimary.mutate(contact.id)
                            }
                          ]),
                      {
                        id: 'delete',
                        label: t(`${key}.delete`),
                        icon: 'delete',
                        tone: 'danger' as const,
                        onSelect: () => {
                          remove.reset()
                          setDeleting(contact)
                        }
                      }
                    ]}
                    label={t(`${key}.more`, { name: contact.fullName })}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {makePrimary.isError ? (
          <p className='mt-3 text-sm text-error' role='alert'>
            {t(apiRequestErrorKey(makePrimary.error, `${key}.actionError`))}
          </p>
        ) : null}
      </DetailSection>

      <EmergencyCallout number={t(`${key}.hotlineNumber`)} title={t(`${key}.hotlineTitle`)} />

      <Modal
        dismissOnBackdrop={false}
        maxWidthClass='max-w-2xl'
        onClose={() => !save.isPending && setEditing(null)}
        open={editing !== null}
        title={editing === 'new' ? t(`${key}.addTitle`) : t(`${key}.editTitle`)}
      >
        {editing !== null ? (
          <div className='flex flex-col gap-3'>
            {save.isError ? (
              <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
                {t(apiRequestErrorKey(save.error, `${key}.actionError`))}
              </p>
            ) : null}
            <EmergencyContactForm
              contact={editing === 'new' ? undefined : editing}
              isSaving={save.isPending}
              key={editing === 'new' ? 'new' : editing.id}
              onCancel={() => setEditing(null)}
              onSubmit={(request) => save.mutate(request)}
            />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        confirmLabel={t(`${key}.delete`)}
        danger
        error={remove.isError ? t(apiRequestErrorKey(remove.error, `${key}.actionError`)) : undefined}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        open={deleting !== null}
        title={t(`${key}.deleteTitle`, { name: deleting?.fullName ?? '' })}
      />
    </div>
  )
}
