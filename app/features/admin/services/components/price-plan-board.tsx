import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useServiceCategoryLabel } from '~/entities/care-catalog/use-service-category-label'
import { baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import {
  groupByService,
  PRICING_UNITS,
  usePricePlanBoard,
  type PlanRow,
  type PricingUnit,
  type ServiceGroup
} from '../hooks/use-price-plan-board'

const key = 'admin.servicesPage.plans' as const

function useMoney() {
  const { i18n } = useTranslation()
  const format = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  })
  return (value: number) => format.format(value)
}

function Duration({ row }: { row: PlanRow }) {
  const { t } = useTranslation()
  if (row.unit === 'HOUR') return t(`${key}.durationHour`)
  return row.durationMinutes % 60 === 0
    ? t(`${key}.durationHours`, { count: row.durationMinutes / 60 })
    : t(`${key}.durationMinutes`, { count: row.durationMinutes })
}

/** Price range per pricing unit, the line a service is compared by. */
function Ranges({ group }: { group: ServiceGroup }) {
  const { t } = useTranslation()
  const money = useMoney()
  return (
    <span className='flex flex-wrap gap-x-5 gap-y-1'>
      {PRICING_UNITS.filter((unit) => group.ranges[unit]).map((unit) => {
        const range = group.ranges[unit]!
        return (
          <span className='whitespace-nowrap text-sm' key={unit}>
            <span className='text-on-surface-variant'>{t(`${key}.units.${unit}`)} </span>
            <strong className='font-semibold tabular-nums text-on-surface'>
              {range.min === range.max
                ? money(range.min)
                : t(`${key}.range`, { min: money(range.min), max: money(range.max) })}
            </strong>
            <span className='text-on-surface-variant'> {t(`${key}.per.${unit}`)}</span>
          </span>
        )
      })}
    </span>
  )
}

function LowestTag() {
  const { t } = useTranslation()
  return (
    <span className='mr-2 rounded-md bg-success-container px-1.5 py-0.5 text-[11px] font-semibold text-on-success-container'>
      {t(`${key}.lowest`)}
    </span>
  )
}

