import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { UserResponse } from '~/shared/api/generated/contracts'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'

import { accountKeys, provisionAccount } from './account-api'
import { useActionToast } from '~/shared/ui/use-action-toast'

const key = 'admin.identity.form' as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** IdentityService `ProvisionRequest.phoneNumber` pattern. */
const PHONE = /^[0-9]{10,11}$/

export type ProvisionRole = 'CUSTOMER' | 'CENTER_MANAGER'
type Field = 'email' | 'fullName' | 'phone' | 'centerId'
type FieldError =
  | 'emailRequired'
  | 'emailInvalid'
  | 'emailTaken'
  | 'fullNameRequired'
  | 'fullNameTooLong'
  | 'phoneInvalid'
  | 'centerRequired'

/** IdentityService codes that belong to one input of this form. */
const ERROR_MAP = {
  fields: {
    1003: { field: 'email', key: 'emailTaken' },
    1011: { field: 'email', key: 'emailRequired' },
    1015: { field: 'email', key: 'emailInvalid' },
    1010: { field: 'fullName', key: 'fullNameRequired' },
    1017: { field: 'fullName', key: 'fullNameTooLong' },
    1014: { field: 'phone', key: 'phoneInvalid' },
    1100: { field: 'centerId', key: 'centerRequired' }
  }
} as const satisfies { fields: Record<number, { field: Field; key: FieldError }> }

export type CenterOption = { id: string; name: string; note?: string }

export interface ProvisionAccountFormProps {
  /** Roles the administrator may create here, in display order. */
  roles: readonly ProvisionRole[]
  /** Creating the manager of one known center: the center is fixed and not shown as a choice. */
  fixedCenterId?: string
  /** Centers to choose from when the role is CENTER_MANAGER and no center is fixed. */
  centers?: readonly CenterOption[]
  centersHint?: ReactNode
  submitLabel: string
  onCreated: (user: UserResponse, options: { sendCode: boolean }) => void
  onCancel: () => void
}

/**
 * Creates an account without a password through IdentityService `POST /users`. Every field is checked before
 * sending (the backend reports only its first validation error); backend field codes land under their input,
 * other failures at the end of the form.
 */
export function ProvisionAccountForm({
  roles,
  fixedCenterId,
  centers = [],
  centersHint,
  submitLabel,
  onCreated,
  onCancel
}: ProvisionAccountFormProps) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<ProvisionRole>(roles[0] ?? 'CUSTOMER')
  const [centerId, setCenterId] = useState('')
  const [sendCode, setSendCode] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useFormErrors<Field, FieldError>(ERROR_MAP, formRef)
  const needsCenter = role === 'CENTER_MANAGER'
  const notify = useActionToast()

  const create = useMutation({
    mutationFn: () =>
      provisionAccount({
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
        roleCode: role,
        centerId: needsCenter ? fixedCenterId || centerId : undefined
      }),
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: accountKeys.all })
      onCreated(user, { sendCode })
    },
    onError: (error) => {
      if (!notify.systemError(error, t('admin.toast.accounts.actions.create'), () => create.mutate())) {
        errors.fromApi(error)
      }
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Partial<Record<Field, FieldError>> = {}
    if (!email.trim()) next.email = 'emailRequired'
    else if (!EMAIL.test(email.trim())) next.email = 'emailInvalid'
    if (!fullName.trim()) next.fullName = 'fullNameRequired'
    else if (fullName.trim().length > 255) next.fullName = 'fullNameTooLong'
    if (phone.trim() && !PHONE.test(phone.trim())) next.phone = 'phoneInvalid'
    if (needsCenter && !fixedCenterId && !centerId) next.centerId = 'centerRequired'
    if (errors.validate(next)) create.mutate()
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

  function label(field: Field, text: string, optional = false) {
    return (
      <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-${field}`}>
        {text}
        {optional ? <span className='ml-1 font-normal text-on-surface-variant'>{t(`${key}.optional`)}</span> : null}
      </label>
    )
  }

  function error(field: Field) {
    const value = errors.fieldErrors[field]
    return value ? (
      <p className='mt-1 text-xs font-medium text-error' id={`${id}-${field}-error`}>
        {t(`${key}.errors.${value}`)}
      </p>
    ) : null
  }

  return (
    <form className='grid gap-4 sm:grid-cols-2' noValidate onSubmit={submit} ref={formRef}>
      <div>
        {label('email', t(`${key}.email`))}
        <input
          {...control('email')}
          autoComplete='off'
          onChange={(event) => {
            setEmail(event.target.value)
            errors.clearField('email')
          }}
          type='email'
          value={email}
        />
        {error('email')}
      </div>
      <div>
        {label('fullName', t(`${key}.fullName`))}
        <input
          {...control('fullName')}
          maxLength={255}
          onChange={(event) => {
            setFullName(event.target.value)
            errors.clearField('fullName')
          }}
          value={fullName}
        />
        {error('fullName')}
      </div>
      <div>
        {label('phone', t(`${key}.phone`), true)}
        <input
          {...control('phone')}
          inputMode='numeric'
          onChange={(event) => {
            setPhone(event.target.value)
            errors.clearField('phone')
          }}
          value={phone}
        />
        {error('phone')}
      </div>
      {roles.length > 1 ? (
        <div>
          <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-role`}>
            {t(`${key}.role`)}
          </label>
          <select
            className={`${baseControlClass} mt-1`}
            id={`${id}-role`}
            onChange={(event) => {
              setRole(event.target.value as ProvisionRole)
              errors.clearField('centerId')
            }}
            value={role}
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {t(`admin.identity.roles.${item}`)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {needsCenter && !fixedCenterId ? (
        <div className='sm:col-span-2'>
          {label('centerId', t(`${key}.center`))}
          <select
            {...control('centerId')}
            onChange={(event) => {
              setCenterId(event.target.value)
              errors.clearField('centerId')
            }}
            value={centerId}
          >
            <option value=''>{t(`${key}.chooseCenter`)}</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.note ? `${center.name} · ${center.note}` : center.name}
              </option>
            ))}
          </select>
          {error('centerId')}
          {centersHint ? <p className='mt-1 text-xs text-on-surface-variant'>{centersHint}</p> : null}
        </div>
      ) : null}
      <label className='flex items-start gap-2 text-sm text-on-surface sm:col-span-2'>
        <input
          checked={sendCode}
          className='mt-0.5'
          onChange={(event) => setSendCode(event.target.checked)}
          type='checkbox'
        />
        <span>
          {t(`${key}.sendCode`)}
          <span className='block text-xs text-on-surface-variant'>{t(`${key}.sendCodeHint`)}</span>
        </span>
      </label>
      {errors.failure ? (
        <FormAlert className='sm:col-span-2' tone={errors.failure.kind === 'system' ? 'error' : 'warning'}>
          {t(errors.failure.key)}
        </FormAlert>
      ) : null}
      <div className='flex justify-end gap-2.5 sm:col-span-2'>
        <Button onClick={onCancel} variant='outline'>
          {t(`${key}.cancel`)}
        </Button>
        <Button loading={create.isPending} loadingLabel={t('common.ui.working')} type='submit'>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
