import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { accountKeys, changeAccountStatus, fetchAccount, fetchAccounts } from '~/entities/identity/account-api'
import { PasswordResetPanel } from '~/entities/identity/password-reset-panel'
import { ProvisionAccountForm } from '~/entities/identity/provision-account-form'
import { providerKeys, saveCenter } from '~/entities/provider/provider-api'
import type { ProviderCenterRecord, UserResponse } from '~/shared/api/generated/contracts'
import { classifyApiError } from '~/shared/api/api-error'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { FormAlert } from '~/shared/ui/form-alert'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'

import { CENTER_BUSINESS_ERRORS } from '../center-errors'

const key = 'admin.centersPage.manager' as const
const LINK_ERRORS = { business: CENTER_BUSINESS_ERRORS } as const

/** ProviderService's PUT replaces every field, so linking a manager resends the center as it is (H-12 order). */
function linkManager(center: ProviderCenterRecord, managerUserId: string) {
  return saveCenter(center.id, {
    centerName: center.centerName,
    email: center.email ?? '',
    address: center.address ?? '',
    phoneNumber: center.phoneNumber || undefined,
    operatingHours: center.operatingHours || undefined,
    managerUserId,
    version: center.version
  })
}

function useLinkManager(center: ProviderCenterRecord) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (managerUserId: string) => linkManager(center, managerUserId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: providerKeys.center(center.id) })
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
    }
  })
}

/** Create a manager for this center without leaving the page: account → link → password code (U-03). */
function CreateManagerDialog({ center, onClose }: { center: ProviderCenterRecord; onClose: () => void }) {
  const { t } = useTranslation()
  const [created, setCreated] = useState<{ user: UserResponse; sendCode: boolean } | null>(null)
  const link = useLinkManager(center)
  const failure = link.error ? classifyApiError(link.error, LINK_ERRORS) : null

  return (
    <Modal
      description={created ? undefined : t(`${key}.createHint`, { center: center.centerName })}
      maxWidthClass='max-w-3xl'
      onClose={onClose}
      open
      title={t(`${key}.createTitle`)}
    >
      {!created ? (
        <ProvisionAccountForm
          fixedCenterId={center.id}
          onCancel={onClose}
          onCreated={(user, options) => {
            setCreated({ user, sendCode: options.sendCode })
            link.mutate(user.id!)
          }}
          roles={['CENTER_MANAGER']}
          submitLabel={t(`${key}.create`)}
        />
      ) : (
        <div className='space-y-5'>
          {link.isPending ? (
            <p className='text-sm text-on-surface-variant' role='status'>
              {t(`${key}.linking`)}
            </p>
          ) : null}
          {link.isSuccess ? (
            <p
              className='flex items-center gap-2 rounded-xl bg-success-container px-3 py-2 text-sm text-on-success-container'
              role='status'
            >
              <Icon className='text-lg' name='check_circle' />
              {t(`${key}.linked`, { name: created.user.fullName ?? created.user.email ?? '' })}
            </p>
          ) : null}
          {link.isError && failure && failure.kind !== 'field' ? (
            <FormAlert
              actionLabel={t(`${key}.retryLink`)}
              onAction={() => link.mutate(created.user.id!)}
              tone={failure.kind === 'system' ? 'error' : 'warning'}
            >
              {t(`${key}.linkFailed`)} {t(failure.key)}
            </FormAlert>
          ) : null}
          <PasswordResetPanel
            className='border-t border-outline-variant/40 pt-5'
            email={created.user.email ?? ''}
            mode='new'
            name={created.user.fullName ?? created.user.email ?? ''}
            sendOnOpen={created.sendCode}
          />
          <div className='flex justify-end border-t border-outline-variant/40 pt-4'>
            <Button onClick={onClose}>{t(`${key}.done`)}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/** Pick one of this center's active manager accounts; replacing someone can lock the previous account (A-12). */
function ChooseManagerDialog({
  center,
  current,
  onClose
}: {
  center: ProviderCenterRecord
  current?: UserResponse
  onClose: () => void
}) {
  const { t } = useTranslation()
  const id = useId()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState('')
  const [missing, setMissing] = useState(false)
  const [lockOld, setLockOld] = useState(Boolean(current))
  const [oldLockFailed, setOldLockFailed] = useState(false)
  const params = { role: 'CENTER_MANAGER', status: 'ACTIVE', centerId: center.id, page: 0, size: 100 } as const
  const candidates = useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => fetchAccounts(params),
    retry: false
  })
  const options = (candidates.data?.content ?? []).filter((user) => user.id !== center.managerUserId)
  const link = useLinkManager(center)
  const failure = link.error ? classifyApiError(link.error, LINK_ERRORS) : null

  /** Resolves true only when the new manager is linked. */
  async function submit() {
    if (!selected) {
      setMissing(true)
      return false
    }
    return link
      .mutateAsync(selected)
      .then(() => true)
      .catch(() => false)
  }

  // Lock the previous manager only after the new one is linked.
  const locked = useMutation({
    mutationFn: () =>
      changeAccountStatus(current!.id!, 'LOCKED', t(`${key}.lockReasonDefault`, { center: center.centerName })),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
    onError: () => setOldLockFailed(true)
  })

  return (
    <Modal
      description={t(`${key}.chooseHint`)}
      footer={
        link.isSuccess ? (
          <Button onClick={onClose}>{t(`${key}.done`)}</Button>
        ) : (
          <>
            <Button onClick={onClose} variant='outline'>
              {t('admin.centersPage.form.cancel')}
            </Button>
            <Button
              loading={link.isPending || locked.isPending}
              loadingLabel={t('common.ui.working')}
              onClick={() =>
                void submit().then((linked) => {
                  if (linked && current?.id && lockOld) locked.mutate()
                })
              }
            >
              {t(`${key}.assign`)}
            </Button>
          </>
        )
      }
      onClose={onClose}
      open
      title={current ? t(`${key}.change`) : t(`${key}.chooseTitle`)}
    >
      {link.isSuccess ? (
        <div className='space-y-3'>
          <p className='flex items-center gap-2 text-sm text-on-surface' role='status'>
            <Icon className='text-lg text-primary' name='check_circle' />
            {t(`${key}.linked`, {
              name: options.find((user) => user.id === selected)?.fullName ?? ''
            })}
          </p>
          {oldLockFailed ? <FormAlert tone='warning'>{t(`${key}.oldLockFailed`)}</FormAlert> : null}
        </div>
      ) : (
        <div className='space-y-4'>
          {candidates.isSuccess && options.length === 0 ? (
            <p className='rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant'>
              {t(`${key}.chooseEmpty`)}
            </p>
          ) : (
            <div>
              <label className='text-sm font-semibold' htmlFor={`${id}-manager`}>
                {t(`${key}.account`)}
              </label>
              <select
                aria-describedby={missing ? `${id}-manager-error` : undefined}
                aria-invalid={missing ? true : undefined}
                className={`${baseControlClass} mt-1`}
                disabled={!candidates.isSuccess}
                id={`${id}-manager`}
                onChange={(event) => {
                  setSelected(event.target.value)
                  setMissing(false)
                }}
                value={selected}
              >
                <option value=''>{candidates.isPending ? t(`${key}.loading`) : t(`${key}.choosePlaceholder`)}</option>
                {options.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} · {user.email}
                  </option>
                ))}
              </select>
              {missing ? (
                <p className='mt-1 text-xs font-medium text-error' id={`${id}-manager-error`}>
                  {t(`${key}.errors.chooseRequired`)}
                </p>
              ) : null}
            </div>
          )}
          {current ? (
            <label className='flex items-start gap-2 text-sm'>
              <input
                checked={lockOld}
                className='mt-0.5'
                onChange={(event) => setLockOld(event.target.checked)}
                type='checkbox'
              />
              <span>
                {t(`${key}.lockOld`, { name: current.fullName ?? current.email ?? '' })}
                <span className='block text-xs text-on-surface-variant'>{t(`${key}.lockOldHint`)}</span>
              </span>
            </label>
          ) : null}
          {failure && failure.kind !== 'field' ? (
            <FormAlert tone={failure.kind === 'system' ? 'error' : 'warning'}>{t(failure.key)}</FormAlert>
          ) : null}
        </div>
      )}
    </Modal>
  )
}

