import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { revenueGateways, revenueTabs, revenueTypes, type RevenueList } from '../hooks/use-revenue-list'

const key = 'admin.revenuePage' as const
const field =
  'w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary'

export function RevenueFilters({ list }: { list: RevenueList }) {
  const { t } = useTranslation()
  return (
    <section aria-label={t(`${key}.tableTitle`)} className='space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-5'>
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-12'>
        <label className='relative xl:col-span-5'>
          <span className='sr-only'>{t(`${key}.search`)}</span>
          <Icon className='absolute left-3 top-3 text-outline' name='search' />
          <input
            className={`${field} pl-10`}
            onChange={(event) => list.update('q', event.target.value)}
            placeholder={t(`${key}.search`)}
            type='search'
            value={list.get('q')}
          />
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t(`${key}.type`)}</span>
          <select
            className={field}
            onChange={(event) => list.update('type', event.target.value)}
            value={list.get('type')}
          >
            <option value=''>
              {t(`${key}.type`)}: {t(`${key}.all`)}
            </option>
            {revenueTypes.map((type) => (
              <option key={type} value={type}>
                {t(`${key}.types.${type}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t(`${key}.gateway`)}</span>
          <select
            className={field}
            onChange={(event) => list.update('gateway', event.target.value)}
            value={list.get('gateway')}
          >
            <option value=''>
              {t(`${key}.gateway`)}: {t(`${key}.all`)}
            </option>
            {revenueGateways.map((gateway) => (
              <option key={gateway} value={gateway}>
                {t(`${key}.gateways.${gateway}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t(`${key}.status`)}</span>
          <select
            className={field}
            onChange={(event) => list.update('status', event.target.value)}
            value={list.get('status')}
          >
            <option value=''>
              {t(`${key}.status`)}: {t(`${key}.all`)}
            </option>
            {revenueTabs
              .filter((tab) => tab !== 'all')
              .map((tab) => (
                <option key={tab} value={tab}>
                  {t(`${key}.tabs.${tab}`)}
                </option>
              ))}
          </select>
        </label>
        <button
          aria-label={t(`${key}.reset`)}
          className='rounded-lg bg-surface-container-low px-3 text-outline hover:bg-surface-container xl:col-span-1'
          onClick={list.reset}
          title={t(`${key}.reset`)}
          type='button'
        >
          <Icon name='filter_alt_off' />
        </button>
      </div>
      <div className='flex flex-wrap gap-2 border-t border-outline-variant/25 pt-4'>
        {revenueTabs.map((tab) => (
          <button
            aria-pressed={(list.get('status') || 'all') === tab}
            className={`rounded-full px-3 py-2 text-xs font-semibold ${(list.get('status') || 'all') === tab ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
            key={tab}
            onClick={() => list.update('status', tab === 'all' ? '' : tab)}
            type='button'
          >
            {t(`${key}.tabs.${tab}`)} ({new Intl.NumberFormat(list.locale).format(list.counts[tab])})
          </button>
        ))}
      </div>
    </section>
  )
}
