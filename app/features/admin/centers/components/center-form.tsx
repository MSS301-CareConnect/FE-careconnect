import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { invalidateOwnerMedia } from '~/entities/provider/invalidate-provider-media'
import { createCenter, providerKeys, saveCenter } from '~/entities/provider/provider-api'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { describeHours, formatCenterHours, parseCenterHours } from '../center-hours'
import { CENTER_BUSINESS_ERRORS, type CenterBusinessKey } from '../center-errors'

const key = 'admin.centersPage.form' as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** ProviderService `INVALID_PHONE` 4108: 10–15 digits (accounts use 10–11, A-08). */
const PHONE = /^[0-9]{10,15}$/

type Field = 'name' | 'email' | 'phone' | 'address' | 'hours'
type FieldError =
  | 'nameRequired'
  | 'nameTooLong'
  | 'emailRequired'
  | 'emailInvalid'
  | 'emailTaken'
  | 'phoneInvalid'
  | 'addressRequired'
  | 'addressTooLong'
  | 'hoursIncomplete'

const ERROR_MAP = {
  fields: {
    4101: { field: 'email', key: 'emailTaken' },
    4102: { field: 'name', key: 'nameRequired' },
    4103: { field: 'name', key: 'nameTooLong' },
    4104: { field: 'email', key: 'emailRequired' },
    4105: { field: 'email', key: 'emailInvalid' },
    4106: { field: 'address', key: 'addressRequired' },
    4107: { field: 'address', key: 'addressTooLong' },
    4108: { field: 'phone', key: 'phoneInvalid' }
  },
  business: CENTER_BUSINESS_ERRORS
} as const satisfies {
  fields: Record<number, { field: Field; key: FieldError }>
  business: Record<number, CenterBusinessKey>
}

export interface CenterFormProps {
  center?: ProviderCenterRecord
  onSaved: (center: ProviderCenterRecord) => void
  onCancel: () => void
}

