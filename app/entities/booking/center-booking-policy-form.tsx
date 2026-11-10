import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { CenterBookingPolicyRecord, CenterBookingPolicyRequest } from '~/shared/api/generated/contracts'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input } from '~/shared/ui/form-field'
import { ErrorState } from '~/shared/ui/state-panels'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { bookingKeys, fetchCenterBookingPolicy, updateCenterBookingPolicyRequest } from './booking-api'
import { formatDateTime } from './booking-format'

const key = 'booking.policy' as const
// BookingService limits (CenterBookingPolicyRequest): durations up to 30 days, check-in windows up to one day.
const MAX_MINUTES = 43_200
const MAX_CHECK_IN_MINUTES = 1_440
const MAX_REMINDERS = 5

type Unit = 'hours' | 'minutes' | 'percent'
type NumberField = Exclude<keyof CenterBookingPolicyRequest, 'remainingPaymentReminderMinutes' | 'version'>
type Field = NumberField | 'remainingPaymentReminderMinutes'
type FieldError =
  | 'required'
  | 'notNumber'
  | 'tooSmall'
  | 'tooLarge'
  | 'wholeMinutes'
  | 'advanceBeforeRemaining'
  | 'afterAboveBefore'
  | 'lateAboveThreshold'
  | 'reminders'
  | 'remindersDuplicate'
  | 'remindersTooMany'
type BusinessKey = 'booking.errors.e5006' | 'booking.errors.e5413' | 'booking.errors.e5414'

interface FieldSpec {
  name: NumberField
  unit: Unit
  // Lower bound in the API unit (minutes or percent).
  min: number
  max: number
}

// Spec §8 groups: advance notice, center / payment deadlines, payments, refunds, check-in window.
const GROUPS: { key: 'advance' | 'deadlines' | 'payment' | 'refund' | 'checkIn'; fields: FieldSpec[] }[] = [
  {
    key: 'advance',
    fields: [
      { name: 'shiftMinAdvanceMinutes', unit: 'hours', min: 0, max: MAX_MINUTES },
      { name: 'recurringMinAdvanceMinutes', unit: 'hours', min: 0, max: MAX_MINUTES },
      { name: 'customMinAdvanceMinutes', unit: 'hours', min: 0, max: MAX_MINUTES }
    ]
  },
  {
    key: 'deadlines',
    fields: [
      { name: 'confirmationTimeoutMinutes', unit: 'hours', min: 1, max: MAX_MINUTES },
      { name: 'assignmentTimeoutMinutes', unit: 'hours', min: 1, max: MAX_MINUTES },
      { name: 'initialPaymentTimeoutMinutes', unit: 'hours', min: 1, max: MAX_MINUTES }
    ]
  },
  {
    key: 'payment',
    fields: [
      { name: 'depositPercent', unit: 'percent', min: 1, max: 100 },
      { name: 'remainingPaymentDueBeforeMinutes', unit: 'hours', min: 0, max: MAX_MINUTES },
      { name: 'overduePaymentForfeitPercent', unit: 'percent', min: 0, max: 100 }
    ]
  },
  {
    key: 'refund',
    fields: [
      { name: 'refundThresholdMinutes', unit: 'hours', min: 0, max: MAX_MINUTES },
      { name: 'refundPercentBeforeThreshold', unit: 'percent', min: 0, max: 100 },
      { name: 'refundPercentAfterThreshold', unit: 'percent', min: 0, max: 100 },
      { name: 'lateCancelNoRefundMinutes', unit: 'hours', min: 0, max: MAX_CHECK_IN_MINUTES }
    ]
  },
  {
    key: 'checkIn',
    fields: [
      { name: 'checkInEarlyMinutes', unit: 'minutes', min: 0, max: MAX_CHECK_IN_MINUTES },
      { name: 'checkInLateMinutes', unit: 'minutes', min: 0, max: MAX_CHECK_IN_MINUTES }
    ]
  }
]
const SPECS = GROUPS.flatMap((group) => group.fields)

const ERROR_MAP = {
  business: { 5006: 'booking.errors.e5006', 5413: 'booking.errors.e5413', 5414: 'booking.errors.e5414' }
} as const satisfies { business: Record<number, BusinessKey> }

type Values = Record<Field, string>

/** Hours are shown without trailing zeros (1.5, 48); the form edits them, the API stores whole minutes. */
function display(minutes: number, unit: Unit) {
  return unit === 'hours' ? String(Number((minutes / 60).toFixed(4))) : String(minutes)
}

function toValues(policy: CenterBookingPolicyRecord): Values {
  const values = {} as Values
  for (const spec of SPECS) values[spec.name] = display(policy[spec.name], spec.unit)
  values.remainingPaymentReminderMinutes = policy.remainingPaymentReminderMinutes
    .map((minutes) => display(minutes, 'hours'))
    .join(', ')
  return values
}

// Accepts the Vietnamese decimal comma as well as the point.
function parseNumber(text: string) {
  const trimmed = text.trim().replace(',', '.')
  if (!trimmed) return { kind: 'empty' as const }
  const value = Number(trimmed)
  return Number.isFinite(value) ? { kind: 'number' as const, value } : { kind: 'invalid' as const }
}

