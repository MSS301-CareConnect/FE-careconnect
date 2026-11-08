import { useTranslation } from 'react-i18next'

import { SHIFT_STATUS_TONES, shiftStatusLabelKey, shiftTypeLabelKey } from '~/entities/provider/work-shift'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { ActionMenu, type ActionMenuItem } from '~/shared/ui/action-menu'
import { StatusBadge } from '~/shared/ui/status-badge'

import { allowedShiftActions, shiftMinutes, type ShiftAction } from '../shift-actions'

const k = 'centerManager.workShifts' as const

const ACTION_ICONS: Record<ShiftAction, string> = {
  view: 'visibility',
  edit: 'edit',
  duplicate: 'content_copy',
  open: 'lock_open',
  close: 'lock',
  cancel: 'event_busy'
}
const ACTION_ORDER: ShiftAction[] = ['view', 'edit', 'duplicate', 'open', 'close', 'cancel']

export function useShiftMenuItems(
  onAction: (action: ShiftAction, shift: ProviderWorkShiftRecord) => void,
  now: number
) {
  const { t } = useTranslation()
  return (shift: ProviderWorkShiftRecord): ActionMenuItem[] => {
    const allowed = allowedShiftActions(shift, now)
    return ACTION_ORDER.filter((action) => allowed.has(action)).map((action) => ({
      id: action,
      label: t(`${k}.actions.${action}`),
      icon: ACTION_ICONS[action],
      tone: action === 'cancel' ? 'danger' : 'default',
      onSelect: () => onAction(action, shift)
    }))
  }
}

/** Staffing as "approved / capacity" with a bar, plus how many sign-ups wait for review. */
export function CapacityCell({ shift }: { shift: ProviderWorkShiftRecord }) {
  const { t } = useTranslation()
  const approved = shift.approvedCount ?? 0
  const ratio = shift.capacity > 0 ? Math.min(1, approved / shift.capacity) : 0
  const pending = shift.pendingCount ?? 0
  return (
    <div className='min-w-[8.5rem] space-y-1.5'>
      <div className='flex items-center justify-between gap-2 text-sm'>
        <span className='font-semibold tabular-nums'>
          {t(`${k}.table.filled`, { approved, capacity: shift.capacity })}
        </span>
        {pending > 0 ? (
          <StatusBadge tone='warning'>{t(`${k}.table.pendingBadge`, { count: pending })}</StatusBadge>
        ) : null}
      </div>
      <div aria-hidden='true' className='h-1.5 overflow-hidden rounded-full bg-surface-container'>
        <div
          className={`h-full rounded-full ${ratio >= 1 ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}

export function ShiftTable({
  shifts,
  now,
  onOpen,
  onAction
}: {
  shifts: ProviderWorkShiftRecord[]
  now: number
  onOpen: (shift: ProviderWorkShiftRecord) => void
  onAction: (action: ShiftAction, shift: ProviderWorkShiftRecord) => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const menuItems = useShiftMenuItems(onAction, now)
  const timeOf = (shift: ProviderWorkShiftRecord) => `${shift.startTime.slice(0, 5)}–${shift.endTime.slice(0, 5)}`

  return (
    <>
      <div className='hidden overflow-x-auto md:block'>
        <table className='w-full text-left text-sm'>
          <caption className='sr-only'>{t(`${k}.table.caption`)}</caption>
          <thead className='border-b border-outline-variant/40 text-xs font-semibold text-on-surface-variant'>
            <tr>
              <th className='px-4 py-3' scope='col'>
                {t(`${k}.table.date`)}
              </th>
              <th className='px-4 py-3' scope='col'>
                {t(`${k}.table.time`)}
              </th>
              <th className='px-4 py-3' scope='col'>
                {t(`${k}.table.type`)}
              </th>
              <th className='px-4 py-3' scope='col'>
                {t(`${k}.table.status`)}
              </th>
              <th className='px-4 py-3' scope='col'>
                {t(`${k}.table.capacity`)}
              </th>
              <th className='w-14 px-4 py-3' scope='col'>
                <span className='sr-only'>{t(`${k}.table.actions`)}</span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant/30'>
            {shifts.map((shift) => (
              <tr
                className='cursor-pointer transition-colors duration-150 hover:bg-surface-container-low/60'
                key={shift.id}
                onClick={() => onOpen(shift)}
              >
                <td className='px-4 py-3'>
                  <button
                    className='rounded text-left font-semibold text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-primary'
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpen(shift)
                    }}
                    type='button'
                  >
                    {format.dayLabel(shift.workDate)}
                  </button>
                </td>
                <td className='px-4 py-3 tabular-nums'>
                  <span className='font-medium'>{timeOf(shift)}</span>
                  <span className='block text-xs text-on-surface-variant'>{format.duration(shiftMinutes(shift))}</span>
                </td>
                <td className='px-4 py-3'>{t(shiftTypeLabelKey(shift.shiftType))}</td>
                <td className='px-4 py-3'>
                  <StatusBadge dot tone={SHIFT_STATUS_TONES[shift.shiftStatus]}>
                    {t(shiftStatusLabelKey(shift.shiftStatus))}
                  </StatusBadge>
                </td>
                <td className='px-4 py-3'>
                  <CapacityCell shift={shift} />
                </td>
                <td className='px-2 py-3' onClick={(event) => event.stopPropagation()}>
                  <ActionMenu
                    items={menuItems(shift)}
                    label={t(`${k}.table.actionsFor`, { date: format.date(shift.workDate) })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className='divide-y divide-outline-variant/30 md:hidden'>
        {shifts.map((shift) => (
          <li className='flex items-start gap-3 px-4 py-3' key={shift.id}>
            <button
              className='min-w-0 flex-1 space-y-2 text-left focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => onOpen(shift)}
              type='button'
            >
              <span className='flex flex-wrap items-center gap-2'>
                <strong>{format.dayLabel(shift.workDate)}</strong>
                <StatusBadge dot tone={SHIFT_STATUS_TONES[shift.shiftStatus]}>
                  {t(shiftStatusLabelKey(shift.shiftStatus))}
                </StatusBadge>
              </span>
              <span className='block text-sm text-on-surface-variant tabular-nums'>
                {timeOf(shift)} · {t(shiftTypeLabelKey(shift.shiftType))}
              </span>
              <CapacityCell shift={shift} />
            </button>
            <ActionMenu
              items={menuItems(shift)}
              label={t(`${k}.table.actionsFor`, { date: format.date(shift.workDate) })}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
