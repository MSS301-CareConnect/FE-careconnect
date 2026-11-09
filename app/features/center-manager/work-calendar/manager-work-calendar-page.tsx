import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RemoveTimeOffDialog, TimeOffDialog } from '~/entities/provider/caregiver-time-offs'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { addDays, calendarDayOf, useFormat } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Combobox } from '~/shared/ui/combobox'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Icon } from '~/shared/ui/icon'
import { SegmentedControl } from '~/shared/ui/segmented-control'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { BentoPageHeader } from '~/shared/ui/bento-page-header'
import { buildRows, clashesWithLeave, leaveOnDay, scheduleMinutes, type DayLeave } from './calendar-model'
import { ScheduleList } from './components/schedule-list'
import { TeamWeekGrid } from './components/team-week-grid'
import { TimeOffTable } from './components/time-off-table'
import { WorkCalendarStats, type CalendarNumbers } from './components/work-calendar-stats'
import { TIME_OFF_SCOPES, useWorkCalendar, type CalendarView } from './hooks/use-work-calendar'

const k = 'centerManager.schedules' as const

/**
 * Center Manager "Work calendar": who works which approved shift and who is off, for one week at a time — as a team
 * grid, as a list, or as the center's time off (add / delete). Shifts themselves are created in "Work shifts".
 */
