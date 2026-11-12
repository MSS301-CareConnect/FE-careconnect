import { useSearchParams } from 'react-router'

import { SHIFT_STATUS_CODES, type ShiftStatusCode } from '~/entities/provider/work-shift'
import { addDays, mondayOf } from '~/shared/lib/format'
import { pageSizeOf } from '~/shared/ui/pagination'

export type RangePreset = 'upcoming' | 'next7' | 'thisMonth' | 'all' | 'custom'
export type ShiftView = 'table' | 'week'

const RANGES: readonly RangePreset[] = ['upcoming', 'next7', 'thisMonth', 'all', 'custom']

export const SHIFT_PAGE_SIZES = [10, 20, 50] as const

/**
 * Filters of the shift list kept in the URL (shareable, survive reload): status, date range (preset or custom),
 * type, "has places left", "has sign-ups to review", list / week view, week and page. Every filter is sent to
 * ProviderService, so counts and pages are about all shifts, never only the visible page.
 */
export function useShiftFilters(today: string) {
  const [params, setParams] = useSearchParams()
  const statusParam = params.get('status')
  const status = (SHIFT_STATUS_CODES as readonly string[]).includes(statusParam ?? '')
    ? (statusParam as ShiftStatusCode)
    : undefined
  const rangeParam = params.get('range') as RangePreset | null
  const range: RangePreset = rangeParam && RANGES.includes(rangeParam) ? rangeParam : 'upcoming'
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const type = params.get('type') ?? ''
  const vacancy = params.get('vacancy') === '1'
  const pending = params.get('pending') === '1'
  const view: ShiftView = params.get('view') === 'week' ? 'week' : 'table'
  const week = mondayOf(params.get('week') ?? today)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const size = pageSizeOf(params.get('size'), 10, SHIFT_PAGE_SIZES)

  let fromDate: string | undefined
  let toDate: string | undefined
  if (range === 'upcoming') fromDate = today
  else if (range === 'next7') {
    fromDate = today
    toDate = addDays(today, 6)
  } else if (range === 'thisMonth') {
    fromDate = `${today.slice(0, 7)}-01`
    const next = new Date(`${fromDate}T00:00:00Z`)
    next.setUTCMonth(next.getUTCMonth() + 1)
    toDate = addDays(next.toISOString().slice(0, 10), -1)
  } else if (range === 'custom') {
    fromDate = from || undefined
    toDate = to || undefined
  }
  const rangeInvalid = Boolean(fromDate && toDate && toDate < fromDate)

  function update(changes: Record<string, string | undefined>, keepPage = false) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!keepPage) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  const active = Boolean(status || type || vacancy || pending || range !== 'upcoming')
  // "Understaffed" card = shifts of the next 7 days that still have places left.
  const understaffed = range === 'next7' && vacancy && !status && !pending

  return {
    status,
    range,
    from,
    to,
    fromDate: rangeInvalid ? undefined : fromDate,
    toDate: rangeInvalid ? undefined : toDate,
    rangeInvalid,
    type,
    vacancy,
    pending,
    view,
    week,
    page,
    size,
    active,
    understaffed,
    setStatus: (value?: ShiftStatusCode) => update({ status: value }),
    // "Pick dates" starts from the dates of the preset in use, so choosing it never widens the list by surprise.
    setRange: (value: RangePreset) =>
      value === 'custom'
        ? update({ range: 'custom', from: from || fromDate, to: to || toDate })
        : update({ range: value === 'upcoming' ? undefined : value, from: undefined, to: undefined }),
    setCustomRange: (nextFrom: string, nextTo: string) =>
      update({ range: 'custom', from: nextFrom || undefined, to: nextTo || undefined }),
    setType: (value: string) => update({ type: value || undefined }),
    setVacancy: (value: boolean) => update({ vacancy: value ? '1' : undefined }),
    setPending: (value: boolean) => update({ pending: value ? '1' : undefined }),
    toggleUnderstaffed: () =>
      update(
        understaffed
          ? { range: undefined, vacancy: undefined }
          : { range: 'next7', from: undefined, to: undefined, vacancy: '1', status: undefined, pending: undefined }
      ),
    setView: (value: ShiftView) => update({ view: value === 'week' ? 'week' : undefined }, true),
    setWeek: (monday: string) => update({ week: monday === mondayOf(today) ? undefined : monday }, true),
    setPage: (value: number) => update({ page: value > 0 ? String(value) : undefined }, true),
    setSize: (value: number) => update({ size: value === 10 ? undefined : String(value) }),
    clear: () =>
      update({
        status: undefined,
        range: undefined,
        from: undefined,
        to: undefined,
        type: undefined,
        vacancy: undefined,
        pending: undefined
      })
  }
}

export type ShiftFilters = ReturnType<typeof useShiftFilters>
