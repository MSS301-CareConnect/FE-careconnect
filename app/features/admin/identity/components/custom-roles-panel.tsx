import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { classifyApiError } from '~/shared/api/api-error'
import type { PermissionRecord, RoleRecord } from '~/shared/api/generated/contracts'
import { bentoCard } from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { removeRole, roleKeys, saveRolePermissions } from '../identity-api'
import { EditRoleDialog } from './edit-role-dialog'
import { PermissionText } from './permission-text'

const key = 'admin.identity.rolesPage' as const
const DELETE_ERRORS = { business: { 1120: 'admin.identity.rolesPage.business.inUse' } } as const

/**
 * Custom roles: the list on the left, the chosen role's permissions on the right with rename / delete on its header.
 * Saving replaces the role's whole permission set after a confirmation; deleting is refused by IdentityService (1120)
 * while an account still holds the role.
 */
export function CustomRolesPanel({
  roles,
  permissions,
  canManage,
  selectedId,
  onSelect
}: {
  roles: RoleRecord[]
  permissions: PermissionRecord[]
  canManage: boolean
  selectedId: string
  onSelect: (roleId: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const notify = useActionToast()
  // The unsaved choice belongs to one role: choosing another role (or creating one) drops it.
  const [draft, setDraft] = useState<{ roleId: string; ids: string[] } | null>(null)
  const edited = draft?.roleId === selectedId ? draft.ids : null
  const setEdited = (ids: string[] | null) => setDraft(ids ? { roleId: selectedId, ids } : null)
  const [dialog, setDialog] = useState<'save' | 'edit' | 'delete' | null>(null)
  const selected = roles.find((role) => role.id === selectedId)
  const name = selected?.roleName ?? selected?.roleCode ?? ''
  const selectedPermissionIds =
    edited ??
    permissions
      .filter((permission) => selected?.permissions?.includes(permission.permissionCode ?? ''))
      .map((permission) => permission.id!)

  const save = useMutation({
    mutationFn: () => saveRolePermissions(selectedId, { permissionIds: selectedPermissionIds }),
    onSuccess: async () => {
      setDialog(null)
      setEdited(null)
      notify.success(t('admin.toast.roles.saved', { name }))
      await queryClient.invalidateQueries({ queryKey: roleKeys.roles })
    },
    onError: (error) => {
      setDialog(null)
      notify.systemError(error, t('admin.toast.roles.actions.save'), () => save.mutate())
    }
  })
  const remove = useMutation({
    mutationFn: () => removeRole(selectedId),
    onSuccess: async () => {
      setDialog(null)
      notify.success(t('admin.toast.roles.deleted', { name }))
      onSelect('')
      await queryClient.invalidateQueries({ queryKey: roleKeys.roles })
    },
    onError: (error) => {
      if (notify.systemError(error, t('admin.toast.roles.actions.delete'), () => remove.mutate())) setDialog(null)
    }
  })
  const classifiedSave = save.error ? classifyApiError(save.error) : null
  const saveFailure = classifiedSave?.kind === 'business' ? classifiedSave : null
  const removeFailure = remove.error ? classifyApiError(remove.error, DELETE_ERRORS) : null

  function choose(roleId: string) {
    onSelect(roleId)
    save.reset()
  }

  return (
    <section className={`${bentoCard} space-y-4 p-5 sm:p-6`}>
      <div>
        <h2 className='text-lg font-bold tracking-tight text-forest-950'>{t(`${key}.customTitle`)}</h2>
        <p className='mt-2 flex items-start gap-2 rounded-xl bg-peach-50 px-3.5 py-2.5 text-sm text-peach-700 ring-1 ring-peach-200'>
          <Icon className='mt-0.5 text-lg' name='info' />
          {t(`${key}.customWarning`)}
        </p>
      </div>
      {roles.length === 0 ? (
        <p className='rounded-xl bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant'>
          {t(`${key}.noCustom`)}
        </p>
      ) : (
        <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'>
          <ul className='flex flex-col gap-2'>
            {roles.map((role) => (
              <li key={role.id}>
                <button
                  aria-pressed={role.id === selectedId}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${role.id === selectedId ? 'border-forest-900 bg-mint-50' : 'border-outline-variant/50 bg-white hover:bg-surface-container-low'}`}
                  onClick={() => choose(role.id ?? '')}
                  type='button'
                >
                  <span
                    aria-hidden='true'
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${role.id === selectedId ? 'bg-forest-900 text-mint-300' : 'bg-mint-50 text-forest-800'}`}
                  >
                    <Icon className='text-xl' name='badge' />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <strong className='flex flex-wrap items-center gap-2 text-on-surface'>
                      {role.roleName ?? role.roleCode}
                      {role.active === false ? <StatusBadge tone='neutral'>{t(`${key}.inactive`)}</StatusBadge> : null}
                    </strong>
                    <span className='block text-xs text-on-surface-variant'>
                      {role.description || t(`${key}.noDescription`)}
                    </span>
                  </span>
                  <span className='shrink-0 rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface-variant tabular-nums'>
                    {t(`${key}.permissionCount`, { count: role.permissions?.length ?? 0 })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <div className='space-y-3 rounded-2xl border border-outline-variant/50 p-4 sm:p-5'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h3 className='font-bold text-forest-950'>{t(`${key}.permissionsOf`, { role: name })}</h3>
                {canManage ? (
                  <span className='flex items-center gap-1'>
                    <Button
                      leftIcon={<Icon className='text-lg' name='edit' />}
                      onClick={() => setDialog('edit')}
                      size='sm'
                      variant='ghost'
                    >
                      {t(`${key}.edit`)}
                    </Button>
                    <Button
                      className='text-error! hover:bg-error-container/50!'
                      leftIcon={<Icon className='text-lg' name='delete' />}
                      onClick={() => {
                        remove.reset()
                        setDialog('delete')
                      }}
                      size='sm'
                      variant='ghost'
                    >
                      {t(`${key}.delete`)}
                    </Button>
                  </span>
                ) : null}
              </div>
              <div className='space-y-2'>
                {permissions.map((permission) => {
                  const checked = selectedPermissionIds.includes(permission.id!)
                  return (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${checked ? 'border-mint-300 bg-mint-50' : 'border-transparent bg-surface-container-low hover:bg-mint-50/60'}`}
                      key={permission.id}
                    >
                      <input
                        checked={checked}
                        className='mt-1 accent-primary'
                        disabled={!canManage}
                        onChange={(event) =>
                          setEdited(
                            event.target.checked
                              ? [...selectedPermissionIds, permission.id!]
                              : selectedPermissionIds.filter((item) => item !== permission.id)
                          )
                        }
                        type='checkbox'
                      />
                      <PermissionText permission={permission} />
                    </label>
                  )
                })}
              </div>
              {saveFailure ? <FormAlert tone='warning'>{t(saveFailure.key)}</FormAlert> : null}
              {canManage ? (
                <div className='flex items-center justify-end gap-2'>
                  <Button disabled={edited === null} onClick={() => setEdited(null)} size='sm' variant='outline'>
                    {t(`${key}.discard`)}
                  </Button>
                  <Button disabled={edited === null} onClick={() => setDialog('save')} size='sm'>
                    {t(`${key}.save`)}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className='rounded-2xl border border-dashed border-outline-variant px-4 py-10 text-center text-sm text-on-surface-variant'>
              {t(`${key}.chooseRole`)}
            </p>
          )}
        </div>
      )}
      <ConfirmDialog
        confirmLabel={t(`${key}.save`)}
        description={t(`${key}.confirmSave`)}
        loading={save.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => save.mutate()}
        open={dialog === 'save'}
        title={t(`${key}.confirmTitle`, { role: name })}
        tone='primary'
      />
      <ConfirmDialog
        confirmLabel={t(`${key}.delete`)}
        description={t(`${key}.deleteDescription`)}
        error={removeFailure && removeFailure.kind === 'business' ? t(removeFailure.key) : undefined}
        loading={remove.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => remove.mutate()}
        open={dialog === 'delete'}
        title={t(`${key}.deleteTitle`, { role: name })}
        tone='danger'
      />
      {dialog === 'edit' && selected ? <EditRoleDialog onClose={() => setDialog(null)} role={selected} /> : null}
    </section>
  )
}