/** Creates or edits a center's details; the manager and the status have their own flows on the detail page. */
export function CenterForm({ center, onSaved, onCancel }: CenterFormProps) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const stored = parseCenterHours(center?.operatingHours)
  const [name, setName] = useState(center?.centerName ?? '')
  const [email, setEmail] = useState(center?.email ?? '')
  const [phone, setPhone] = useState(center?.phoneNumber ?? '')
  const [address, setAddress] = useState(center?.address ?? '')
  const [opensAt, setOpensAt] = useState(stored.kind === 'none' || stored.kind === 'legacy' ? '' : stored.open)
  const [closesAt, setClosesAt] = useState(stored.kind === 'none' || stored.kind === 'legacy' ? '' : stored.close)
  const legacy = stored.kind === 'legacy' ? stored.text : ''
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useFormErrors<Field, FieldError, CenterBusinessKey>(ERROR_MAP, formRef)
  const notify = useActionToast()
  const hours = opensAt && closesAt ? describeHours(opensAt, closesAt) : null

  const save = useMutation({
    mutationFn: () => {
      const fields = {
        centerName: name.trim(),
        email: email.trim(),
        address: address.trim(),
        phoneNumber: phone.trim() || undefined,
        operatingHours: opensAt && closesAt ? formatCenterHours(opensAt, closesAt) : legacy || undefined
      }
      return center
        ? saveCenter(center.id, { ...fields, managerUserId: center.managerUserId, version: center.version })
        : createCenter(fields)
    },
    onSuccess: async (saved) => {
      await invalidateOwnerMedia(queryClient, 'CARE_CENTER', saved.id)
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      notify.success(
        t(center ? 'admin.toast.centers.updated' : 'admin.toast.centers.created', { name: saved.centerName })
      )
      onSaved(saved)
    },
    onError: (error) => {
      const action = t(center ? 'admin.toast.centers.actions.update' : 'admin.toast.centers.actions.create')
      if (!notify.systemError(error, action, () => save.mutate())) errors.fromApi(error)
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Partial<Record<Field, FieldError>> = {}
    if (!name.trim()) next.name = 'nameRequired'
    else if (name.trim().length > 255) next.name = 'nameTooLong'
    if (!email.trim()) next.email = 'emailRequired'
    else if (!EMAIL.test(email.trim())) next.email = 'emailInvalid'
    if (phone.trim() && !PHONE.test(phone.trim())) next.phone = 'phoneInvalid'
    if (!address.trim()) next.address = 'addressRequired'
    else if (address.trim().length > 2000) next.address = 'addressTooLong'
    // Only an unfinished pair is wrong; overnight and 24-hour centers are valid (D-04).
    if (Boolean(opensAt) !== Boolean(closesAt)) next.hours = 'hoursIncomplete'
    if (errors.validate(next)) save.mutate()
  }

  function control(field: Field) {
    const error = errors.fieldErrors[field]
    return {
      id: `${id}-${field}`,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `${id}-${field}-error` : undefined,
      className: `${baseControlClass} mt-1`
    }
  }

  function fieldError(field: Field) {
    const error = errors.fieldErrors[field]
    return error ? (
      <p className='mt-1 text-xs font-medium text-error' id={`${id}-${field}-error`}>
        {t(`${key}.errors.${error}`)}
      </p>
    ) : null
  }

  function label(field: Field, text: string, optional = false) {
    return (
      <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-${field}`}>
        {text}
        {optional ? <span className='ml-1 font-normal text-on-surface-variant'>{t(`${key}.optional`)}</span> : null}
      </label>
    )
  }

  const hoursNote =
    hours?.kind === 'overnight'
      ? t(`${key}.overnightNote`, { close: closesAt })
      : hours?.kind === 'allDay'
        ? t(`${key}.allDayNote`)
        : legacy && !opensAt && !closesAt
          ? t(`${key}.legacyHours`, { hours: legacy })
          : t(`${key}.hoursHint`)

  return (
    <form className='grid gap-4 sm:grid-cols-2' noValidate onSubmit={submit} ref={formRef}>
      <div className='sm:col-span-2'>
        {label('name', t(`${key}.name`))}
        <input
          {...control('name')}
          maxLength={255}
          onChange={(event) => {
            setName(event.target.value)
            errors.clearField('name')
          }}
          value={name}
        />
        {fieldError('name')}
      </div>
      <div>
        {label('email', t(`${key}.email`))}
        <input
          {...control('email')}
          onChange={(event) => {
            setEmail(event.target.value)
            errors.clearField('email')
          }}
          type='email'
          value={email}
        />
        {fieldError('email')}
      </div>
      <div>
        {label('phone', t(`${key}.phone`), true)}
        <input
          {...control('phone')}
          inputMode='tel'
          onChange={(event) => {
            setPhone(event.target.value)
            errors.clearField('phone')
          }}
          value={phone}
        />
        {fieldError('phone')}
      </div>
      <div className='sm:col-span-2'>
        {label('address', t(`${key}.address`))}
        <input
          {...control('address')}
          onChange={(event) => {
            setAddress(event.target.value)
            errors.clearField('address')
          }}
          value={address}
        />
        {fieldError('address')}
      </div>
      <fieldset
        aria-describedby={errors.fieldErrors.hours ? `${id}-hours-error` : `${id}-hours-note`}
        className='sm:col-span-2'
      >
        <legend className='text-sm font-semibold text-on-surface'>
          {t(`${key}.hoursLegend`)}
          <span className='ml-1 font-normal text-on-surface-variant'>{t(`${key}.optional`)}</span>
        </legend>
        <div className='mt-1 grid grid-cols-2 gap-3'>
          {(['opensAt', 'closesAt'] as const).map((part) => (
            <label className='text-xs font-medium text-on-surface-variant' key={part}>
              {t(`${key}.${part}`)}
              <input
                aria-invalid={errors.fieldErrors.hours && !(part === 'opensAt' ? opensAt : closesAt) ? true : undefined}
                className={`${baseControlClass} mt-1`}
                id={part === 'opensAt' ? `${id}-hours` : undefined}
                onChange={(event) => {
                  if (part === 'opensAt') setOpensAt(event.target.value)
                  else setClosesAt(event.target.value)
                  errors.clearField('hours')
                }}
                type='time'
                value={part === 'opensAt' ? opensAt : closesAt}
              />
            </label>
          ))}
        </div>
        {errors.fieldErrors.hours ? (
          fieldError('hours')
        ) : (
          <p className='mt-1 text-xs text-on-surface-variant' id={`${id}-hours-note`}>
            {hoursNote}
          </p>
        )}
      </fieldset>
      {errors.failure ? (
        <FormAlert className='sm:col-span-2' tone={errors.failure.kind === 'system' ? 'error' : 'warning'}>
          {t(errors.failure.key)}
        </FormAlert>
      ) : null}
      <div className='flex justify-end gap-2.5 sm:col-span-2'>
        <Button onClick={onCancel} variant='outline'>
          {t(`${key}.cancel`)}
        </Button>
        <Button loading={save.isPending} loadingLabel={t('common.ui.working')} type='submit'>
          {center ? t(`${key}.save`) : t(`${key}.create`)}
        </Button>
      </div>
    </form>
  )
}
