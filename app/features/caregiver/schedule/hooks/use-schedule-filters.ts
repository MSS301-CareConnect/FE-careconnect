import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import {
  addDays,
  dateFromKey,
  dateKey,
  displayWeekStart,
  sampleToday,
  sampleTomorrow,
  schedulePreview,
  sessionStatuses,
  validDateKey
} from '../schedule-preview'

export type ScheduleScope = 'overview' | 'today' | 'tomorrow' | 'week' | 'month' | 'day'
const scopes: ScheduleScope[] = ['overview', 'today', 'tomorrow', 'week', 'month', 'day']

export function useScheduleFilters() {
  const [params, setParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const requestedMonth = params.get('month')
  const month = requestedMonth && validDateKey(`${requestedMonth}-01`) ? requestedMonth : '2026-09'
  const requestedDate = params.get('date')
  const date =
    validDateKey(requestedDate) && requestedDate.startsWith(month)
      ? requestedDate
      : month === '2026-09'
        ? sampleToday
        : `${month}-01`
  const requestedScope = params.get('scope')
  const parsedScope = scopes.find((value) => value === requestedScope) ?? (month === '2026-09' ? 'overview' : 'month')
  const scope = month !== '2026-09' && ['overview', 'today', 'tomorrow'].includes(parsedScope) ? 'month' : parsedScope
  const status = sessionStatuses.find((value) => value === params.get('status')) ?? 'all'
  const search = params.get('q') ?? ''
  const view = params.get('view') === 'calendar' ? 'calendar' : 'list'
  const weekStart = displayWeekStart(date)
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  function update(values: Record<string, string | null>) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(values)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { preventScrollReset: true }
    )
  }

  function chooseScope(nextScope: ScheduleScope) {
    const nextDate =
      nextScope === 'today' || nextScope === 'overview' ? sampleToday : nextScope === 'tomorrow' ? sampleTomorrow : date
    update({ scope: nextScope, month: nextDate.slice(0, 7), date: nextDate })
  }

  function chooseDate(nextDate: string) {
    update({ date: nextDate, month: nextDate.slice(0, 7), scope: 'day', view: 'list' })
  }

  function changeMonth(offset: number) {
    const next = dateFromKey(`${month}-01`)
    next.setUTCMonth(next.getUTCMonth() + offset)
    if (next.getUTCFullYear() < 1900 || next.getUTCFullYear() > 2099) return
    const key = dateKey(next)
    update({ month: key.slice(0, 7), date: key, scope: 'month' })
  }

  const matchingSessions = schedulePreview.filter((session) => {
    const matchesStatus = status === 'all' || session.status === status
    const name =
      session.patient === 'a'
        ? t('caregiver.schedulePage.patients.a.name')
        : session.patient === 'b'
          ? t('caregiver.schedulePage.patients.b.name')
          : t('caregiver.schedulePage.patients.c.name')
    const locale = i18n.resolvedLanguage ?? 'vi'
    return matchesStatus && name.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale))
  })
  const visibleSessions = matchingSessions.filter((session) => {
    if (scope === 'overview') return session.date === sampleToday || session.date === sampleTomorrow
    if (scope === 'today') return session.date === sampleToday
    if (scope === 'tomorrow') return session.date === sampleTomorrow
    if (scope === 'day') return session.date === date
    if (scope === 'week') return weekDates.includes(session.date)
    return session.date.startsWith(month)
  })
  const weekSessions = schedulePreview.filter((session) => weekDates.includes(session.date))
  return {
    date,
    month,
    scope,
    status,
    search,
    view,
    weekDates,
    weekSessions,
    matchingSessions,
    visibleSessions,
    update,
    chooseScope,
    chooseDate,
    changeMonth,
    reset: () => setParams({})
  }
}

export type ScheduleFilters = ReturnType<typeof useScheduleFilters>
