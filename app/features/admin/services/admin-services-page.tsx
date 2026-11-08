import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { CatalogFilters } from './components/catalog-filters'
import { CatalogItemDialog } from './components/catalog-item-dialog'
import { CatalogItemViewDialog } from './components/catalog-item-view-dialog'
import { CatalogTable } from './components/catalog-table'
import { DeleteCatalogItemDialog } from './components/delete-catalog-item-dialog'
import { PricePlanBoard } from './components/price-plan-board'
import { useCatalogList } from './hooks/use-catalog-list'

const key = 'admin.servicesPage' as const
const tabs = ['master', 'plans'] as const
/** Links saved before the price-plan board replaced the per-center and surcharge tabs. */
const legacyPlanTabs = new Set(['center', 'surcharge'])

type Editing = { mode: 'create' } | { mode: 'edit'; item: CatalogItemRecord }

export function AdminServicesPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const list = useCatalogList()
  const [viewing, setViewing] = useState<CatalogItemRecord | null>(null)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [deleting, setDeleting] = useState<CatalogItemRecord | null>(null)
  const requested = params.get('tab')
  const tab = legacyPlanTabs.has(requested ?? '') ? 'plans' : (tabs.find((item) => item === requested) ?? 'master')
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  useDocumentTitle(t(`${key}.documentTitle`))

  function selectTab(next: (typeof tabs)[number]) {
    setParams((previous) => {
      const updated = new URLSearchParams(previous)
      if (next === 'master') updated.delete('tab')
      else updated.set('tab', next)
      return updated
    })
  }

  const metrics = [
    { name: 'total', value: list.items.length, icon: 'medical_services', badgeBg: 'bg-emerald-100 text-emerald-800' },
    {
      name: 'active',
      value: list.items.filter((item) => item.status === 'ACTIVE').length,
      icon: 'check_circle',
      badgeBg: 'bg-teal-100 text-teal-800'
    },
    {
      name: 'inactive',
      value: list.items.filter((item) => item.status === 'INACTIVE').length,
      icon: 'pause_circle',
      badgeBg: 'bg-amber-100 text-amber-800'
    },
    { name: 'categories', value: list.categories.length, icon: 'category', badgeBg: 'bg-sky-100 text-sky-800' }
  ] as const

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl text-on-surface'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-xs transition-all hover:bg-primary-container active:scale-[0.98]'
            onClick={() => setEditing({ mode: 'create' })}
            type='button'
          >
            <Icon className='text-lg' name='add_circle' />
            {t(`${key}.add`)}
          </button>
        </div>
      </header>

      {tab === 'master' ? (
        <section aria-label={t(`${key}.metrics.total`)} className='grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4'>
          {metrics.map((item) => (
            <div
              className='relative min-w-0 overflow-hidden rounded-2xl border border-outline-variant/60 bg-white p-4 shadow-xs sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
              key={item.name}
            >
              <div className='flex items-start justify-between gap-2'>
                <span className='min-w-0 text-[11px] font-bold uppercase leading-4 tracking-wider text-outline sm:text-xs'>
                  {t(`${key}.metrics.${item.name}`)}
                </span>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.badgeBg}`}>
                  <Icon className='text-xl' name={item.icon} />
                </span>
              </div>
              <strong className='mt-3 block text-2xl font-extrabold sm:mt-4 sm:text-3xl tracking-tight tabular-nums text-on-surface'>
                {list.query.isSuccess ? number.format(item.value) : '—'}
              </strong>
              <p className='mt-1.5 line-clamp-2 text-xs text-on-surface-variant'>
                {t(`${key}.metricHints.${item.name}`)}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <div
        aria-label={t('admin.services')}
        className='flex gap-1.5 overflow-x-auto rounded-2xl bg-surface-container-low p-1.5 shadow-xs'
        role='tablist'
      >
        {tabs.map((item) => (
          <button
            aria-selected={tab === item}
            className={`shrink-0 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              tab === item
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
            }`}
            key={item}
            onClick={() => selectTab(item)}
            role='tab'
            type='button'
          >
            {t(`${key}.tabs.${item}`)}
          </button>
        ))}
      </div>

      {tab === 'master' ? (
        <>
          <CatalogFilters
            categories={list.categories}
            category={list.category}
            keyword={list.keyword}
            onChange={list.update}
            onReset={list.reset}
            status={list.status}
          />
          <CatalogTable
            list={list}
            onDelete={setDeleting}
            onEdit={(item) => setEditing({ mode: 'edit', item })}
            onView={(item) => setViewing(item)}
          />
        </>
      ) : null}

      {tab === 'plans' ? <PricePlanBoard /> : null}

      {viewing ? (
        <CatalogItemViewDialog
          item={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            const target = viewing
            setViewing(null)
            setEditing({ mode: 'edit', item: target })
          }}
        />
      ) : null}

      {editing ? (
        <CatalogItemDialog
          item={editing.mode === 'edit' ? editing.item : undefined}
          key={editing.mode === 'edit' ? editing.item.id : 'create'}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {deleting ? <DeleteCatalogItemDialog item={deleting} onClose={() => setDeleting(null)} /> : null}
    </div>
  )
}