function ServicePlans({ group, open }: { group: ServiceGroup; open: boolean }) {
  const { t } = useTranslation()
  const money = useMoney()
  const categoryLabel = useServiceCategoryLabel()
  // The cheapest sellable plan of each unit is marked, so the comparison reads at a glance.
  // Only a real comparison earns the tag: a unit needs two sellable plans at different prices.
  const lowest = new Map<PricingUnit, number>()
  for (const unit of PRICING_UNITS) {
    const prices = group.rows.filter((row) => row.sellable && row.unit === unit).map((row) => row.price)
    if (prices.length > 1 && Math.min(...prices) < Math.max(...prices)) lowest.set(unit, Math.min(...prices))
  }

  return (
    <details className='group border-b border-outline-variant/30 last:border-b-0' open={open}>
      <summary className='flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-surface-container-low/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden'>
        <Icon
          className='text-xl text-on-surface-variant transition-transform duration-200 group-open:rotate-90'
          name='chevron_right'
        />
        <span className='min-w-48 flex-1'>
          <span className='block font-bold text-on-surface'>{group.serviceName}</span>
          <span className='mt-0.5 block text-xs text-on-surface-variant'>
            {categoryLabel(group.category)} ·{' '}
            {t(`${key}.summary`, { centers: group.centerCount, plans: group.rows.length })}
          </span>
        </span>
        <Ranges group={group} />
      </summary>
      <ul className='divide-y divide-outline-variant/20 px-5 pb-4 sm:hidden'>
        {group.rows.map((row) => (
          <li className={`space-y-1.5 py-3 text-sm ${row.sellable ? '' : 'text-on-surface-variant'}`} key={row.planId}>
            <div className='flex items-start justify-between gap-3'>
              <span className='font-semibold'>{row.centerName}</span>
              <StatusBadge dot tone={row.sellable ? 'success' : 'neutral'}>
                {t(row.sellable ? `${key}.sellable` : `${key}.notSellable`)}
              </StatusBadge>
            </div>
            <p>{row.planName}</p>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <span className='text-xs text-on-surface-variant'>
                {t(`${key}.units.${row.unit}`)} · <Duration row={row} />
              </span>
              <span className='whitespace-nowrap'>
                {row.sellable && lowest.get(row.unit) === row.price ? <LowestTag /> : null}
                <strong className='font-semibold tabular-nums'>{money(row.price)}</strong>
                <span className='text-xs text-on-surface-variant'> {t(`${key}.per.${row.unit}`)}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className='hidden px-5 pb-5 sm:block'>
        <table className='w-full text-left text-sm'>
          <thead className='text-xs font-semibold text-on-surface-variant'>
            <tr className='border-b border-outline-variant/40'>
              {(['center', 'plan', 'unit', 'duration'] as const).map((column) => (
                <th className='py-2 pr-4 font-semibold' key={column} scope='col'>
                  {t(`${key}.columns.${column}`)}
                </th>
              ))}
              <th className='py-2 pr-4 text-right font-semibold' scope='col'>
                {t(`${key}.columns.price`)}
              </th>
              <th className='py-2 font-semibold' scope='col'>
                {t(`${key}.columns.status`)}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant/20'>
            {group.rows.map((row) => {
              const isLowest = row.sellable && lowest.get(row.unit) === row.price
              return (
                <tr className={row.sellable ? '' : 'text-on-surface-variant'} key={row.planId}>
                  <td className='py-2.5 pr-4 font-medium'>{row.centerName}</td>
                  <td className='py-2.5 pr-4'>{row.planName}</td>
                  <td className='py-2.5 pr-4 whitespace-nowrap'>{t(`${key}.units.${row.unit}`)}</td>
                  <td className='py-2.5 pr-4 whitespace-nowrap tabular-nums'>
                    <Duration row={row} />
                  </td>
                  <td className='py-2.5 pr-4 text-right whitespace-nowrap'>
                    {isLowest ? <LowestTag /> : null}
                    <strong className='font-semibold tabular-nums'>{money(row.price)}</strong>
                    <span className='text-xs text-on-surface-variant'> {t(`${key}.per.${row.unit}`)}</span>
                  </td>
                  <td className='py-2.5'>
                    <StatusBadge dot tone={row.sellable ? 'success' : 'neutral'}>
                      {t(row.sellable ? `${key}.sellable` : `${key}.notSellable`)}
                    </StatusBadge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </details>
  )
}

/**
 * Read-only comparison of the active centers' price plans per standard service (V-02, D-08). CareCatalog lets only
 * CENTER_MANAGER create or change plans, so the admin sees prices here without editing them.
 */
export function PricePlanBoard() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const centerId = params.get('planCenter') || undefined
  const serviceId = params.get('planService') || ''
  const unit = PRICING_UNITS.find((item) => item === params.get('planUnit'))
  const sellableOnly = params.get('planAll') !== '1'
  const { centers, plans } = usePricePlanBoard(centerId)

  function update(name: string, value: string | undefined) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      return next
    })
  }

  const allRows = plans.data ?? []
  const services = groupByService(allRows).map((group) => ({ id: group.serviceId, name: group.serviceName }))
  const groups = groupByService(
    allRows.filter(
      (row) =>
        (!serviceId || row.serviceId === serviceId) && (!unit || row.unit === unit) && (!sellableOnly || row.sellable)
    )
  )

  return (
    <section className='space-y-4'>
      <div className='space-y-4 rounded-xl border border-outline-variant/40 bg-white p-5'>
        <div>
          <h2 className='text-lg font-bold text-on-surface'>{t(`${key}.title`)}</h2>
          <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>
        </div>
        <div className='flex flex-wrap items-end gap-3'>
          <label className='flex min-w-52 flex-1 flex-col gap-1 text-xs font-semibold text-on-surface-variant sm:flex-none'>
            {t(`${key}.center`)}
            <select
              className={baseControlClass}
              disabled={!centers.isSuccess}
              onChange={(event) => update('planCenter', event.target.value || undefined)}
              value={centerId ?? ''}
            >
              <option value=''>{t(`${key}.allCenters`)}</option>
              {(centers.data?.items ?? []).map((center) => (
                <option key={center.id} value={center.id}>
                  {center.centerName}
                </option>
              ))}
            </select>
          </label>
          <label className='flex min-w-52 flex-1 flex-col gap-1 text-xs font-semibold text-on-surface-variant sm:flex-none'>
            {t(`${key}.service`)}
            <select
              className={baseControlClass}
              onChange={(event) => update('planService', event.target.value || undefined)}
              value={serviceId}
            >
              <option value=''>{t(`${key}.allServices`)}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <div className='flex w-full flex-col gap-1 sm:w-auto'>
            <span className='text-xs font-semibold text-on-surface-variant' id='plan-unit-label'>
              {t(`${key}.unit`)}
            </span>
            <div
              aria-labelledby='plan-unit-label'
              className='grid grid-cols-4 rounded-xl bg-surface-container-low p-1 sm:inline-flex'
              role='group'
            >
              {([undefined, ...PRICING_UNITS] as const).map((item) => (
                <button
                  aria-pressed={unit === item}
                  className={`min-h-9 rounded-lg px-2 text-sm font-semibold whitespace-nowrap sm:px-3 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${unit === item ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                  key={item ?? 'all'}
                  onClick={() => update('planUnit', item)}
                  type='button'
                >
                  {item ? t(`${key}.units.${item}`) : t(`${key}.allUnits`)}
                </button>
              ))}
            </div>
          </div>
          <label className='flex min-h-11 items-center gap-2 text-sm text-on-surface'>
            <input
              checked={sellableOnly}
              className='h-4 w-4 accent-primary'
              onChange={(event) => update('planAll', event.target.checked ? undefined : '1')}
              type='checkbox'
            />
            {t(`${key}.sellableOnly`)}
          </label>
        </div>
        <p className='flex items-start gap-2 border-t border-outline-variant/30 pt-3 text-xs leading-5 text-on-surface-variant'>
          <Icon className='mt-0.5 text-base' name='info' />
          {t(`${key}.note`)}
        </p>
      </div>

      {centers.isPending || plans.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={5} />
      ) : centers.isError || plans.isError ? (
        <ErrorState
          message={t(`${key}.error`)}
          onRetry={() => void (centers.isError ? centers.refetch() : plans.refetch())}
          retryLabel={t(`${key}.retry`)}
        />
      ) : centers.data.items.length === 0 ? (
        <EmptyState icon='apartment' title={t(`${key}.noActiveCenters`)} />
      ) : groups.length === 0 ? (
        <EmptyState description={t(`${key}.emptyHint`)} icon='sell' title={t(`${key}.empty`)} />
      ) : (
        <div className='overflow-hidden rounded-xl border border-outline-variant/40 bg-white'>
          <p className='border-b border-outline-variant/30 px-5 py-3 text-sm text-on-surface-variant'>
            {t(`${key}.results`, { count: groups.length })}
          </p>
          {groups.map((group, index) => (
            <ServicePlans group={group} key={group.serviceId} open={index === 0 || Boolean(serviceId)} />
          ))}
        </div>
      )}
    </section>
  )
}
