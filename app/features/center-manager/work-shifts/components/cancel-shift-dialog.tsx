import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { cancelWorkShift, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { classifyApiError, type ApiErrorMap } from '~/shared/api/api-error'
import { useFormat } from '~/shared/lib/format'
import { toastSuccess, toastSystemError } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'

const k = 'centerManager.workShifts.cancel' as const
type CancelKey =
  | `${typeof k}.hasBookings`
  | `${typeof k}.started`
  | 'centerManager.workShifts.form.business.conflict'
  | 'centerManager.workShifts.form.business.statusInvalid'

const CANCEL_ERRORS: ApiErrorMap<never, never, CancelKey> = {
  business: {
    4314: `${k}.hasBookings`,
    4308: `${k}.started`,
    4301: 'centerManager.workShifts.form.business.conflict',
    4307: 'centerManager.workShifts.form.business.statusInvalid'
  }
}

/** Cancel before the start with a required reason; the reason reaches every caregiver who signed up. */
export function CancelShiftDialog({
  shift,
  centerId,
  onClose
}: {
  shift: ProviderWorkShiftRecord
  centerId: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const date = format.date(shift.workDate)
  const cancel = useMutation({
    mutationFn: () => cancelWorkShift(shift.id, { reason: reason.trim(), version: shift.version }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(providerKeys.shift(shift.id), updated)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) }),
        queryClient.invalidateQueries({ queryKey: providerKeys.registrations(shift.id) })
      ])
      toastSuccess(t(`${k}.success`, { date }))
      onClose()
    },
    onError: (error) => {
      toastSystemError(error, {
        message: t('centerManager.workShifts.form.systemError'),
        retryLabel: t('centerManager.workShifts.retry'),
        retry: () => cancel.mutate()
      })
    }
  })
  const failure = cancel.isError ? classifyApiError(cancel.error, CANCEL_ERRORS) : null
  const approved = shift.approvedCount ?? 0

  return (
    <Modal
      description={t(`${k}.description`)}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button disabled={cancel.isPending} onClick={onClose} variant='ghost'>
            {t(`${k}.keep`)}
          </Button>
          <Button
            loading={cancel.isPending}
            loadingLabel={t('common.ui.working')}
            onClick={() => {
              const value = reason.trim()
              if (!value || value.length > 500) {
                setReasonError(true)
                return
              }
              cancel.mutate()
            }}
            variant='danger'
          >
            {t(`${k}.confirm`)}
          </Button>
        </>
      }
      onClose={onClose}
      open
      size='md'
      title={t(`${k}.title`, { date })}
    >
      <div className='space-y-4'>
        {approved > 0 ? <FormAlert tone='warning'>{t(`${k}.approvedWarning`, { count: approved })}</FormAlert> : null}
        <FormField error={reasonError ? t(`${k}.reasonRequired`) : undefined} label={t(`${k}.reason`)}>
          {(control) => (
            <Textarea
              {...control}
              autoFocus
              maxLength={550}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError(false)
              }}
              placeholder={t(`${k}.reasonPlaceholder`)}
              rows={3}
              value={reason}
            />
          )}
        </FormField>
        {failure && failure.kind !== 'system' && failure.kind !== 'field' ? (
          <FormAlert tone='warning'>{t(failure.key)}</FormAlert>
        ) : null}
      </div>
    </Modal>
  )
}
