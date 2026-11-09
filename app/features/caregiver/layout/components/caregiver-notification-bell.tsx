import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import {
  fetchNotifications,
  fetchUnreadCount,
  notificationKeys,
  readAllNotifications,
  readNotification,
  removeNotification
} from '~/entities/notification/notification-api'
import { notificationIcon, notificationsPath, notificationTarget } from '~/entities/notification/notification-target'
import { useNotificationStream } from '~/entities/notification/use-notification-stream'
import type { NotificationRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { Skeleton } from '~/shared/ui/skeleton'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { useNow } from '../../ui/use-now'
import { useExitPresence } from '~/shared/lib/use-exit-presence'

const MAX_BADGE = 99

/**
 * The caregiver's notifications: a dropdown on desktop, a bottom sheet on phones. Same API as the shared bell (list,
 * unread count, mark read, SSE refresh); the panel adds icons per type and relative times.
 */
export function CaregiverNotificationBell() {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const now = useNow(60_000)
  const [open, setOpen] = useState(false)
  const { present, state: panelState } = useExitPresence(open)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  // Phones get a bottom sheet rendered at the shell root, so the sticky topbar's stacking context cannot put it
  // under the tab bar; wider screens keep the dropdown anchored to the bell.
  const [sheetHost, setSheetHost] = useState<Element | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  useNotificationStream(true)
  const unread = useQuery({ queryKey: notificationKeys.unread, queryFn: fetchUnreadCount, retry: false })
  const list = useQuery({ queryKey: notificationKeys.list, queryFn: fetchNotifications, enabled: open, retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  const readOne = useMutation({ mutationFn: readNotification, onSuccess: refresh })
  const readAll = useMutation({ mutationFn: readAllNotifications, onSuccess: refresh })
  const remove = useMutation({ mutationFn: removeNotification, onSuccess: refresh })
  const navigate = useNavigate()

  function openItem(item: NotificationRecord) {
    if (!item.readAt) readOne.mutate(item.id)
    const target = notificationTarget(item, 'caregiver')
    if (!target) return
    setOpen(false)
    void navigate(target)
  }
  const count = unread.data ?? 0

  useEffect(() => {
    if (!open) return undefined
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointer(event: PointerEvent) {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const renderPanel = (panel: ReactNode) => (sheetHost ? createPortal(panel, sheetHost) : panel)

  return (
    <div className='relative' ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup='true'
        aria-label={count > 0 ? t('notifications.bellUnread', { count }) : t('notifications.bell')}
        className='cg-press relative grid h-11 w-11 place-items-center rounded-full bg-white/85 text-forest-900 shadow-[var(--cg-shadow-1)] ring-1 ring-forest-900/5 hover:bg-white focus-visible:outline-2 focus-visible:outline-primary'
        onClick={() => {
          setSheetHost(
            window.matchMedia('(max-width: 639px)').matches ? document.querySelector('.theme-caregiver') : null
          )
          setOpen((value) => !value)
        }}
        ref={buttonRef}
        type='button'
      >
        <Icon filled={open} name='notifications' />
        {count > 0 ? (
          <span className='absolute top-1.5 right-1.5 min-w-[18px] rounded-full bg-peach-400 px-1 text-center text-[10px] leading-[18px] font-bold text-forest-950 tabular-nums ring-2 ring-white'>
            {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
          </span>
        ) : null}
      </button>
      {present
        ? renderPanel(
            <>
              <div aria-hidden='true' className='fixed inset-0 z-40 bg-on-surface/30 sm:hidden' />
              <section
                aria-label={t('notifications.title')}
                ref={panelRef}
                data-state={panelState}
                className='cc-dropdown cg-safe-bottom fixed inset-x-0 bottom-0 z-50 origin-bottom sm:origin-top-right max-h-[80dvh] overflow-hidden rounded-t-3xl border border-outline-variant bg-surface-container-lowest shadow-[var(--cg-shadow-2)] sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:bottom-auto sm:mt-2 sm:w-96 sm:rounded-2xl'
              >
                <div className='mx-auto mt-2 h-1 w-10 rounded-full bg-outline-variant sm:hidden' />
                <div className='flex items-center justify-between border-b border-outline-variant px-4 py-3'>
                  <h2 className='text-base font-semibold text-on-surface'>{t('notifications.title')}</h2>
                  <button
                    className='min-h-9 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-brand-50 disabled:opacity-50'
                    disabled={count === 0 || readAll.isPending}
                    onClick={() => readAll.mutate()}
                    type='button'
                  >
                    {t('notifications.readAll')}
                  </button>
                </div>
                <div className='max-h-[60dvh] overflow-y-auto sm:max-h-[28rem]'>
                  {list.isPending ? (
                    <div aria-busy='true' className='flex flex-col gap-2 p-4' role='status'>
                      <span className='sr-only'>{t('notifications.loading')}</span>
                      <Skeleton className='h-12 rounded-lg' />
                      <Skeleton className='h-12 rounded-lg' />
                    </div>
                  ) : null}
                  {list.isError ? (
                    <p className='p-4 text-sm text-error' role='alert'>
                      {t('notifications.error')}
                    </p>
                  ) : null}
                  {list.isSuccess && list.data.items.length === 0 ? (
                    <p className='flex flex-col items-center gap-2 p-8 text-center text-sm text-on-surface-variant'>
                      <Icon className='text-3xl' name='notifications_off' />
                      {t('notifications.empty')}
                    </p>
                  ) : null}
                  <ul className='divide-y divide-outline-variant'>
                    {(list.data?.items ?? []).map((item) => (
                      <li className='group relative' key={item.id}>
                        <button
                          className={`flex w-full items-start gap-3 py-3 pr-11 pl-4 text-left hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${item.readAt ? '' : 'bg-brand-50/50'}`}
                          onClick={() => openItem(item)}
                          type='button'
                        >
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${item.readAt ? 'bg-surface-container-low text-on-surface-variant' : 'bg-brand-100 text-primary'}`}
                          >
                            <Icon className='text-lg' name={notificationIcon(item.type)} />
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span
                              className={`block text-sm ${item.readAt ? 'text-on-surface-variant' : 'font-semibold text-on-surface'}`}
                            >
                              {item.title}
                            </span>
                            {item.body ? (
                              <span className='mt-0.5 block text-sm text-on-surface-variant'>{item.body}</span>
                            ) : null}
                            {item.createdAt ? (
                              <span className='mt-0.5 block text-xs text-on-surface-variant'>
                                {format.relativeTime(item.createdAt, now)}
                              </span>
                            ) : null}
                          </span>
                          {item.readAt ? null : (
                            <span aria-hidden='true' className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary' />
                          )}
                        </button>
                        <button
                          aria-label={t('notifications.deleteNamed', { title: item.title })}
                          className='absolute top-2.5 right-2 grid h-9 w-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100'
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(item.id)}
                          type='button'
                        >
                          <Icon className='text-base' name='close' />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  className='flex min-h-12 items-center justify-center gap-1 border-t border-outline-variant text-sm font-semibold text-primary hover:bg-surface-container-low'
                  onClick={() => setOpen(false)}
                  to={notificationsPath('caregiver')}
                >
                  {t('notifications.viewAll')}
                  <Icon className='text-base' name='arrow_forward' />
                </Link>
              </section>
            </>
          )
        : null}
    </div>
  )
}
