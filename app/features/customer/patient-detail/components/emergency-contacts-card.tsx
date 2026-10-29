import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'

import {
  careRecipientKeys,
  createEmergencyContact,
  makePrimaryEmergencyContact,
  removeEmergencyContact,
  saveEmergencyContact
} from '~/entities/care-recipient/care-recipient-api'
import type { EmergencyContactRecord, EmergencyContactRequest } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { EmergencyContactForm } from './emergency-contact-form'

export interface EmergencyContactsCardProps {
  recipientId: string
  contacts: EmergencyContactRecord[]
  isEditMode: boolean
}

export function EmergencyContactsCard({ recipientId, contacts, isEditMode }: EmergencyContactsCardProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<'new' | string | null>(null)
  const sorted = [...contacts].sort((a, b) => Number(b.primary) - Number(a.primary))
  const refresh = () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.detail(recipientId) })

  const save = useMutation({
    mutationFn: (request: EmergencyContactRequest) =>
      editing === 'new' || editing === null
        ? createEmergencyContact(recipientId, request)
        : saveEmergencyContact(recipientId, editing, request),
    onSuccess: async () => {
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
    onSuccess: refresh
  })
  const failed = save.isError || makePrimary.isError || remove.isError

  return (
    <div className='flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-sm font-semibold text-on-surface'>
          <Icon name='e911_emergency' className='text-lg text-error' />
          <span>{t('customer.patientDetail.emergencySection.title')}</span>
        </h3>
        <span className='text-[11px] text-on-surface-variant'>
          {t('customer.patientDetail.emergencySection.priorityBadge')}
        </span>
      </div>

      <div className='mt-1 flex flex-col gap-2'>
        {sorted.length === 0 && !(isEditMode && editing === 'new') ? (
          <p className='rounded-lg bg-surface-container-low p-3 text-xs text-on-surface-variant'>
            {t('customer.patientDetail.emergencySection.empty')}
          </p>
        ) : null}

        {sorted.map((contact) =>
          isEditMode && editing === contact.id ? (
            <EmergencyContactForm
              key={contact.id}
              contact={contact}
              isSaving={save.isPending}
              onSubmit={(request) => save.mutate(request)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={contact.id} className='flex flex-col gap-2 rounded-lg bg-surface-container-low p-3'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex min-w-0 flex-col'>
                  <span className='flex flex-wrap items-center gap-1.5 text-xs font-semibold text-on-surface'>
                    <span>{contact.fullName}</span>
                    {contact.primary ? (
                      <span className='rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-on-primary'>
                        {t('customer.patientDetail.emergencySection.primaryBadge')}
                      </span>
                    ) : null}
                  </span>
                  <span className='text-[11px] text-on-surface-variant'>
                    {contact.relationship} • {contact.phoneNumber} •{' '}
                    {t('customer.patientDetail.emergencySection.priorityValue', { priority: contact.priority })}
                  </span>
                </div>
                <a
                  href={`tel:${contact.phoneNumber}`}
                  title={t('customer.patientDetail.emergencySection.call', { name: contact.fullName })}
                  aria-label={t('customer.patientDetail.emergencySection.call', { name: contact.fullName })}
                  className={`shrink-0 rounded-full p-2 transition-colors ${
                    contact.primary
                      ? 'bg-primary text-on-primary hover:bg-primary-container'
                      : 'bg-surface-container text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <Icon name='call' className='text-sm' />
                </a>
              </div>
              {isEditMode ? (
                <div className='flex flex-wrap gap-2 text-[11px] font-semibold'>
                  <button type='button' onClick={() => setEditing(contact.id)} className='text-primary'>
                    {t('customer.patientDetail.emergencySection.edit')}
                  </button>
                  {!contact.primary ? (
                    <button
                      type='button'
                      disabled={makePrimary.isPending}
                      onClick={() => makePrimary.mutate(contact.id)}
                      className='text-primary'
                    >
                      {t('customer.patientDetail.emergencySection.makePrimary')}
                    </button>
                  ) : null}
                  <button
                    type='button'
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(contact.id)}
                    className='text-error'
                  >
                    {t('customer.patientDetail.emergencySection.delete')}
                  </button>
                </div>
              ) : null}
            </div>
          )
        )}

        {isEditMode && editing === 'new' ? (
          <EmergencyContactForm
            isSaving={save.isPending}
            onSubmit={(request) => save.mutate(request)}
            onCancel={() => setEditing(null)}
          />
        ) : isEditMode ? (
          <button
            type='button'
            onClick={() => setEditing('new')}
            className='self-start rounded-lg bg-surface-container px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high'
          >
            {t('customer.patientDetail.emergencySection.add')}
          </button>
        ) : null}

        {failed ? (
          <p role='alert' className='text-xs text-error'>
            {t(
              apiRequestErrorKey(
                save.error ?? makePrimary.error ?? remove.error,
                'customer.patientDetail.emergencySection.actionError'
              )
            )}
          </p>
        ) : null}

        {/* Hotline Box */}
        <div className='flex items-center justify-between rounded-lg bg-error-container/40 p-3 text-on-error-container'>
          <div className='flex items-center gap-2'>
            <Icon name='medical_services' className='text-xl text-error' />
            <div className='flex flex-col'>
              <span className='text-xs font-bold text-error'>
                {t('customer.patientDetail.emergencySection.hotlineTitle')}
              </span>
              <span className='text-[11px] text-on-error-container'>
                {t('customer.patientDetail.emergencySection.hotlineDesc')}
              </span>
            </div>
          </div>
          <span className='text-sm font-bold text-error'>
            {t('customer.patientDetail.emergencySection.hotlineNumber')}
          </span>
        </div>
      </div>
    </div>
  )
}