/** Converts one input to the API unit, or the reason it cannot be sent. */
function readField(spec: FieldSpec, text: string): { value?: number; error?: FieldError } {
  const parsed = parseNumber(text)
  if (parsed.kind === 'empty') return { error: 'required' }
  if (parsed.kind === 'invalid') return { error: 'notNumber' }
  const value = spec.unit === 'hours' ? parsed.value * 60 : parsed.value
  if (spec.unit !== 'percent' && Math.abs(value - Math.round(value)) > 1e-6) return { error: 'wholeMinutes' }
  const rounded = spec.unit === 'percent' ? value : Math.round(value)
  if (rounded < spec.min) return { error: 'tooSmall' }
  if (rounded > spec.max) return { error: 'tooLarge' }
  return { value: rounded }
}

function readReminders(text: string): { value?: number[]; error?: FieldError } {
  // Hours before the due time, separated by commas or spaces (72, 48); a fraction uses the point (1.5).
  const parts = text
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
  const minutes: number[] = []
  for (const part of parts) {
    const read = readField({ name: 'remainingPaymentDueBeforeMinutes', unit: 'hours', min: 1, max: MAX_MINUTES }, part)
    if (read.value === undefined) return { error: 'reminders' }
    minutes.push(read.value)
  }
  if (minutes.length > MAX_REMINDERS) return { error: 'remindersTooMany' }
  if (new Set(minutes).size !== minutes.length) return { error: 'remindersDuplicate' }
  return { value: minutes.sort((a, b) => b - a) }
}

/** The request, or the error of every input that cannot be sent (BookingService returns only its first code). */
function validate(values: Values) {
  const errors: Partial<Record<Field, FieldError>> = {}
  const numbers = {} as Record<NumberField, number>
  for (const spec of SPECS) {
    const read = readField(spec, values[spec.name])
    if (read.error) errors[spec.name] = read.error
    else if (read.value !== undefined) numbers[spec.name] = read.value
  }
  const reminders = readReminders(values.remainingPaymentReminderMinutes)
  if (reminders.error) errors.remainingPaymentReminderMinutes = reminders.error
  // Same rules as CenterBookingPolicyServiceImpl.checkConsistency.
  const remainingBefore = numbers.remainingPaymentDueBeforeMinutes
  if (remainingBefore !== undefined) {
    for (const name of ['recurringMinAdvanceMinutes', 'customMinAdvanceMinutes'] as const) {
      if (numbers[name] !== undefined && !errors[name] && numbers[name] <= remainingBefore)
        errors[name] = 'advanceBeforeRemaining'
    }
  }
  if (
    numbers.refundPercentAfterThreshold !== undefined &&
    numbers.refundPercentBeforeThreshold !== undefined &&
    numbers.refundPercentAfterThreshold > numbers.refundPercentBeforeThreshold
  )
    errors.refundPercentAfterThreshold = 'afterAboveBefore'
  // At most the refund cut-off and one day; the generic "too large" text names 720 hours, wrong for this field.
  if (
    errors.lateCancelNoRefundMinutes === 'tooLarge' ||
    (numbers.lateCancelNoRefundMinutes !== undefined &&
      numbers.refundThresholdMinutes !== undefined &&
      numbers.lateCancelNoRefundMinutes > numbers.refundThresholdMinutes)
  )
    errors.lateCancelNoRefundMinutes = 'lateAboveThreshold'
  return { errors, numbers, reminders: reminders.value }
}

/**
 * Combinations that are allowed but leave a booking made at the minimum notice with shorter deadlines than the policy
 * says (spec §8): BookingService cuts every deadline at the payment cut-off and refuses a booking with none left.
 */
function tightCombinations(numbers: Partial<Record<NumberField, number>>) {
  const warnings: { type: 'shift' | 'recurring' | 'custom'; needed: number; available: number }[] = []
  const confirm = numbers.confirmationTimeoutMinutes
  const assign = numbers.assignmentTimeoutMinutes
  const pay = numbers.initialPaymentTimeoutMinutes
  const before = numbers.remainingPaymentDueBeforeMinutes
  if (confirm === undefined || assign === undefined || pay === undefined) return warnings
  if (numbers.shiftMinAdvanceMinutes !== undefined && confirm + pay > numbers.shiftMinAdvanceMinutes)
    warnings.push({ type: 'shift', needed: confirm + pay, available: numbers.shiftMinAdvanceMinutes })
  if (before !== undefined) {
    for (const [type, name] of [
      ['recurring', 'recurringMinAdvanceMinutes'],
      ['custom', 'customMinAdvanceMinutes']
    ] as const) {
      const advance = numbers[name]
      if (advance !== undefined && confirm + assign + pay > advance - before)
        warnings.push({ type, needed: confirm + assign + pay, available: Math.max(0, advance - before) })
    }
  }
  return warnings
}

