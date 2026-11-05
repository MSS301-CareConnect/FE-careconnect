import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { NotificationRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const key = 'notifications.center' as const
const barAction =
  'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'

/**
 * Top bar of the notification list. Without a selection: select-all and the All / Unread filter. With one: how many
 * are selected and what to do with them (mark read, mark unread, delete), replacing the filter until it is cleared.
 */
export function NotificationToolbar({
  items,
  selected,
  unreadOnly,
  unreadCount,
  total,
  pending,
  onSelectAll,
  onFilter,
  onMark,
  onDelete,
  onClear
}: {
  items: NotificationRecord[]
  selected: ReadonlySet<string>
  unreadOnly: boolean
  unreadCount: number
  total: number | undefined
  pending: boolean
  onSelectAll: (all: boolean) => void
  onFilter: (value: 'all' | 'unread') => void
  onMark: (read: boolean) => void
  onDelete: () => void
  onClear: () => void
}) {
  const { t } = useTranslation()
  const checkbox = useRef<HTMLInputElement>(null)
  const count = items.filter((item) => selected.has(item.id)).length
  const all = items.length > 0 && count === items.length
  const selecting = count > 0
  const picked = items.filter((item) => selected.has(item.id))
  const anyUnread = picked.some((item) => !item.readAt)
  const anyRead = picked.some((item) => item.readAt)

  useEffect(() => {
    if (checkbox.current) checkbox.current.indeterminate = selecting && !all
  }, [selecting, all])

  const filters = [
    { value: 'all' as const, label: t(`${key}.filters.all`), badge: unreadOnly ? undefined : total },
    { value: 'unread' as const, label: t(`${key}.filters.unread`), badge: unreadCount || undefined }
  ]

  return (
    <div
      className={`flex min-h-14 flex-wrap items-center gap-2 border-b border-outline-variant/40 px-2 py-2 transition-colors sm:px-3 ${selecting ? 'bg-primary/10' : 'bg-surface-container-lowest'}`}
    >
      <label className='grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-surface-container-low'>
        <input
          aria-label={t(`${key}.selectAll`)}
          checked={all}
          className='h-4 w-4 cursor-pointer accent-primary'
          disabled={items.length === 0}
          onChange={() => onSelectAll(!all)}
          ref={checkbox}
          type='checkbox'
        />
      </label>

      {selecting ? (
        <div
          className='cc-fade-up flex min-w-0 flex-1 flex-wrap items-center gap-1'
          role='toolbar'
          aria-label={t(`${key}.selectionLabel`)}
        >
          <span className='mr-auto pl-1 text-sm font-semibold text-on-surface tabular-nums' aria-live='polite'>
            {t(`${key}.selected`, { count })}
          </span>
          <button
            className={`${barAction} text-primary hover:bg-surface-container-lowest`}
            disabled={pending || !anyUnread}
            onClick={() => onMark(true)}
            type='button'
          >
            <Icon className='text-lg' name='mark_email_read' />
            {t(`${key}.markRead`)}
          </button>
          <button
            className={`${barAction} text-primary hover:bg-surface-container-lowest`}
            disabled={pending || !anyRead}
            onClick={() => onMark(false)}
            type='button'
          >
            <Icon className='text-lg' name='mark_email_unread' />
            {t(`${key}.markUnread`)}
          </button>
          <button
            className={`${barAction} text-error hover:bg-error-container/60`}
            disabled={pending}
            onClick={onDelete}
            type='button'
          >
            <Icon className='text-lg' name='delete' />
            {t(`${key}.deleteSelected`)}
          </button>
          <button
            aria-label={t(`${key}.clearSelection`)}
            className='grid h-9 w-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-lowest focus-visible:outline-2 focus-visible:outline-primary'
            onClick={onClear}
            title={t(`${key}.clearSelection`)}
            type='button'
          >
            <Icon className='text-lg' name='close' />
          </button>
        </div>
      ) : (
        <div
          aria-label={t(`${key}.filters.label`)}
          className='flex items-center gap-1 rounded-xl bg-surface-container-low p-1'
          role='group'
        >
          {filters.map((filter) => {
            const active = (filter.value === 'unread') === unreadOnly
            return (
              <button
                aria-pressed={active}
                className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-primary ${active ? 'bg-surface-container-lowest text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                key={filter.value}
                onClick={() => onFilter(filter.value)}
                type='button'
              >
                {filter.label}
                {filter.badge ? (
                  <span
                    className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 tabular-nums ${filter.value === 'unread' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                  >
                    {filter.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