export function ManagerWorkCalendarPage() {
  const { t } = useTranslation()
  const format = useFormat()
  const centerId = useAuthUser()?.centerId ?? ''
  // Fixed when the page opens (react-hooks/purity); "now" only marks past shifts and current time off.
  const now = useClock(60_000)
  const [openedAt] = useState(now)
  const today = calendarDayOf(new Date(now))
  const calendar = useWorkCalendar(centerId, today, openedAt)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<ProviderTimeOffRecord | null>(null)
  const [onlyBusy, setOnlyBusy] = useState(false)
  useDocumentTitle(t(`${k}.title`))

  if (!centerId) {
    return (
      <div className='mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6' role='alert'>
        {t(`${k}.noCenter`)}
      </div>
    )
  }

  const people = (calendar.caregivers.data?.items ?? [])
    .filter((person) => person.caregiverStatus === 'ACTIVE')
    .filter((person) => !calendar.caregiverId || person.id === calendar.caregiverId)
    .map((person) => ({ id: person.id, name: person.fullName }))
  const options = (calendar.caregivers.data?.items ?? [])
    .filter((person) => person.caregiverStatus !== 'ARCHIVED')
    .map((person) => ({ value: person.id, name: person.fullName }))
  const schedules = calendar.schedules.data?.items ?? []
  const weekLeaves = calendar.weekTimeOffs.data?.items ?? []
  const rows = buildRows(people, schedules, weekLeaves, onlyBusy, t(`${k}.unknown`))
  const active = schedules.filter((item) => item.scheduleStatus !== 'CANCELLED')
  const clashes = active.filter((schedule) =>
    clashesWithLeave(
      schedule,
      weekLeaves
        .filter((item) => item.caregiverId === schedule.caregiverId)
        .map((item) => leaveOnDay(item, schedule.workDate))
        .filter((leave): leave is DayLeave => Boolean(leave))
    )
  )
  const loading = calendar.schedules.isPending || calendar.weekTimeOffs.isPending
  const numbers: CalendarNumbers | undefined = loading
    ? undefined
    : {
        shifts: active.length,
        minutes: active.reduce((sum, item) => sum + scheduleMinutes(item), 0),
        staffed: new Set(active.map((item) => item.caregiverId)).size,
        team: people.length,
        onLeaveNow: new Set((calendar.leaveNow.data?.items ?? []).map((item) => item.caregiverId)).size,
        weekLeaves: weekLeaves.length,
        clashes: clashes.length,
        cancelled: schedules.length - active.length
      }
  const timeOffTab = calendar.view === 'timeOff'
  const failed = timeOffTab ? calendar.timeOffs.isError : calendar.schedules.isError || calendar.weekTimeOffs.isError

  return (
    <div className='mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'>
      <BentoPageHeader
        actions={
          <Button leftIcon={<Icon name='event_busy' />} onClick={() => setAdding(true)}>
            {t('centerManager.provider.timeOff.add')}
          </Button>
        }
        description={t(`${k}.subtitle`)}
        title={t(`${k}.title`)}
      />
      <WorkCalendarStats
        loading={loading}
        numbers={numbers}
        onShowTimeOff={() => {
          calendar.setView('timeOff')
          calendar.setScope('current')
        }}
      />

      <section
        aria-label={t(`${k}.toolbar`)}
        className='flex flex-wrap items-center gap-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-3 sm:p-4'
      >
        <SegmentedControl
          legend={t(`${k}.view.label`)}
          onChange={(value: CalendarView) => calendar.setView(value)}
          options={[
            { value: 'team', label: t(`${k}.view.team`) },
            { value: 'list', label: t(`${k}.view.list`) },
            { value: 'timeOff', label: t(`${k}.view.timeOff`) }
          ]}
          value={calendar.view}
        />
        <Combobox
          aria-label={t(`${k}.caregiverFilter`)}
          className='w-60'
          icon='person_search'
          onChange={calendar.setCaregiver}
          options={[{ value: '', name: t(`${k}.allCaregivers`) }, ...options]}
          placeholder={t(`${k}.allCaregivers`)}
          searchPlaceholder={t('centerManager.provider.timeOff.caregiverSearch')}
          value={calendar.caregiverId}
        />
        {timeOffTab ? (
          <FilterChips
            label={t(`${k}.scope.label`)}
            onChange={(value) => calendar.setScope(TIME_OFF_SCOPES.find((item) => item === value) ?? 'current')}
            options={TIME_OFF_SCOPES.map((scope) => ({ value: scope, label: t(`${k}.scope.${scope}`) }))}
            value={calendar.scope}
          />
        ) : null}
        {calendar.view === 'team' ? (
          <label className='inline-flex min-h-10 items-center gap-2 text-sm text-on-surface'>
            <input
              checked={onlyBusy}
              className='h-4 w-4 accent-primary'
              onChange={(event) => setOnlyBusy(event.target.checked)}
              type='checkbox'
            />
            {t(`${k}.onlyBusy`)}
          </label>
        ) : null}
        {!timeOffTab || calendar.scope === 'week' ? (
          <div className='ml-auto flex items-center gap-1.5'>
            <Button
              aria-label={t(`${k}.week.previous`)}
              onClick={() => calendar.setWeek(addDays(calendar.monday, -7))}
              size='sm'
              variant='outline'
            >
              <Icon name='chevron_left' />
            </Button>
            <span className='min-w-44 text-center text-sm font-semibold tabular-nums' aria-live='polite'>
              {t(`${k}.week.range`, { from: format.shortDate(calendar.monday), to: format.date(calendar.sunday) })}
            </span>
            <Button
              aria-label={t(`${k}.week.next`)}
              onClick={() => calendar.setWeek(addDays(calendar.monday, 7))}
              size='sm'
              variant='outline'
            >
              <Icon name='chevron_right' />
            </Button>
            <Button onClick={() => calendar.setWeek(today)} size='sm' variant='ghost'>
              {t(`${k}.week.thisWeek`)}
            </Button>
          </div>
        ) : null}
      </section>

      {calendar.truncated && !timeOffTab ? (
        <p className='flex items-center gap-2 text-sm text-warning' role='status'>
          <Icon name='info' />
          {t(`${k}.truncated`)}
        </p>
      ) : null}

      <section className='overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest'>
        {failed ? (
          <ErrorState
            message={t(`${k}.error`)}
            onRetry={() => {
              void calendar.schedules.refetch()
              void calendar.weekTimeOffs.refetch()
              void calendar.timeOffs.refetch()
            }}
            retryLabel={t(`${k}.retry`)}
          />
        ) : timeOffTab ? (
          calendar.timeOffs.isPending ? (
            <SkeletonBlock className='m-4 border-0 shadow-none' label={t(`${k}.loading`)} rows={5} />
          ) : (calendar.timeOffs.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              action={
                <Button leftIcon={<Icon name='add' />} onClick={() => setAdding(true)} variant='outline'>
                  {t('centerManager.provider.timeOff.add')}
                </Button>
              }
              description={t(`${k}.timeOffs.emptyHint`)}
              icon='beach_access'
              title={t(`${k}.timeOffs.empty.${calendar.scope}`)}
            />
          ) : (
            <TimeOffTable items={calendar.timeOffs.data?.items ?? []} now={openedAt} onRemove={setRemoving} />
          )
        ) : loading ? (
          <SkeletonBlock className='m-4 border-0 shadow-none' label={t(`${k}.loading`)} rows={6} />
        ) : calendar.view === 'team' ? (
          rows.length === 0 ? (
            <EmptyState description={t(`${k}.emptyHint`)} icon='event_busy' title={t(`${k}.empty`)} />
          ) : (
            <>
              <TeamWeekGrid monday={calendar.monday} rows={rows} today={today} />
              <ul
                aria-label={t(`${k}.legend.label`)}
                className='flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant/40 px-4 py-3 text-xs text-on-surface-variant'
              >
                {(
                  [
                    ['border-success/40 bg-success-container/70', 'shift'],
                    ['border-dashed border-warning/60 bg-warning-container/60', 'leave'],
                    ['border-error/50 bg-error-container/60', 'clash'],
                    ['border-outline-variant bg-surface-container-low', 'cancelled']
                  ] as const
                ).map(([tone, item]) => (
                  <li className='flex items-center gap-1.5' key={item}>
                    <span aria-hidden='true' className={`h-3 w-5 rounded border ${tone}`} />
                    {t(`${k}.legend.${item}`)}
                  </li>
                ))}
              </ul>
            </>
          )
        ) : schedules.length === 0 ? (
          <EmptyState description={t(`${k}.emptyHint`)} icon='event_busy' title={t(`${k}.emptyWeek`)} />
        ) : (
          <ScheduleList now={openedAt} schedules={schedules} timeOffs={weekLeaves} />
        )}
      </section>

      {adding ? (
        <TimeOffDialog
          caregiverId={calendar.caregiverId || undefined}
          caregiverName={options.find((option) => option.value === calendar.caregiverId)?.name}
          caregivers={options}
          defaultDay={today}
          onClose={() => setAdding(false)}
          open
        />
      ) : null}
      <RemoveTimeOffDialog item={removing} onClose={() => setRemoving(null)} />
    </div>
  )
}
