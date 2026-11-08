import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { RoleRecord } from '~/shared/api/generated/contracts'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'
import { Modal } from '~/shared/ui/modal'

import { addRole, roleKeys } from '../identity-api'
import { useActionToast } from '~/shared/ui/use-action-toast'

const key = 'admin.identity.rolesPage.form' as const
const ROLE_CODE = /^[A-Z][A-Z0-9_]{1,63}$/
type Field = 'roleCode' | 'roleName'
type FieldError = 'codeRequired' | 'codeInvalid' | 'codeTaken' | 'nameRequired'

const ERROR_MAP = {
  fields: {
    1108: { field: 'roleCode', key: 'codeRequired' },
    1101: { field: 'roleCode', key: 'codeInvalid' },
    1102: { field: 'roleCode', key: 'codeTaken' },
    1109: { field: 'roleName', key: 'nameRequired' }
  }
} as const satisfies { fields: Record<number, { field: Field; key: FieldError }> }

export function CreateRoleDialog({
  onClose,
  onCreated
}: {
  onClose: () => void
  onCreated: (role: RoleRecord) => void
}) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useFormErrors<Field, FieldError>(ERROR_MAP, formRef)
  const notify = useActionToast()
  const create = useMutation({
    mutationFn: () =>
      addRole({ roleCode: roleCode.trim(), roleName: roleName.trim(), description: description.trim() || undefined }),
    onSuccess: async (role) => {
      notify.success(t('admin.toast.roles.created', { name: role.roleName ?? roleName.trim() }))
      await queryClient.invalidateQueries({ queryKey: roleKeys.roles })
      onCreated(role)
    },
    onError: (error) => {
      if (!notify.systemError(error, t('admin.toast.roles.actions.create'), () => create.mutate())) {
        errors.fromApi(error)
      }
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Partial<Record<Field, FieldError>> = {}
    if (!roleCode.trim()) next.roleCode = 'codeRequired'
    else if (!ROLE_CODE.test(roleCode.trim())) next.roleCode = 'codeInvalid'
    if (!roleName.trim()) next.roleName = 'nameRequired'
    if (errors.validate(next)) create.mutate()
  }

  function described(field: Field, hint?: boolean) {
    const error = errors.fieldErrors[field]
    return {
      id: `${id}-${field}`,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `${id}-${field}-error` : hint ? `${id}-${field}-hint` : undefined
    }
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
    <Modal description={t(`${key}.hint`)} onClose={onClose} open title={t(`${key}.title`)}>
      <form className='space-y-4' noValidate onSubmit={submit} ref={formRef}>
        <div>
          <label className='text-sm font-semibold' htmlFor={`${id}-roleCode`}>
            {t(`${key}.roleCode`)}
          </label>
          <input
            {...described('roleCode', true)}
            className={`${baseControlClass} mt-1 font-mono uppercase`}
            maxLength={64}
            onChange={(event) => {
              setRoleCode(event.target.value.toUpperCase())
              errors.clearField('roleCode')
            }}
            value={roleCode}
          />
          {errors.fieldErrors.roleCode ? (
            error('roleCode')
          ) : (
            <p className='mt-1 text-xs text-on-surface-variant' id={`${id}-roleCode-hint`}>
              {t(`${key}.roleCodeHint`)}
            </p>
          )}
        </div>
        <div>
          <label className='text-sm font-semibold' htmlFor={`${id}-roleName`}>
            {t(`${key}.roleName`)}
          </label>
          <input
            {...described('roleName')}
            className={`${baseControlClass} mt-1`}
            onChange={(event) => {
              setRoleName(event.target.value)
              errors.clearField('roleName')
            }}
            value={roleName}
          />
          {error('roleName')}
        </div>
        <div>
          <label className='text-sm font-semibold' htmlFor={`${id}-description`}>
            {t(`${key}.description`)}
          </label>
          <textarea
            aria-describedby={`${id}-description-hint`}
            className={`${baseControlClass} mt-1 min-h-20`}
            id={`${id}-description`}
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
          <p className='mt-1 text-xs text-on-surface-variant' id={`${id}-description-hint`}>
            {t(`${key}.descriptionHint`)}
          </p>
        </div>
        {errors.failure ? (
          <FormAlert tone={errors.failure.kind === 'system' ? 'error' : 'warning'}>{t(errors.failure.key)}</FormAlert>
        ) : null}
        <div className='flex justify-end gap-2.5'>
          <Button onClick={onClose} variant='outline'>
            {t(`${key}.cancel`)}
          </Button>
          <Button loading={create.isPending} loadingLabel={t('common.ui.working')} type='submit'>
            {t(`${key}.submit`)}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
