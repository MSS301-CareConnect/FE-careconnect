import { useTranslation } from 'react-i18next'

import {
  notificationIcon,
  notificationTarget,
  notificationTone,
  type NotificationPortal,
  type NotificationTone
} from '~/entities/notification/notification-target'
import type { NotificationRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { relativeTime } from '../notification-days'

const TONES: Record<NotificationTone, string> = {
  danger: 'bg-error-container text-on-error-container',
  warning: 'bg-warning-container text-on-warning-container',
  success: 'bg-success-container text-on-success-container',
  info: 'bg-primary/10 text-primary'
}

const quickAction =
  'grid h-8 w-8 place-items-center rounded-full sm:h-9 sm:w-9 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'

/**
 * One notification: a checkbox, then the whole notice as one button (opening marks it read and goes to its page when
 * it has one), then quick actions that appear on hover / focus on wider screens (phones use the selection bar).
 */
export function NotificationItem({
  item,
  portal,
  now,
  selected,
  onToggleSelect,
  onOpen,
  onToggleRead,
  onDelete
}: {
  item: NotificationRecord
  portal: NotificationPortal
  now: number
  selected: boolean
  onToggleSelect: () => void
  onOpen: (target: string | undefined) => void
  onToggleRead: () => void
  onDelete: () => void
}) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const key = 'notifications.center' as const
  const target = notificationTarget(item, portal)
  const unread = !item.readAt
  const when = item.createdAt ? relativeTime(item.createdAt, now, i18n.language) : ''

  return (
    <li
      className={`group relative flex items-start gap-1 px-2 py-1.5 transition-colors sm:px-3 ${selected ? 'bg-mint-100/70' : unread ? 'bg-mint-50/60' : ''}`}
    >
      <label className='grid h-12 w-10 shrink-0 cursor-pointer place-items-center'>
        <input
          aria-label={t(`${key}.select`, { title: item.title })}
          checked={selected}
          className='h-4 w-4 cursor-pointer rounded accent-primary'
          onChange={onToggleSelect}
          type='checkbox'
        />
      </label>
      <button
        className='flex min-w-0 flex-1 items-start gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-primary'
        onClick={() => onOpen(target)}
        type='button'
      >
        <span
          className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full ${TONES[notificationTone(item.type)]}`}
        >
          <Icon className='text-xl' name={notificationIcon(item.type)} />
          {unread ? (
            <span
              aria-hidden='true'
              className='absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-peach-400 ring-2 ring-surface-container-lowest'
            />
          ) : null}
        </span>
        <span className='min-w-0 flex-1 py-0.5'>
          <span className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3'>
            <span
              className={`line-clamp-2 min-w-0 text-sm sm:truncate ${unread ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'}`}
            >
              {item.title}
            </span>
            {item.createdAt ? (
              <time
                className={`shrink-0 text-xs tabular-nums ${unread ? 'font-semibold text-primary' : 'text-outline'}`}
                dateTime={item.createdAt}
                title={format.dateTime(item.createdAt)}
              >
                {when ?? t(`${key}.justNow`)}
              </time>
            ) : null}
          </span>
          {item.body ? (
            <span className='mt-0.5 line-clamp-2 block text-sm leading-5 text-on-surface-variant'>{item.body}</span>
          ) : null}
        </span>
        {target ? (
          <span aria-hidden='true' className='mt-2.5 hidden shrink-0 sm:block'>
            <Icon
              className='text-lg text-outline transition-transform group-hover:translate-x-0.5 group-hover:text-primary'
              name='chevron_right'
            />
          </span>
        ) : null}
      </button>
      <div className='hidden shrink-0 gap-0.5 pt-1 transition-opacity sm:flex sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100'>
        <button
          aria-label={
            unread
              ? t(`${key}.markReadNamed`, { title: item.title })
              : t(`${key}.markUnreadNamed`, { title: item.title })
          }
          className={quickAction}
          onClick={onToggleRead}
          title={unread ? t(`${key}.markRead`) : t(`${key}.markUnread`)}
          type='button'
        >
          <Icon className='text-lg' name={unread ? 'mark_email_read' : 'mark_email_unread'} />
        </button>
        <button
          aria-label={t('notifications.deleteNamed', { title: item.title })}
          className={`${quickAction} hover:text-error`}
          onClick={onDelete}
          title={t('notifications.delete')}
          type='button'
        >
          <Icon className='text-lg' name='delete' />
        </button>
      </div>
    </li>
  )
}