/** The center's manager: who it is, or how to get one — all on the center page. */
export function CenterManagerPanel({ center, editable }: { center: ProviderCenterRecord; editable: boolean }) {
  const { t } = useTranslation()
  const [dialog, setDialog] = useState<'create' | 'choose' | null>(null)
  const manager = useQuery({
    queryKey: accountKeys.detail(center.managerUserId ?? ''),
    queryFn: () => fetchAccount(center.managerUserId!),
    enabled: Boolean(center.managerUserId),
    retry: false
  })
  const usable = manager.data?.status === 'ACTIVE' && Boolean(manager.data.roles?.includes('CENTER_MANAGER'))

  return (
    <section aria-labelledby='center-manager-title' className='space-y-3'>
      <h3 className='font-bold text-on-surface' id='center-manager-title'>
        {t(`${key}.title`)}
      </h3>
      {!center.managerUserId ? (
        <p className='rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant'>{t(`${key}.none`)}</p>
      ) : manager.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : manager.data ? (
        <div className='flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-3'>
          <Avatar className='h-10 w-10 rounded-full' name={manager.data.fullName ?? ''} />
          <div className='min-w-0 flex-1 text-sm'>
            <p className='font-semibold text-on-surface'>{manager.data.fullName}</p>
            <p className='truncate text-on-surface-variant'>
              {manager.data.email}
              {manager.data.phoneNumber ? ` · ${manager.data.phoneNumber}` : ''}
            </p>
          </div>
          <StatusBadge dot tone={usable ? 'success' : 'error'}>
            {t(`admin.identity.status.${manager.data.status ?? 'ACTIVE'}`)}
          </StatusBadge>
        </div>
      ) : null}
      {center.managerUserId && manager.isSuccess && !usable ? (
        <FormAlert tone='warning'>{t(`${key}.inactive`)}</FormAlert>
      ) : null}
      {editable ? (
        <div className='flex flex-wrap gap-2'>
          {center.managerUserId ? (
            <>
              <Button onClick={() => setDialog('choose')} size='sm' variant='outline'>
                {t(`${key}.change`)}
              </Button>
              <Button onClick={() => setDialog('create')} size='sm' variant='ghost'>
                {t(`${key}.create`)}
              </Button>
              <Link
                className='inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold text-primary hover:bg-surface-container-low'
                to={`/admin/accounts/${center.managerUserId}`}
              >
                {t(`${key}.viewAccount`)}
              </Link>
            </>
          ) : (
            <>
              <Button
                leftIcon={<Icon className='text-base' name='person_add' />}
                onClick={() => setDialog('create')}
                size='sm'
              >
                {t(`${key}.create`)}
              </Button>
              <Button onClick={() => setDialog('choose')} size='sm' variant='outline'>
                {t(`${key}.choose`)}
              </Button>
            </>
          )}
        </div>
      ) : null}
      {dialog === 'create' ? <CreateManagerDialog center={center} onClose={() => setDialog(null)} /> : null}
      {dialog === 'choose' ? (
        <ChooseManagerDialog
          center={center}
          current={center.managerUserId ? manager.data : undefined}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </section>
  )
}
