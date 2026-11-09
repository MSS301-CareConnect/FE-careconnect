import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import {
  fetchNotificationPage,
  fetchUnreadCount,
  notificationKeys,
  readAllNotifications,
  readNotification,
  removeNotification,
  removeNotifications,
  removeReadNotifications,
  setNotificationsRead,
  unreadNotification
} from '~/entities/notification/notification-api'
import { type NotificationPortal } from '~/entities/notification/notification-target'
import type { ListNotificationsParams, NotificationRecord } from '~/shared/api/generated/contracts'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ActionMenu } from '~/shared/ui/action-menu'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { pageContainer } from '~/shared/ui/page-header'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton } from '~/shared/ui/skeleton'

import { NotificationItem } from './components/notification-item'
import { NotificationToolbar } from './components/notification-toolbar'
import { groupByDay } from './notification-days'

const PAGE_SIZE = 20
const key = 'notifications.center' as const

/**
 * Every notification of the signed-in user, in any portal: all / unread, grouped by day. Opening one marks it read
 * and goes to its page; a selection gets its own bar (read, unread, delete); single rows have quick actions.
 */
export function NotificationCenterPage({ portal }: { portal: NotificationPortal }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const unreadOnly = params.get('filter') === 'unread'
  const page = Math.max(0, Number(params.get('page')) || 0)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [confirm, setConfirm] = useState<'selected' | 'read' | null>(null)
  const now = useClock()
  useDocumentTitle(t(`${key}.documentTitle`))

  const request: ListNotificationsParams = { unreadOnly, page, size: PAGE_SIZE }
  const list = useQuery({
    queryKey: notificationKeys.page(request),
    queryFn: () => fetchNotificationPage(request),
    retry: false
  })
  const unread = useQuery({ queryKey: notificationKeys.unread, queryFn: fetchUnreadCount, retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  const clear = () => {
    setSelected(new Set())
    setConfirm(null)
    return refresh()
  }
  const read = useMutation({ mutationFn: readNotification, onSuccess: refresh })
  const markUnread = useMutation({ mutationFn: unreadNotification, onSuccess: refresh })
  const readAll = useMutation({ mutationFn: readAllNotifications, onSuccess: refresh })
  const removeOne = useMutation({ mutationFn: removeNotification, onSuccess: refresh })
  const markSelected = useMutation({
    mutationFn: (readState: boolean) => setNotificationsRead([...selected], readState),
    onSuccess: clear
  })
  const removeSelected = useMutation({ mutationFn: removeNotifications, onSuccess: clear })
  const removeRead = useMutation({ mutationFn: removeReadNotifications, onSuccess: clear })
  const failed = [read, markUnread, readAll, removeOne, markSelected].some((mutation) => mutation.isError)

  function update(values: { filter?: string; page?: number }) {
    setSelected(new Set())
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if ('filter' in values) {
          if (values.filter) next.set('filter', values.filter)
          else next.delete('filter')
          next.delete('page')
        }
        if (values.page !== undefined) {
          if (values.page > 0) next.set('page', String(values.page))
          else next.delete('page')
        }
        return next
      },
      { replace: true }
    )
  }
  function toggle(id: string) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  // Opening a notification always counts as reading it, even when it has no page to go to.
  function open(item: NotificationRecord, target: string | undefined) {
    if (!item.readAt) read.mutate(item.id)
    if (target) void navigate(target)
  }

  const items = list.data?.items ?? []
  const unreadCount = unread.data ?? 0

  return (
    <div
      className={`${portal === 'customer' ? `${pageContainer} pt-6 sm:pt-8` : 'mx-auto w-full px-4 pt-2 sm:px-6 sm:pt-4'} max-w-3xl pb-12`}
    >
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <span className='grid h-14 w-14 place-items-center rounded-full bg-forest-900 text-mint-200 shadow-[var(--shadow-soft)]'>
            <Icon className='text-2xl' name='notifications' />
          </span>
          <div>
            <h1 className='text-[28px] leading-tight text-forest-950 sm:text-[34px]'>{t('notifications.title')}</h1>
            <p className='text-sm text-on-surface-variant'>
              {unreadCount > 0 ? t(`${key}.unreadSummary`, { count: unreadCount }) : t(`${key}.allRead`)}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            disabled={unreadCount === 0}
            leftIcon={<Icon className='text-lg' name='done_all' />}
            loading={readAll.isPending}
            onClick={() => readAll.mutate()}
            size='sm'
            variant='secondary'
          >
            {t('notifications.readAll')}
          </Button>
          <ActionMenu
            items={[
              {
                id: 'delete-read',
                label: t(`${key}.deleteRead`),
                icon: 'delete_sweep',
                tone: 'danger',
                onSelect: () => setConfirm('read')
              }
            ]}
            label={t(`${key}.more`)}
          />
        </div>
      </header>

      <section
        aria-label={t('notifications.title')}
        className='mt-6 overflow-hidden rounded-[1.75rem] border border-forest-900/[0.06] bg-surface-container-lowest shadow-[var(--shadow-card)]'
      >
        <NotificationToolbar
          items={items}
          onClear={() => setSelected(new Set())}
          onDelete={() => setConfirm('selected')}
          onFilter={(value) => update({ filter: value === 'unread' ? 'unread' : '' })}
          onMark={(readState) => markSelected.mutate(readState)}
          onSelectAll={(all) => setSelected(all ? new Set(items.map((item) => item.id)) : new Set())}
          pending={markSelected.isPending}
          selected={selected}
          total={list.data?.totalElements}
          unreadCount={unreadCount}
          unreadOnly={unreadOnly}
        />

        {failed ? (
          <p
            className='mx-4 mt-3 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container'
            role='alert'
          >
            {t(`${key}.actionError`)}
          </p>
        ) : null}

        {list.isPending ? (
          <div aria-busy='true' className='space-y-1 p-4' role='status'>
            <span className='sr-only'>{t('notifications.loading')}</span>
            {[0, 1, 2, 3].map((row) => (
              <div className='flex items-center gap-3 py-2' key={row}>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-3.5 w-1/2 rounded-md' />
                  <Skeleton className='h-3 w-4/5 rounded-md' />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {list.isError ? (
          <div className='flex flex-col items-center gap-3 px-6 py-14 text-center' role='alert'>
            <Icon className='text-4xl text-error' name='cloud_off' />
            <p className='text-sm text-on-surface-variant'>{t('notifications.error')}</p>
            <Button onClick={() => void list.refetch()} size='sm' variant='secondary'>
              {t('booking.actions.retry')}
            </Button>
          </div>
        ) : null}
        {list.isSuccess && items.length === 0 ? (
          <div className='cc-fade-up flex flex-col items-center px-6 py-16 text-center'>
            <span className='grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-mint-100 to-peach-100 text-forest-800 ring-8 ring-mint-50'>
              <Icon className='text-3xl' name={unreadOnly ? 'mark_email_read' : 'notifications_off'} />
            </span>
            <h2 className='mt-4 text-base font-semibold text-on-surface'>
              {unreadOnly ? t(`${key}.emptyUnread`) : t('notifications.empty')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-on-surface-variant'>{t(`${key}.emptyHint`)}</p>
          </div>
        ) : null}

        {groupByDay(items, now).map((group) => (
          <section aria-label={t(`${key}.groups.${group.day}`)} key={group.day}>
            <h2 className='border-b border-outline-variant/40 bg-mint-50/70 px-5 py-2 text-xs font-semibold tracking-wide text-forest-700 uppercase'>
              {t(`${key}.groups.${group.day}`)}
            </h2>
            <ul className='cc-stagger divide-y divide-outline-variant/30'>
              {group.items.map((item) => (
                <NotificationItem
                  item={item}
                  key={item.id}
                  now={now}
                  onDelete={() => removeOne.mutate(item.id)}
                  onOpen={(target) => open(item, target)}
                  onToggleRead={() => (item.readAt ? markUnread.mutate(item.id) : read.mutate(item.id))}
                  onToggleSelect={() => toggle(item.id)}
                  portal={portal}
                  selected={selected.has(item.id)}
                />
              ))}
            </ul>
          </section>
        ))}

        {list.isSuccess && list.data.totalPages > 1 ? (
          <div className='border-t border-outline-variant/40 p-3'>
            <Pagination
              ariaLabel={t(`${key}.pagination.label`)}
              className='border-0 shadow-none'
              nextLabel={t(`${key}.pagination.next`)}
              onPageChange={(next) => update({ page: next })}
              page={list.data.page}
              pageOfLabel={t(`${key}.pagination.pageOf`, { page: list.data.page + 1, total: list.data.totalPages })}
              previousLabel={t(`${key}.pagination.previous`)}
              totalPages={list.data.totalPages}
            />
          </div>
        ) : null}
      </section>

      <ConfirmDialog
        cancelLabel={t(`${key}.cancel`)}
        confirmLabel={t(`${key}.confirm`)}
        danger
        description={t(`${key}.confirmDescription`)}
        error={removeSelected.isError || removeRead.isError ? t(`${key}.actionError`) : undefined}
        loading={removeSelected.isPending || removeRead.isPending}
        onClose={() => setConfirm(null)}
        onConfirm={() => (confirm === 'selected' ? removeSelected.mutate([...selected]) : removeRead.mutate())}
        open={confirm !== null}
        title={
          confirm === 'selected'
            ? t(`${key}.confirmSelectedTitle`, { count: selected.size })
            : t(`${key}.confirmReadTitle`)
        }
      />
    </div>
  )
}
