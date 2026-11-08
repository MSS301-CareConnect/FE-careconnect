import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { TimeOffPhaseBadge, timeOffPhase, useTimeOffRange } from '~/entities/provider/caregiver-time-offs'
import type { ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

const k = 'centerManager.schedules' as const

/** Time off of the whole center: who, when, how long, why, its phase and a delete action. */
export function TimeOffTable({
  items,
  now,
  onRemove
}: {
  items: ProviderTimeOffRecord[]
  now: number
  onRemove: (item: ProviderTimeOffRecord) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const range = useTimeOffRange()

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[760px] text-left text-sm'>
        <caption className='sr-only'>{t(`${k}.timeOffs.caption`)}</caption>
        <thead className='border-b border-outline-variant/50 bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
          <tr>
            {(['caregiver', 'period', 'length', 'reason', 'status', 'actions'] as const).map((column) => (
              <th className={`px-4 py-3 ${column === 'actions' ? 'text-right' : ''}`} key={column} scope='col'>
                {t(`${k}.timeOffs.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-outline-variant/30'>
          {items.map((item) => {
            const phase = timeOffPhase(item, now)
            const minutes = Math.round((new Date(item.endAt).getTime() - new Date(item.startAt).getTime()) / 60_000)
            return (
              <tr
                className={`hover:bg-surface-container-low/60 ${phase === 'past' ? 'text-on-surface-variant' : ''}`}
                key={item.id}
              >
                <td className='px-4 py-3'>
                  <Link
                    className='font-semibold text-on-surface hover:text-primary hover:underline'
                    to={`/center-manager/caregivers/${item.caregiverId}`}
                  >
                    {item.caregiverName || t(`${k}.unknown`)}
                  </Link>
                </td>
                <td className='px-4 py-3 tabular-nums'>{range(item)}</td>
                <td className='px-4 py-3 tabular-nums'>{format.duration(minutes)}</td>
                <td className='max-w-64 px-4 py-3'>
                  <span className='line-clamp-2'>{item.reason || t('centerManager.provider.timeOff.noReason')}</span>
                </td>
                <td className='px-4 py-3'>
                  <TimeOffPhaseBadge phase={phase} />
                </td>
                <td className='px-4 py-3 text-right'>
                  {phase === 'past' ? null : (
                    <Button
                      aria-label={t('centerManager.provider.timeOff.removeLabel', { range: range(item) })}
                      onClick={() => onRemove(item)}
                      size='sm'
                      variant='ghost'
                    >
                      <Icon className='text-lg text-error' name='delete' />
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
