import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { providerKeys, removeCenter } from '~/entities/provider/provider-api'
import { classifyApiError } from '~/shared/api/api-error'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { ConfirmDialog } from '~/shared/ui/modal'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { CENTER_BUSINESS_ERRORS } from '../center-errors'

const key = 'admin.centersPage.detail' as const

/**
 * Confirms and runs the archive (soft delete) of one center, from the list's row menu or the center page. A business
 * refusal (running bookings, stale version) stays in the dialog; a system failure is a toast with a retry.
 */
export function ArchiveCenterDialog({
  center,
  onClose,
  onArchived
}: {
  center: ProviderCenterRecord
  onClose: () => void
  onArchived?: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const notify = useActionToast()
  const archive = useMutation({
    mutationFn: () => removeCenter(center.id, center.version),
    onError: (error) => {
      if (notify.systemError(error, t('admin.toast.centers.actions.archive'), () => archive.mutate())) onClose()
    },
    onSuccess: async () => {
      notify.success(t('admin.toast.centers.archived', { name: center.centerName }))
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      await queryClient.invalidateQueries({ queryKey: ['statistics'] })
      onClose()
      onArchived?.()
    }
  })
  const failure = archive.error ? classifyApiError(archive.error, { business: CENTER_BUSINESS_ERRORS }) : null
  return (
    <ConfirmDialog
      confirmLabel={t(`${key}.archive`)}
      description={t(`${key}.archiveDescription`)}
      error={failure && failure.kind === 'business' ? t(failure.key) : undefined}
      loading={archive.isPending}
      onClose={onClose}
      onConfirm={() => archive.mutate()}
      open
      title={t(`${key}.archiveTitle`, { name: center.centerName })}
      tone='danger'
    />
  )
}
