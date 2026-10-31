import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { accountKeys } from '~/entities/identity/account-api'
import type { UserResponse } from '~/shared/api/generated/contracts'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'

import { saveUser } from '../identity-api'
import { useActionToast } from '~/shared/ui/use-action-toast'

const key = 'admin.identity.detail' as const
type Field = 'fullName' | 'phone'
type FieldError = 'fullNameRequired' | 'fullNameTooLong' | 'phoneInvalid'

const ERROR_MAP = {
  fields: {
    1010: { field: 'fullName', key: 'fullNameRequired' },
    1017: { field: 'fullName', key: 'fullNameTooLong' },
    1014: { field: 'phone', key: 'phoneInvalid' }
  }
} as const satisfies { fields: Record<number, { field: Field; key: FieldError }> }

/** Name and phone of a managed account (`PUT /users/{id}`); the email cannot change. */
export function AccountProfileForm({ user }: { user: UserResponse }) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [phone, setPhone] = useState(user.phoneNumber ?? '')
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useFormErrors<Field, FieldError>(ERROR_MAP, formRef)
  const notify = useActionToast()
  const save = useMutation({
    mutationFn: () => saveUser(user.id!, { fullName: fullName.trim(), phoneNumber: phone.trim() || undefined }),
    onSuccess: async () => {
      notify.success(t('admin.toast.accounts.saved', { name: fullName.trim() }))
      await queryClient.invalidateQueries({ queryKey: accountKeys.all })
      await queryClient.invalidateQueries({ queryKey: accountKeys.detail(user.id!) })
    },
    onError: (error) => {
      if (!notify.systemError(error, t('admin.toast.accounts.actions.save'), () => save.mutate())) {
        errors.fromApi(error)
      }
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Partial<Record<Field, FieldError>> = {}
    if (!fullName.trim()) next.fullName = 'fullNameRequired'
    else if (fullName.trim().length > 255) next.fullName = 'fullNameTooLong'
    if (phone.trim() && !/^[0-9]{10,11}$/.test(phone.trim())) next.phone = 'phoneInvalid'
    if (errors.validate(next)) save.mutate()
  }

  function input(field: Field, value: string, onChange: (value: string) => void) {
    const error = errors.fieldErrors[field]
    return (
      <div>
        <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-${field}`}>
          {t(field === 'fullName' ? `${key}.fullName` : `${key}.phone`)}
        </label>
        <input
          aria-describedby={error ? `${id}-${field}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className={`${baseControlClass} mt-1`}
          id={`${id}-${field}`}
          inputMode={field === 'phone' ? 'numeric' : undefined}
          maxLength={field === 'fullName' ? 255 : undefined}
          onChange={(event) => {
            onChange(event.target.value)
            errors.clearField(field)
          }}
          value={value}
        />
        {error ? (
          <p className='mt-1 text-xs font-medium text-error' id={`${id}-${field}-error`}>
            {t(`${key}.errors.${error}`)}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form className='grid gap-4 sm:grid-cols-2' noValidate onSubmit={submit} ref={formRef}>
      {input('fullName', fullName, setFullName)}
      {input('phone', phone, setPhone)}
      {errors.failure ? (
        <FormAlert className='sm:col-span-2' tone={errors.failure.kind === 'system' ? 'error' : 'warning'}>
          {t(errors.failure.key)}
        </FormAlert>
      ) : null}
      <div className='flex flex-wrap items-center gap-3 sm:col-span-2'>
        <Button loading={save.isPending} loadingLabel={t('common.ui.working')} size='sm' type='submit'>
          {t(`${key}.save`)}
        </Button>
      </div>
    </form>
  )
}
