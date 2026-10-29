import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import {
  fetchNotifications,
  fetchUnreadCount,
  notificationKeys,
  readAllNotifications,
  readNotification
} from './notification-api'
import { useNotificationStream } from './use-notification-stream'

const MAX_BADGE = 99

/** Notification center shared by the four portals (H-06): unread badge, latest notifications, mark as read. */
export function NotificationBell() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  useNotificationStream(true)
  const unread = useQuery({ queryKey: notificationKeys.unread, queryFn: fetchUnreadCount, retry: false })
  const list = useQuery({ queryKey: notificationKeys.list, queryFn: fetchNotifications, enabled: open, retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  const readOne = useMutation({ mutationFn: readNotification, onSuccess: refresh })
  const readAll = useMutation({ mutationFn: readAllNotifications, onSuccess: refresh })
  const count = unread.data ?? 0

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
      {open ? (
        <section
          aria-label={t('notifications.title')}
          className='absolute top-full right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-lg'
        >
          <div className='flex items-center justify-between px-2 py-1'>
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
          {list.isPending ? (
            <p className='px-2 py-3 text-sm text-on-surface-variant' role='status'>
              {t('notifications.loading')}
            </p>
          ) : null}
          {list.isError ? (
            <p className='px-2 py-3 text-sm text-error' role='alert'>
              {t('notifications.error')}
            </p>
          ) : null}
          {list.isSuccess && list.data.items.length === 0 ? (
            <p className='px-2 py-3 text-sm text-on-surface-variant'>{t('notifications.empty')}</p>
          ) : null}
          <ul className='max-h-96 overflow-y-auto'>
            {(list.data?.items ?? []).map((item) => (
              <li key={item.id}>
                <button
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-container-low ${item.readAt ? 'text-on-surface-variant' : 'font-semibold text-on-surface'}`}
                  onClick={() => {
                    if (!item.readAt) readOne.mutate(item.id)
                  }}
                  type='button'
                >
                  <span className='block'>{item.title}</span>
                  {item.body ? <span className='mt-0.5 block text-xs font-normal'>{item.body}</span> : null}
                  {item.createdAt ? (
                    <span className='mt-0.5 block text-[11px] font-normal text-on-surface-variant'>
                      {formatter.format(new Date(item.createdAt))}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