/** One center's booking policy (spec §8), edited by its manager or an admin; BookingService checks every rule again. */
export function CenterBookingPolicyForm({ centerId }: { centerId: string }) {
  const { t } = useTranslation()
  const policy = useQuery({
    queryKey: bookingKeys.centerPolicy(centerId),
    queryFn: () => fetchCenterBookingPolicy(centerId),
    enabled: Boolean(centerId),
    retry: false
  })
  if (policy.isPending)
    return (
      <p className='text-sm text-on-surface-variant' role='status'>
        {t(`${key}.loading`)}
      </p>
    )
  if (policy.isError) return <ErrorState message={t(`${key}.loadError`)} onRetry={() => void policy.refetch()} />
  // A saved policy remounts the editor so the inputs show the stored values and the new version.
  return <PolicyEditor key={`${centerId}-${policy.data.version ?? 'default'}`} policy={policy.data} />
}

function PolicyEditor({ policy }: { policy: CenterBookingPolicyRecord }) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const notify = useActionToast()
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useFormErrors<Field, FieldError, BusinessKey>(ERROR_MAP, formRef)
  const [values, setValues] = useState<Values>(() => toValues(policy))
  const hours = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const warnings = tightCombinations(validate(values).numbers)

  const save = useMutation({
    mutationFn: (request: CenterBookingPolicyRequest) => updateCenterBookingPolicyRequest(policy.centerId, request),
    onSuccess: (saved) => {
      queryClient.setQueryData(bookingKeys.centerPolicy(policy.centerId), saved)
      notify.success(t(`${key}.saved`))
    },
    onError: (error, request) => {
      if (!notify.systemError(error, t(`${key}.saveAction`), () => save.mutate(request))) errors.fromApi(error)
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    const result = validate(values)
    if (!errors.validate(result.errors) || !result.reminders) return
    save.mutate({
      ...result.numbers,
      remainingPaymentReminderMinutes: result.reminders,
      // No own policy yet → null; otherwise the version that was read (409 5006 when someone saved in between).
      version: policy.customized ? policy.version : undefined
    })
  }

  function change(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    errors.clearField(field)
  }

  function errorText(field: Field) {
    const error = errors.fieldErrors[field]
    return error ? t(`${key}.errors.${error}`) : undefined
  }

  return (
    <form className='flex flex-col gap-6' noValidate onSubmit={submit} ref={formRef}>
      <p className='rounded-2xl bg-mint-50 px-5 py-3.5 text-sm text-forest-800 ring-1 ring-mint-100'>
        {policy.customized && policy.updatedAt
          ? t(`${key}.customized`, { time: formatDateTime(policy.updatedAt, i18n.language) })
          : t(`${key}.defaultInUse`)}
      </p>
      {GROUPS.map((group) => (
        <fieldset
          className='rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'
          key={group.key}
        >
          <legend className='px-1 text-lg font-bold tracking-tight text-forest-950'>
            {t(`${key}.groups.${group.key}`)}
          </legend>
          <p className='mt-1 text-xs leading-5 text-on-surface-variant'>{t(`${key}.groupHints.${group.key}`)}</p>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {group.fields.map((spec) => (
              <FormField
                error={errorText(spec.name)}
                hint={t(`${key}.units.${spec.unit}`)}
                id={`${id}-${spec.name}`}
                key={spec.name}
                label={t(`${key}.fields.${spec.name}`)}
              >
                {(control) => (
                  <Input
                    {...control}
                    inputMode='decimal'
                    onChange={(event) => change(spec.name, event.target.value)}
                    value={values[spec.name]}
                  />
                )}
              </FormField>
            ))}
            {group.key === 'payment' ? (
              <FormField
                error={errorText('remainingPaymentReminderMinutes')}
                hint={t(`${key}.remindersHint`)}
                id={`${id}-reminders`}
                label={t(`${key}.fields.remainingPaymentReminderMinutes`)}
              >
                {(control) => (
                  <Input
                    {...control}
                    onChange={(event) => change('remainingPaymentReminderMinutes', event.target.value)}
                    value={values.remainingPaymentReminderMinutes}
                  />
                )}
              </FormField>
            ) : null}
          </div>
          {group.key === 'checkIn' ? (
            <p className='mt-3 text-xs leading-5 text-on-surface-variant'>{t(`${key}.checkInApplies`)}</p>
          ) : null}
        </fieldset>
      ))}
      {warnings.length > 0 ? (
        <div
          className='rounded-2xl border border-peach-200 bg-peach-50 px-5 py-3.5 text-sm text-peach-700'
          role='status'
        >
          <p className='font-semibold'>{t(`${key}.tightTitle`)}</p>
          <ul className='mt-1 list-disc space-y-1 pl-5'>
            {warnings.map((warning) => (
              <li key={warning.type}>
                {t(`${key}.tight.${warning.type}`, {
                  needed: hours.format(warning.needed / 60),
                  available: hours.format(warning.available / 60)
                })}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {errors.failure ? (
        <FormAlert tone={errors.failure.kind === 'system' ? 'error' : 'warning'}>{t(errors.failure.key)}</FormAlert>
      ) : null}
      <div className='flex justify-end'>
        <Button loading={save.isPending} loadingLabel={t('common.ui.working')} type='submit'>
          {t(`${key}.save`)}
        </Button>
      </div>
    </form>
  )
}
