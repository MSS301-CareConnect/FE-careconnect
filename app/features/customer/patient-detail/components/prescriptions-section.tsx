import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiRequestErrorKey } from '~/shared/api/error-details'

import {
  careRecipientKeys,
  createMedication,
  removeMedication,
  saveMedication,
  setMedicationActive
} from '~/entities/care-recipient/care-recipient-api'
import { formatRecipientDate } from '~/entities/care-recipient/care-recipient-format'
import type { MedicationRecord, MedicationRequest } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { MedicationForm } from './medication-form'

export interface PrescriptionsSectionProps {
  recipientId: string
  medications: MedicationRecord[]
  isEditMode: boolean
}

export function PrescriptionsSection({ recipientId, medications, isEditMode }: PrescriptionsSectionProps) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<'new' | string | null>(null)
  const sorted = [...medications].sort((a, b) => Number(b.active) - Number(a.active))
  const activeCount = medications.filter((medication) => medication.active).length
  const refresh = () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.detail(recipientId) })

  const save = useMutation({
    mutationFn: (request: MedicationRequest) =>
      editing === 'new' || editing === null
        ? createMedication(recipientId, request)
        : saveMedication(recipientId, editing, request),
    onSuccess: async () => {
      setEditing(null)
      await refresh()
    }
  })
  const toggle = useMutation({
    mutationFn: (medication: MedicationRecord) => setMedicationActive(recipientId, medication.id, !medication.active),
    onSuccess: refresh
  })
  const remove = useMutation({
    mutationFn: (medicationId: string) => removeMedication(recipientId, medicationId),
    onSuccess: refresh
  })
  const editingMedication = sorted.find((medication) => medication.id === editing)

  function period(medication: MedicationRecord) {
    const start = formatRecipientDate(medication.startDate, i18n.language) ?? medication.startDate
    const end = formatRecipientDate(medication.endDate, i18n.language)
    return end
      ? t('customer.patientDetail.prescriptions.periodRange', { start, end })
      : t('customer.patientDetail.prescriptions.periodFrom', { start })
  }

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Icon name='pill' className='text-2xl text-primary' />
          <h2 className='text-base font-bold text-on-surface'>{t('customer.patientDetail.prescriptions.title')}</h2>
        </div>
        <span className='rounded bg-secondary-container px-2.5 py-1 text-xs font-semibold text-on-secondary-container'>
          {t('customer.patientDetail.prescriptions.activeCount', { count: activeCount })}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className='rounded-lg bg-surface-container-low p-3 text-xs text-on-surface-variant'>
          {t('customer.patientDetail.prescriptions.empty')}
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead>
              <tr className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                <th className='rounded-l-lg p-3'>{t('customer.patientDetail.prescriptions.thMedication')}</th>
                <th className='p-3'>{t('customer.patientDetail.prescriptions.thDosage')}</th>
                <th className='p-3'>{t('customer.patientDetail.prescriptions.thTime')}</th>
                <th className={`p-3 ${isEditMode ? '' : 'rounded-r-lg'}`}>
                  {t('customer.patientDetail.prescriptions.thInstructions')}
                </th>
                {isEditMode ? (
                  <th className='rounded-r-lg p-3'>{t('customer.patientDetail.prescriptions.thActions')}</th>
                ) : null}
              </tr>
            </thead>
            <tbody className='divide-y divide-surface-container'>
              {sorted.map((medication) => (
                <tr key={medication.id} className={medication.active ? '' : 'opacity-60'}>
                  <td className='p-3'>
                    <div className='flex flex-wrap items-center gap-1.5 font-semibold text-on-surface'>
                      <span>{medication.medicationName}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          medication.active
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {medication.active
                          ? t('customer.patientDetail.prescriptions.activeBadge')
                          : t('customer.patientDetail.prescriptions.inactiveBadge')}
                      </span>
                    </div>
                    <div className='text-[11px] text-on-surface-variant'>
                      {[
                        medication.route ? t(`customer.careRecipient.route.${medication.route}`) : undefined,
                        period(medication)
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </td>
                  <td className='p-3 font-medium'>
                    {[medication.dosage, medication.frequency].filter(Boolean).join(' • ') || '-'}
                  </td>
                  <td className='p-3'>
                    <div className='flex flex-wrap gap-1'>
                      {(medication.timeOfDay ?? []).map((time) => (
                        <span
                          key={time}
                          className='rounded bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-primary'
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='p-3 text-on-surface-variant'>
                    {medication.usageNotes ? <p>{medication.usageNotes}</p> : null}
                    {medication.prescribedBy ? (
                      <p className='text-[11px]'>
                        {t('customer.patientDetail.prescriptions.prescribedBy', { name: medication.prescribedBy })}
                      </p>
                    ) : null}
                  </td>
                  {isEditMode ? (
                    <td className='p-3'>
                      <div className='flex flex-col items-start gap-1 text-[11px] font-semibold'>
                        <button type='button' onClick={() => setEditing(medication.id)} className='text-primary'>
                          {t('customer.patientDetail.prescriptions.edit')}
                        </button>
                        <button
                          type='button'
                          disabled={toggle.isPending}
                          onClick={() => toggle.mutate(medication)}
                          className='text-primary'
                        >
                          {medication.active
                            ? t('customer.patientDetail.prescriptions.deactivate')
                            : t('customer.patientDetail.prescriptions.activate')}
                        </button>
                        <button
                          type='button'
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(medication.id)}
                          className='text-error'
                        >
                          {t('customer.patientDetail.prescriptions.delete')}
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditMode && editing !== null ? (
        <MedicationForm
          key={editing}
          medication={editingMedication}
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
          {t('customer.patientDetail.prescriptions.addMedication')}
        </button>
      ) : null}

      {save.isError || toggle.isError || remove.isError ? (
        <p role='alert' className='text-xs text-error'>
          {t(
            apiRequestErrorKey(
              save.error ?? toggle.error ?? remove.error,
              'customer.patientDetail.prescriptions.actionError'
            )
          )}
        </p>
      ) : null}
    </div>
  )
}
