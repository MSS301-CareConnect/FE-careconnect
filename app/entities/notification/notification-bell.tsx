import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import type { NotificationRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import {
  fetchNotifications,
  fetchUnreadCount,
  notificationKeys,
  readAllNotifications,
  readNotification,
  removeNotification
} from './notification-api'
import { notificationIcon, notificationsPath, notificationTarget, type NotificationPortal } from './notification-target'
import { useNotificationStream } from './use-notification-stream'
import { useExitPresence } from '~/shared/lib/use-exit-presence'

const MAX_BADGE = 99

/**
 * Notification center shared by the portals (H-06): unread badge, latest notifications, open (marks read and goes to
 * the related page), delete, mark all as read and a link to the full list. A portal may pin its own items above the
 * list (`pinned`, e.g. the customer's pending invitations) and add them to the badge.
 */
export function NotificationBell({
  portal,
  pinned,
  pinnedCount = 0
}: {
  portal: NotificationPortal
  pinned?: (close: () => void) => ReactNode
  pinnedCount?: number
}) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { present, state: panelState } = useExitPresence(open)
  const panelRef = useRef<HTMLDivElement>(null)
  useNotificationStream(true)
  const unread = useQuery({ queryKey: notificationKeys.unread, queryFn: fetchUnreadCount, retry: false })
  const list = useQuery({ queryKey: notificationKeys.list, queryFn: fetchNotifications, enabled: open, retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  const readOne = useMutation({ mutationFn: readNotification, onSuccess: refresh })
  const readAll = useMutation({ mutationFn: readAllNotifications, onSuccess: refresh })
  const remove = useMutation({ mutationFn: removeNotification, onSuccess: refresh })
  const count = (unread.data ?? 0) + pinnedCount

  useEffect(() => {
    if (!open) return undefined
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    function onClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  function openItem(item: NotificationRecord) {
    if (!item.readAt) readOne.mutate(item.id)
    const target = notificationTarget(item, portal)
    if (!target) return
    setOpen(false)
    void navigate(target)
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' })
  return (
    <div className='relative' ref={panelRef}>
      <button
        aria-expanded={open}
        aria-haspopup='true'
        aria-label={count > 0 ? t('notifications.bellUnread', { count }) : t('notifications.bell')}
        className='relative flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low'
        onClick={() => setOpen((value) => !value)}
        type='button'
      >
        <Icon name='notifications' />
        {count > 0 ? (
          <span className='absolute top-1 right-1 min-w-5 rounded-full bg-error px-1 text-center text-[10px] leading-5 font-bold text-on-error tabular-nums'>
            {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
          </span>
        ) : null}
      </button>
      {present ? (
        <section
          aria-label={t('notifications.title')}
          className='cc-dropdown absolute top-full right-0 z-20 mt-2 w-96 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-lg'
          data-state={panelState}
        >
          <div className='flex items-center justify-between border-b border-outline-variant/50 px-4 py-3'>
            <h2 className='text-sm font-bold'>{t('notifications.title')}</h2>
            <button
              className='rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-surface-container-low disabled:opacity-50'
              disabled={count === 0 || readAll.isPending}
              onClick={() => readAll.mutate()}
              type='button'
            >
              {t('notifications.readAll')}
            </button>
          </div>
          {pinned ? <div className='px-2 pt-2'>{pinned(() => setOpen(false))}</div> : null}
          {list.isPending ? (
            <p className='px-4 py-3 text-sm text-on-surface-variant' role='status'>
              {t('notifications.loading')}
            </p>
          ) : null}
          {list.isError ? (
            <p className='px-4 py-3 text-sm text-error' role='alert'>
              {t('notifications.error')}
            </p>
          ) : null}
          {list.isSuccess && list.data.items.length === 0 ? (
            <p className='flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-on-surface-variant'>
              <Icon className='text-3xl' name='notifications_off' />
              {t('notifications.empty')}
            </p>
          ) : null}
          <ul className='max-h-96 divide-y divide-outline-variant/40 overflow-y-auto'>
            {(list.data?.items ?? []).map((item) => (
              <li className={`group relative ${item.readAt ? '' : 'bg-primary/5'}`} key={item.id}>
                <button
                  className='flex w-full items-start gap-3 py-3 pr-10 pl-4 text-left hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary'
                  onClick={() => openItem(item)}
                  type='button'
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.readAt ? 'bg-surface-container text-on-surface-variant' : 'bg-primary/10 text-primary'}`}
                  >
                    <Icon className='text-base' name={notificationIcon(item.type)} />
                  </span>
                  <span className='min-w-0 flex-1 text-sm'>
                    <span
                      className={`block ${item.readAt ? 'text-on-surface-variant' : 'font-semibold text-on-surface'}`}
                    >
                      {item.title}
                    </span>
                    {item.body ? (
                      <span className='mt-0.5 block text-xs text-on-surface-variant'>{item.body}</span>
                    ) : null}
                    {item.createdAt ? (
                      <span className='mt-0.5 block text-[11px] text-on-surface-variant'>
                        {formatter.format(new Date(item.createdAt))}
                      </span>
                    ) : null}
                  </span>
                </button>
                <button
                  aria-label={t('notifications.deleteNamed', { title: item.title })}
                  className='absolute top-2.5 right-2 grid h-8 w-8 place-items-center rounded-full text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-container focus-visible:opacity-100'
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(item.id)}
                  type='button'
                >
                  <Icon className='text-base' name='close' />
                </button>
              </li>
            ))}
          </ul>
          <Link
            className='flex items-center justify-center gap-1 border-t border-outline-variant/50 px-4 py-3 text-sm font-semibold text-primary hover:bg-surface-container-low'
            onClick={() => setOpen(false)}
            to={notificationsPath(portal)}
          >
            {t('notifications.viewAll')}
            <Icon className='text-base' name='arrow_forward' />
          </Link>
        </section>
      ) : null}
    </div>
  )
}
