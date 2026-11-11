import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { CaregiverAbsenceRecord, CaregiverAbsenceStatus } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

const key = 'caregiverAbsence' as const
const TONES: Record<CaregiverAbsenceStatus, StatusTone> = {
  PENDING: 'warning',
  EXCUSED: 'neutral',
  CONFIRMED: 'danger'
}

export function CaregiverAbsenceStatusBadge({ status }: { status: CaregiverAbsenceStatus }) {
  const { t } = useTranslation()
  return (
    <StatusBadge dot tone={TONES[status]}>
      {t(`${key}.status.${status}`)}
    </StatusBadge>
  )
}

/**
 * One caregiver absence (2026-11-10): the missed visit, why it was recorded, the caregiver's explanation and the
 * center's conclusion. `meta` adds who it concerns (caregiver / center name); `actions` holds the role's buttons.
 */
export function CaregiverAbsenceCard({
  item,
  meta,
  actions
}: {
  item: CaregiverAbsenceRecord
  meta?: ReactNode
  actions?: ReactNode
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const time = `${format.longDayLabel(calendarDayOf(item.startAt))} · ${t('bookingSchedule.timeRange', {
    start: format.clock(item.startAt),
    end: format.clock(item.endAt)
  })}`
  return (
    <li className='@container rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3'>
      <div className='flex flex-col gap-3 @xl:flex-row @xl:items-start @xl:justify-between'>
        <div className='min-w-0 space-y-1 text-sm'>
          <p className='flex flex-wrap items-center gap-2 font-semibold text-on-surface tabular-nums'>
            {t(`${key}.visit`, { number: item.occurrenceNo ?? '', time })}
            <CaregiverAbsenceStatusBadge status={item.status} />
          </p>
          <p className='text-on-surface-variant'>
            <span className='font-mono'>{item.bookingCode}</span>
            {item.recipientName ? ` · ${item.recipientName}` : ''}
            {` · ${t(`${key}.source.${item.source}`)}`}
          </p>
          {meta ? <p className='text-xs text-on-surface-variant'>{meta}</p> : null}
          <p className='whitespace-pre-line text-on-surface'>
            {item.explanation ? t(`${key}.explanation`, { text: item.explanation }) : t(`${key}.noExplanation`)}
            {item.explainedAt ? (
              <span className='block text-xs text-on-surface-variant'>
                {t(`${key}.explainedAt`, { time: format.dateTime(item.explainedAt) })}
              </span>
            ) : null}
          </p>
          {item.status !== 'PENDING' ? (
            <p className='whitespace-pre-line text-on-surface'>
              {item.conclusionNote
                ? t(`${key}.conclusion`, { text: item.conclusionNote })
                : t(`${key}.status.${item.status}`)}
              {item.concludedAt ? (
                <span className='block text-xs text-on-surface-variant'>
                  {t(`${key}.concludedAt`, { time: format.dateTime(item.concludedAt) })}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        {actions ? <div className='flex shrink-0 flex-wrap gap-2'>{actions}</div> : null}
      </div>
    </li>
  )
}
