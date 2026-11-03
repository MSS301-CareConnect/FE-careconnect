import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  careCatalogErrorCode,
  careCatalogKeys,
  removeOffering,
  removePricePlan
} from '~/entities/care-catalog/care-catalog-api'
import type { CenterOfferingRecord, PricePlanRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Modal } from '~/shared/ui/modal'

import { editorErrorKey } from '../service-editors'

const key = 'centerManager.services' as const

/** CareCatalogService refuses (409, 3206) to delete a service that still has an active plan. */
const OFFERING_IN_USE = 3206

function DeleteFooter({
  blocked = false,
  pending,
  onClose,
  onConfirm,
  confirmLabel
}: {
  blocked?: boolean
  pending: boolean
  onClose: () => void
  onConfirm: () => void
  confirmLabel: string
}) {
  const { t } = useTranslation()
  return (
    <>
      <Button disabled={pending} onClick={onClose} size='md' variant='outline'>
        {t(blocked ? `${key}.close` : `${key}.cancel`)}
      </Button>
      {blocked ? null : (
        <Button loading={pending} loadingLabel={t(`${key}.deleting`)} onClick={onConfirm} size='md' variant='danger'>
          {confirmLabel}
        </Button>
      )}
    </>
  )
}

export function DeleteOfferingDialog({
  offering,
  activePlanCount,
  onClose,
  onDeleted
}: {
  offering: CenterOfferingRecord
  activePlanCount: number
  onClose: () => void
  onDeleted: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: () => removeOffering(offering.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onDeleted()
    }
  })
  // Checked here so the manager learns the rule before trying; the backend enforces it again.
  const blocked = activePlanCount > 0 || careCatalogErrorCode(remove.error) === OFFERING_IN_USE

  return (
    <Modal
      footer={
        <DeleteFooter
          blocked={blocked}
          confirmLabel={t(`${key}.deleteOfferingDialog.confirm`)}
          onClose={onClose}
          onConfirm={() => remove.mutate()}
          pending={remove.isPending}
        />
      }
      maxWidthClass='max-w-md'
      onClose={onClose}
      open
      title={t(`${key}.deleteOfferingDialog.title`, { name: offering.catalogItem.name })}
    >
      {blocked ? (
        <p className='rounded-xl bg-warning/10 px-4 py-3 text-sm leading-6 text-on-surface' role='alert'>
          {t(`${key}.deleteOfferingDialog.blocked`, { count: Math.max(activePlanCount, 1) })}
        </p>
      ) : (
        <div className='space-y-3 text-sm leading-6 text-on-surface-variant'>
          <p>{t(`${key}.deleteOfferingDialog.description`)}</p>
          {remove.isError ? (
            <p className='rounded-xl bg-error/10 px-4 py-3 text-error' role='alert'>
              {t(editorErrorKey(remove.error, 'offeringForm'))}
            </p>
          ) : null}
        </div>
      )}
    </Modal>
  )
}

export function DeletePlanDialog({
  plan,
  lastActive,
  onClose
}: {
  plan: PricePlanRecord
  /** Removing the only offered plan hides the service from customers. */
  lastActive: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: () => removePricePlan(plan.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onClose()
    }
  })

  return (
    <Modal
      footer={
        <DeleteFooter
          confirmLabel={t(`${key}.deletePlanDialog.confirm`)}
          onClose={onClose}
          onConfirm={() => remove.mutate()}
          pending={remove.isPending}
        />
      }
      maxWidthClass='max-w-md'
      onClose={onClose}
      open
      title={t(`${key}.deletePlanDialog.title`, { name: plan.planName })}
    >
      <div className='space-y-3 text-sm leading-6 text-on-surface-variant'>
        <p>{t(`${key}.deletePlanDialog.description`)}</p>
        {lastActive ? (
          <p className='rounded-xl bg-warning/10 px-4 py-3 text-on-surface'>
            {t(`${key}.deletePlanDialog.lastActive`)}
          </p>
        ) : null}
        {remove.isError ? (
          <p className='rounded-xl bg-error/10 px-4 py-3 text-error' role='alert'>
            {t(editorErrorKey(remove.error, 'planForm'))}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
