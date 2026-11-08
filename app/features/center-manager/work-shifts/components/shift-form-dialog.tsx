import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  createWorkShift,
  createWorkShiftBatch,
  fetchCaregivers,
  fetchWorkShifts,
  providerKeys,
  saveWorkShift
} from '~/entities/provider/provider-api'
import { shiftStatusLabelKey } from '~/entities/provider/work-shift'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { toastSuccess, toastSystemError } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'

import {
  SHIFT_ERROR_MAP,
  deadlineOf,
  emptyShiftForm,
  repeatDates,
  shiftFormFromRecord,
  toBatchRequest,
  toShiftRequest,
  validateShiftForm,
  vnInstant,
  type ShiftField,
  type ShiftFormMode,
  type ShiftFormValues
} from '../shift-form-model'
import { ShiftFormFields } from './shift-form-fields'
import { ShiftFormSummary } from './shift-form-summary'

const k = 'centerManager.workShifts.form' as const
const HOUR = 3_600_000

/**
 * Create, edit or duplicate a shift in a two-column dialog (form + live summary). The status is chosen by the button
 * (save draft / open sign-up), never by a dropdown. Escape, the close button and "Cancel" ask before throwing away
 * unsaved changes.
 */
export function ShiftFormDialog({
  mode,
  shift,
  centerId,
  today,
  now,
  onClose
}: {
  mode: ShiftFormMode
  shift?: ProviderWorkShiftRecord
  centerId: string
  today: string
  now: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const initial = useMemo(
    () => (shift ? shiftFormFromRecord(shift, mode, today) : emptyShiftForm(today)),
    [shift, mode, today]
  )
  const [values, setValues] = useState<ShiftFormValues>(initial)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const { fieldErrors, failure, validate, clearField, fromApi, reset } = useFormErrors(SHIFT_ERROR_MAP, formRef)
  const dirty = JSON.stringify(values) !== JSON.stringify(initial)
  const editing = mode === 'edit' && shift
  const scheduleLocked = Boolean(editing && (shift.approvedCount ?? 0) > 0)
  const allowRepeat = mode !== 'edit'
  const dates = allowRepeat ? repeatDates(values) : [values.workDate]

  const sameDay = useQuery({
    queryKey: [...providerKeys.shifts(centerId), 'day', values.workDate],
    queryFn: () => fetchWorkShifts({ centerId, fromDate: values.workDate, toDate: values.workDate, size: 100 }),
    enabled: Boolean(centerId && values.workDate && !values.repeat),
    staleTime: 30_000
  })
  const activeCaregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), 'active-count'],
    queryFn: () => fetchCaregivers(centerId, { status: 'ACTIVE', size: 1 }),
    enabled: Boolean(centerId),
    staleTime: 300_000
  })

  const save = useMutation({
    mutationFn: async (status: 'DRAFT' | 'OPEN' | ProviderWorkShiftRecord['shiftStatus']) => {
      if (editing)
        return {
          kind: 'one' as const,
          shift: await saveWorkShift(shift.id, toShiftRequest(values, status, now, shift.version))
        }
      if (values.repeat && dates.length > 1) {
        const created = await createWorkShiftBatch(centerId, toBatchRequest(values, status as 'DRAFT' | 'OPEN', now))
        return { kind: 'many' as const, count: created.length }
      }
      return { kind: 'one' as const, shift: await createWorkShift(centerId, toShiftRequest(values, status, now)) }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.shifts(centerId) })
      if (result.kind === 'many') toastSuccess(t(`${k}.success.createdMany`, { count: result.count }))
      else {
        queryClient.setQueryData(providerKeys.shift(result.shift.id), result.shift)
        toastSuccess(
          t(editing ? `${k}.success.saved` : `${k}.success.created`, { date: format.date(result.shift.workDate) })
        )
      }
      onClose()
    },
    onError: (error, status) => {
      if (
        !toastSystemError(error, {
          message: t(`${k}.systemError`),
          retryLabel: t('centerManager.workShifts.retry'),
          retry: () => save.mutate(status)
        })
      )
        fromApi(error)
    }
  })

  function change(patch: Partial<ShiftFormValues>, field?: ShiftField) {
    setValues((previous) => ({ ...previous, ...patch }))
    if (field) clearField(field)
    if (patch.workDate || patch.startTime || patch.endTime) {
      clearField('workDate')
      clearField('endTime')
      clearField('deadline')
    }
  }

  function submit(status: 'DRAFT' | 'OPEN' | ProviderWorkShiftRecord['shiftStatus']) {
    reset()
    if (!validate(validateShiftForm(values, { now, original: editing ? shift : undefined, mode }))) return
    save.mutate(status)
  }

  function requestClose() {
    if (save.isPending) return false
    if (dirty) {
      setConfirmDiscard(true)
      return false
    }
    return true
  }

  const deadline = values.workDate && values.startTime ? deadlineOf(values, values.workDate, now) : null
  const start = values.workDate && values.startTime ? vnInstant(values.workDate, values.startTime).getTime() : 0
  let deadlineText = deadline ? t(`${k}.deadlineValue`, { value: format.dateTime(deadline.toISOString()) }) : ''
  if (values.deadlineMode !== 'custom' && start) {
    const lead = values.deadlineMode === 'h24' ? 24 : 12
    if (!deadline) deadlineText = t(`${k}.deadlineNone`)
    else if (start - lead * HOUR <= now) deadlineText = `${deadlineText}. ${t(`${k}.deadlineFallback`)}`
  }

  const plannedStatus = editing ? shift.shiftStatus : 'OPEN'
  const many = !editing && values.repeat && dates.length > 1
  const footer = (
    <>
      {failure ? (
        <FormAlert className='mr-auto w-full' tone={failure.kind === 'system' ? 'error' : 'warning'}>
          {t(failure.key)}
        </FormAlert>
      ) : null}
      <Button
        disabled={save.isPending}
        onClick={() => {
          if (requestClose()) onClose()
        }}
        variant='ghost'
      >
        {t(`${k}.actions.cancel`)}
      </Button>
      {!editing || shift.shiftStatus === 'DRAFT' ? (
        <Button disabled={save.isPending} onClick={() => submit('DRAFT')} variant='outline'>
          {t(`${k}.actions.saveDraft`)}
        </Button>
      ) : null}
      <Button
        loading={save.isPending}
        loadingLabel={t('common.ui.working')}
        onClick={() => submit(editing && shift.shiftStatus !== 'DRAFT' ? shift.shiftStatus : 'OPEN')}
      >
        {editing
          ? shift.shiftStatus === 'DRAFT'
            ? t(`${k}.actions.saveAndOpen`)
            : t(`${k}.actions.save`)
          : many
            ? t(`${k}.actions.createMany`, { count: Math.min(dates.length, 31) })
            : t(`${k}.actions.openNow`)}
      </Button>
    </>
  )

  return (
    <>
      <Modal
        beforeClose={requestClose}
        description={t(`${k}.description`)}
        dismissOnBackdrop={false}
        footer={footer}
        maxWidthClass='max-w-5xl'
        onClose={onClose}
        open
        title={t(
          mode === 'edit' ? `${k}.editTitle` : mode === 'duplicate' ? `${k}.duplicateTitle` : `${k}.createTitle`
        )}
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submit(plannedStatus)
          }}
          ref={formRef}
        >
          <ShiftFormFields
            activeCaregivers={activeCaregivers.data?.totalElements}
            allowRepeat={allowRepeat}
            deadlineText={deadlineText}
            errors={fieldErrors}
            onChange={change}
            scheduleLocked={scheduleLocked}
            summary={
              <ShiftFormSummary
                dates={dates}
                deadline={deadline}
                editingId={editing ? shift.id : undefined}
                sameDayShifts={sameDay.data?.items ?? []}
                statusLabel={t(shiftStatusLabelKey(plannedStatus))}
                values={values}
              />
            }
            today={today}
            values={values}
          />
        </form>
      </Modal>
      <ConfirmDialog
        cancelLabel={t('common.ui.keepEditing')}
        confirmLabel={t('common.ui.discard')}
        description={t('common.ui.unsavedDescription')}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false)
          onClose()
        }}
        open={confirmDiscard}
        title={t('common.ui.unsavedTitle')}
        tone='danger'
      />
    </>
  )
}
