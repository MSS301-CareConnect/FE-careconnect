import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCenterName } from '~/entities/provider/use-provider-names'
import type { OutboxStatus } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import type { IncidentRow as IncidentRowData, IncidentSource } from '../incidents-api'

const TONES: Record<OutboxStatus, StatusTone> = {
  PENDING: 'info',
  SENT: 'success',
  FAILED: 'danger',
  SKIPPED: 'neutral'
}

const EVENT_KEYS = [
  'REFUND',
  'REMAINING_INVOICE',
  'COMPLAINT_REFUND',
  'RATING',
  'SUSPEND',
  'RESUME',
  'ACTIVATE',
  'CAREGIVER_DEACTIVATED'
] as const
type EventKey = (typeof EVENT_KEYS)[number]

function eventKey(eventType: string): EventKey | 'other' {
  return EVENT_KEYS.find((item) => item === eventType) ?? 'other'
}

interface IncidentRowProps {
  row: IncidentRowData
  source: IncidentSource
  busy: boolean
  onRequeue: (id: string) => void
  onSkip: (id: string, note: string) => void
}

/** ProviderService rows belong to a center, shown by name; BookingService rows are described by their event alone. */
function IncidentCenter({ centerId }: { centerId: string }) {
  const { t } = useTranslation()
  const name = useCenterName(centerId)
  return (
    <div>
      <dt className='inline'>{t('admin.incidentsPage.subject')}: </dt>
      <dd className='inline font-medium text-on-surface'>{name}</dd>
    </div>
  )
}

export function IncidentRow({ row, source, busy, onRequeue, onSkip }: IncidentRowProps) {
  const { t, i18n } = useTranslation()
  const [note, setNote] = useState('')
  const updatedAt = row.updatedAt
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.updatedAt))
    : ''
  return (
    <li className='rounded-xl border border-outline-variant/60 bg-white p-4 text-sm'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='font-semibold'>{t(`admin.incidentsPage.events.${eventKey(row.eventType)}`)}</p>
        <StatusBadge tone={TONES[row.status]}>{t(`admin.incidentsPage.status.${row.status}`)}</StatusBadge>
      </div>
      <dl className='mt-2 grid grid-cols-1 gap-1 text-xs text-on-surface-variant sm:grid-cols-3'>
        {source === 'provider' ? <IncidentCenter centerId={row.subjectId} /> : null}
        <div>
          <dt className='inline'>{t('admin.incidentsPage.attempts')}: </dt>
          <dd className='inline tabular-nums'>{row.attempts}</dd>
        </div>
        <div>
          <dt className='inline'>{t('admin.incidentsPage.updatedAt')}: </dt>
          <dd className='inline'>{updatedAt}</dd>
        </div>
      </dl>
      {row.lastError ? (
        <details className='mt-2 text-xs'>
          <summary className='cursor-pointer font-medium text-on-surface-variant'>
            {t('admin.incidentsPage.technicalDetail')}
          </summary>
          <p className='mt-1 break-words text-error'>{row.lastError}</p>
        </details>
      ) : null}
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
