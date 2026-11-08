import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  careRecipientKeys,
  createMedication,
  removeMedication,
  saveMedication,
  setMedicationActive
} from '~/entities/care-recipient/care-recipient-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { MedicationRecord, MedicationRequest } from '~/shared/api/generated/contracts'
import { formatCalendarDate } from '~/shared/lib/format'
import { ActionMenu } from '~/shared/ui/action-menu'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'

import { DetailSection } from './detail-ui'
import { MedicationForm } from './medication-form'

const key = 'customer.patientDetail.prescriptions' as const

/** Medications as a list: active first, each with its dose, times and notes; add and edit open in a centred dialog. */
export function MedicationsSection({
  recipientId,
  medications,
  canEdit
}: {
  recipientId: string
  medications: MedicationRecord[]
  canEdit: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<'new' | MedicationRecord | null>(null)
  const [deleting, setDeleting] = useState<MedicationRecord | null>(null)
  const sorted = [...medications].sort((a, b) => Number(b.active) - Number(a.active))
  const refresh = () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.detail(recipientId) })

  const save = useMutation({
    mutationFn: (request: MedicationRequest) =>
      editing === 'new' || editing === null
        ? createMedication(recipientId, request)
        : saveMedication(recipientId, editing.id, request),
    onSuccess: async () => {
      toastSuccess(t(`${key}.saved`))
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
    onSuccess: async () => {
      setDeleting(null)
      await refresh()
    }
  })

  function period(medication: MedicationRecord) {
    const start = formatCalendarDate(medication.startDate)
    const end = formatCalendarDate(medication.endDate)
    return end ? t(`${key}.periodRange`, { start, end }) : t(`${key}.periodFrom`, { start })
  }

  return (
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
            {t(`${key}.add`)}
          </Button>
        ) : undefined
      }
      icon='medication'
      title={t(`${key}.title`)}
    >
      {sorted.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t(`${key}.empty`)}</p>
      ) : (
        <ul className='flex flex-col divide-y divide-outline-variant/70'>
          {sorted.map((medication) => (
            <li
              className={`flex items-start gap-3 py-3 first:pt-0 last:pb-0 ${medication.active ? '' : 'opacity-70'}`}
              key={medication.id}
            >
              <span className='mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'>
                <Icon className='text-lg' name='pill' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='flex flex-wrap items-center gap-2 font-semibold text-on-surface'>
                  {medication.medicationName}
                  {medication.active ? null : <StatusBadge tone='neutral'>{t(`${key}.inactiveBadge`)}</StatusBadge>}
                </p>
                <p className='text-sm text-on-surface-variant'>
                  {[
                    medication.dosage,
                    medication.frequency,
                    medication.route ? t(`customer.careRecipient.route.${medication.route}`) : undefined
                  ]
                    .filter(Boolean)
                    .join(' · ') || null}
                </p>
                {medication.timeOfDay?.length ? (
                  <p className='mt-1 flex flex-wrap gap-1.5'>
                    {medication.timeOfDay.map((time) => (
                      <span
                        className='inline-flex items-center gap-1 rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-semibold text-on-surface tabular-nums'
                        key={time}
                      >
                        <Icon className='text-sm text-primary' name='schedule' />
                        {time}
                      </span>
                    ))}
                  </p>
                ) : null}
                <p className='mt-1 text-xs text-on-surface-variant tabular-nums'>
                  {[
                    period(medication),
                    medication.prescribedBy ? t(`${key}.prescribedBy`, { name: medication.prescribedBy }) : undefined
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {medication.usageNotes ? (
                  <p className='mt-1 text-sm whitespace-pre-line text-on-surface'>{medication.usageNotes}</p>
                ) : null}
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
                        setEditing(medication)
                      }
                    },
                    {
                      id: 'toggle',
                      label: medication.active ? t(`${key}.deactivate`) : t(`${key}.activate`),
                      icon: medication.active ? 'pause_circle' : 'play_circle',
                      onSelect: () => toggle.mutate(medication)
                    },
                    {
                      id: 'delete',
                      label: t(`${key}.delete`),
                      icon: 'delete',
                      tone: 'danger',
                      onSelect: () => {
                        remove.reset()
                        setDeleting(medication)
                      }
                    }
                  ]}
                  label={t(`${key}.more`, { name: medication.medicationName })}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {toggle.isError ? (
        <p className='mt-3 text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(toggle.error, `${key}.actionError`))}
        </p>
      ) : null}

      <Modal
        dismissOnBackdrop={false}
        maxWidthClass='max-w-3xl'
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
            <MedicationForm
              isSaving={save.isPending}
              key={editing === 'new' ? 'new' : editing.id}
              medication={editing === 'new' ? undefined : editing}
              onCancel={() => setEditing(null)}
              onSubmit={(request) => save.mutate(request)}
            />
          </div>
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
        title={t(`${key}.deleteTitle`, { name: deleting?.medicationName ?? '' })}
      />
    </DetailSection>
  )
}
