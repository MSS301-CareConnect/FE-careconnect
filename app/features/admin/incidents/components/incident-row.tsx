import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { OutboxStatus } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import type { IncidentRow as IncidentRowData } from '../incidents-api'

const TONES: Record<OutboxStatus, StatusTone> = {
  PENDING: 'info',
  SENT: 'success',
  FAILED: 'danger',
  SKIPPED: 'neutral'
}

interface IncidentRowProps {
  row: IncidentRowData
  busy: boolean
  onRequeue: (id: string) => void
  onSkip: (id: string, note: string) => void
}

export function IncidentRow({ row, busy, onRequeue, onSkip }: IncidentRowProps) {
  const { t, i18n } = useTranslation()
  const [note, setNote] = useState('')
  const updatedAt = row.updatedAt
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.updatedAt))
    : ''
  return (
    <li className='rounded-xl border border-outline-variant/60 bg-white p-4 text-sm'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='font-semibold'>{row.eventType}</p>
        <StatusBadge tone={TONES[row.status]}>{t(`admin.incidentsPage.status.${row.status}`)}</StatusBadge>
      </div>
      <dl className='mt-2 grid grid-cols-1 gap-1 text-xs text-on-surface-variant sm:grid-cols-3'>
        <div>
          <dt className='inline'>{t('admin.incidentsPage.subject')}: </dt>
          <dd className='inline font-mono'>{row.subjectId}</dd>
        </div>
        <div>
          <dt className='inline'>{t('admin.incidentsPage.attempts')}: </dt>
          <dd className='inline tabular-nums'>{row.attempts}</dd>
        </div>
        <div>
          <dt className='inline'>{t('admin.incidentsPage.updatedAt')}: </dt>
          <dd className='inline'>{updatedAt}</dd>
        </div>
      </dl>
      {row.lastError ? <p className='mt-2 break-words text-xs text-error'>{row.lastError}</p> : null}
      {row.status === 'FAILED' ? (
        <div className='mt-3 flex flex-wrap items-end gap-2'>
          <button
            className='rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-50'
            disabled={busy}
            onClick={() => onRequeue(row.id)}
            type='button'
          >
            {t('admin.incidentsPage.requeue')}
          </button>
          <label className='flex min-w-48 flex-1 flex-col text-xs font-medium'>
            {t('admin.incidentsPage.skipNote')}
            <input
              className='mt-1 rounded-lg border border-outline-variant px-3 py-2 text-sm'
              maxLength={400}
              onChange={(event) => setNote(event.target.value)}
              value={note}
            />
          </label>
          <button
            className='rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold disabled:opacity-50'
            disabled={busy || !note.trim()}
            onClick={() => onSkip(row.id, note.trim())}
            type='button'
          >
            {t('admin.incidentsPage.skip')}
          </button>
        </div>
      ) : null}
    </li>
  )
}
