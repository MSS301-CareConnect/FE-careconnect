import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { RoleRecord } from '~/shared/api/generated/contracts'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Textarea } from '~/shared/ui/form-field'
import { Modal } from '~/shared/ui/modal'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { roleKeys, saveRole } from '../identity-api'

const key = 'admin.identity.rolesPage.form' as const
type Field = 'roleName'
type FieldError = 'nameRequired'

const ERROR_MAP = {
  fields: { 1109: { field: 'roleName', key: 'nameRequired' } }
} as const satisfies { fields: Record<number, { field: Field; key: FieldError }> }

/** Renames a custom role, edits its description or stops it granting anything; the role code never changes. */
export function EditRoleDialog({ role, onClose }: { role: RoleRecord; onClose: () => void }) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const notify = useActionToast()
  const [roleName, setRoleName] = useState(role.roleName ?? '')
  const [description, setDescription] = useState(role.description ?? '')
  const [active, setActive] = useState(role.active !== false)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useFormErrors<Field, FieldError>(ERROR_MAP, formRef)
  const save = useMutation({
    mutationFn: () =>
      saveRole(role.id ?? '', { roleName: roleName.trim(), description: description.trim() || undefined, active }),
    onSuccess: async (saved) => {
      notify.success(t('admin.toast.roles.updated', { name: saved.roleName ?? roleName.trim() }))
      await queryClient.invalidateQueries({ queryKey: roleKeys.roles })
      onClose()
    },
    onError: (error) => {
      if (!notify.systemError(error, t('admin.toast.roles.actions.update'), () => save.mutate())) errors.fromApi(error)
    }
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (errors.validate(roleName.trim() ? {} : { roleName: 'nameRequired' })) save.mutate()
  }

  return (
    <Modal
      description={t(`${key}.editHint`, { code: role.roleCode ?? '' })}
      dismissOnBackdrop={false}
      onClose={onClose}
      open
      title={t(`${key}.editTitle`)}
    >
      <form className='space-y-4' noValidate onSubmit={submit} ref={formRef}>
        <FormField
          error={errors.fieldErrors.roleName ? t(`${key}.errors.${errors.fieldErrors.roleName}`) : undefined}
          id={`${id}-roleName`}
          label={t(`${key}.roleName`)}
        >
          {(control) => (
            <Input
              {...control}
              onChange={(event) => {
                setRoleName(event.target.value)
                errors.clearField('roleName')
              }}
              value={roleName}
            />
          )}
        </FormField>
        <FormField hint={t(`${key}.descriptionHint`)} id={`${id}-description`} label={t(`${key}.description`)}>
          {(control) => (
            <Textarea
              {...control}
              className='min-h-20'
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          )}
        </FormField>
        <label className='flex cursor-pointer items-start gap-3 rounded-xl bg-surface-container-low p-3.5'>
          <input
            checked={active}
            className='mt-1 accent-primary'
            onChange={(event) => setActive(event.target.checked)}
            type='checkbox'
          />
          <span>
            <strong className='block text-sm text-on-surface'>{t(`${key}.active`)}</strong>
            <span className='block text-xs leading-5 text-on-surface-variant'>{t(`${key}.activeHint`)}</span>
          </span>
        </label>
        {errors.failure ? (
          <FormAlert tone={errors.failure.kind === 'system' ? 'error' : 'warning'}>{t(errors.failure.key)}</FormAlert>
        ) : null}
        <div className='flex justify-end gap-2.5'>
          <Button onClick={onClose} variant='outline'>
            {t(`${key}.cancel`)}
          </Button>
          <Button loading={save.isPending} loadingLabel={t('common.ui.working')} type='submit'>
            {t(`${key}.saveEdit`)}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
