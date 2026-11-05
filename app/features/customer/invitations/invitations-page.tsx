import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  acceptInvitation,
  declineInvitation,
  fetchMyInvitations,
  managerErrorKey,
  managerKeys
} from '~/entities/care-recipient/care-recipient-managers-api'
import type { MyInvitationRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { PageHeader } from '~/shared/ui/page-header'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

const key = 'customer.invitations' as const

/** Invitations addressed to the signed-in customer; accepting is the only way to become a co-manager (C-04). */
export function InvitationsPage() {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  useDocumentTitle(t(`${key}.documentTitle`))
  const [declining, setDeclining] = useState<MyInvitationRecord | null>(null)
  const invitations = useQuery({ queryKey: managerKeys.myInvitations, queryFn: fetchMyInvitations, retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: managerKeys.myInvitations })
  const accept = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: refresh
  })
  const decline = useMutation({
    mutationFn: declineInvitation,
    onSuccess: async () => {
      setDeclining(null)
      await refresh()
    }
  })
  const items = invitations.data ?? []
  const busy = accept.isPending || decline.isPending

  const PAGE_SIZE = 5
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))
  const pagedItems = items.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <div>
      <PageHeader description={t(`${key}.subtitle`)} title={t(`${key}.title`)} />

      {invitations.isPending ? (
        <SkeletonGroup className='flex flex-col gap-4' label={t(`${key}.loading`)}>
          {[0, 1].map((index) => (
            <Skeleton className='h-36 w-full rounded-2xl' key={index} />
          ))}
        </SkeletonGroup>
      ) : null}
      {invitations.isError ? (
        <ErrorState message={t(managerErrorKey(invitations.error))} onRetry={() => void invitations.refetch()} />
      ) : null}
      {accept.isError ? (
        <p className='mb-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
          {t(managerErrorKey(accept.error))}
        </p>
      ) : null}
      {accept.isSuccess ? (
        <p
          className='cc-fade-up mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-success-container px-4 py-3 text-sm text-on-success-container'
          role='status'
        >
          <Icon className='text-lg' name='check_circle' />
          {t(`${key}.accepted`)}
          <Link className='font-semibold underline-offset-2 hover:underline' to='/customer/patient-profiles'>
            {t(`${key}.openProfiles`)}
          </Link>
        </p>
      ) : null}

      {invitations.isSuccess && items.length === 0 ? (
        <EmptyState
          action={
            <Link
              className='inline-flex min-h-11 items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-on-surface hover:bg-surface-container-low'
              to='/customer/patient-profiles'
            >
              {t(`${key}.openProfiles`)}
            </Link>
          }
          description={t(`${key}.emptyHint`)}
          icon='mail'
          title={t(`${key}.empty`)}
        />
      ) : null}

      <ul className='cc-stagger flex flex-col gap-4'>
        {pagedItems.map((invitation) => {
          const name = invitation.recipientFullName ?? t(`${key}.unknownProfile`)
          return (
            <li
              className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
              key={invitation.id}
            >
              <div className='flex items-start gap-4'>
                <Avatar className='h-12 w-12 shrink-0 rounded-full' decorative name={name} />
                <div className='min-w-0 flex-1'>
                  <h2 className='text-base font-semibold text-on-surface'>{t(`${key}.profile`, { name })}</h2>
                  <dl className='mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3'>
                    <div>
                      <dt className='text-xs text-on-surface-variant'>{t(`${key}.access`)}</dt>
                      <dd className='font-medium text-on-surface'>
                        {t(`customer.managers.levels.${invitation.accessLevel}`)}
                      </dd>
                    </div>
                    {invitation.relationshipType ? (
                      <div>
                        <dt className='text-xs text-on-surface-variant'>{t(`${key}.relationship`)}</dt>
                        <dd className='font-medium text-on-surface'>
                          {t(`customer.managers.relationships.${invitation.relationshipType}`)}
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className='text-xs text-on-surface-variant'>{t(`${key}.expiresLabel`)}</dt>
                      <dd className='font-medium text-on-surface tabular-nums'>
                        {format.dateTime(invitation.expiresAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className='mt-4 flex flex-wrap justify-end gap-2 border-t border-outline-variant/70 pt-4'>
                <Button
                  disabled={busy}
                  onClick={() => {
                    decline.reset()
                    setDeclining(invitation)
                  }}
                  variant='outline'
                >
                  {t(`${key}.decline`)}
                </Button>
                <Button
                  disabled={busy}
                  loading={accept.isPending && accept.variables === invitation.id}
                  onClick={() => accept.mutate(invitation.id)}
                >
                  {t(`${key}.accept`)}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <Pagination
        className='mt-6'
        onPageChange={setPage}
        page={safePage}
        totalPages={totalPages}
      />

      <ConfirmDialog
        confirmLabel={t(`${key}.decline`)}
        danger
        description={t(`${key}.declineHint`)}
        error={decline.isError ? t(managerErrorKey(decline.error)) : undefined}
        loading={decline.isPending}
        onClose={() => setDeclining(null)}
        onConfirm={() => declining && decline.mutate(declining.id)}
        open={declining !== null}
        title={t(`${key}.declineTitle`, { name: declining?.recipientFullName ?? '' })}
      />
    </div>
  )
}
