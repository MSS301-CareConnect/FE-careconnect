import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { CatalogFilters } from './components/catalog-filters'
import { CatalogItemDialog } from './components/catalog-item-dialog'
import { CatalogTable } from './components/catalog-table'
import { CenterPricingPanel } from './components/center-pricing-panel'
import { DeleteCatalogItemDialog } from './components/delete-catalog-item-dialog'
import { PricingGuidelines, SurchargePreview } from './components/pricing-guidelines'
import { useCatalogList } from './hooks/use-catalog-list'

const key = 'admin.servicesPage' as const
const tabs = ['master', 'center', 'surcharge'] as const

type Editing = { mode: 'create' } | { mode: 'edit'; item: CatalogItemRecord }

export function AdminServicesPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const list = useCatalogList()
  const [editing, setEditing] = useState<Editing | null>(null)
  const [deleting, setDeleting] = useState<CatalogItemRecord | null>(null)
  const tab = tabs.find((item) => item === params.get('tab')) ?? 'master'
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
    ['total', list.items.length, 'medical_services'],
    ['active', list.items.filter((item) => item.status === 'ACTIVE').length, 'check_circle'],
    ['inactive', list.items.filter((item) => item.status === 'INACTIVE').length, 'pause_circle'],
    ['categories', list.categories.length, 'category']
  ] as const

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <div className='flex flex-wrap items-center gap-2 text-xs'>
            <span className='rounded-full bg-secondary-container px-3 py-1 font-bold text-primary'>
              {t(`${key}.badge`)}
            </span>
            <span className='text-outline'>{t(`${key}.liveSource`)}</span>
          </div>
          <h1 className='mt-3 text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          <p className='mt-2 text-xs font-semibold text-primary'>{t(`${key}.scope`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {(['history', 'importExport'] as const).map((action) => (
            <button
              className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold disabled:opacity-50'
              disabled
              key={action}
              title={t(`${key}.unavailable`)}
              type='button'
            >
              <Icon className='text-lg' name={action === 'history' ? 'history' : 'file_download'} />
              {t(`${key}.${action}`)}
            </button>
          ))}
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white'
            onClick={() => setEditing({ mode: 'create' })}
            type='button'
          >
            <Icon className='text-lg' name='add_circle' />
            {t(`${key}.add`)}
          </button>
        </div>
      </header>
      <section aria-label={t(`${key}.metrics.total`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metrics.map(([name, value, icon]) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-outline'>
              <span>{t(`${key}.metrics.${name}`)}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <strong className='mt-5 block text-3xl'>{list.query.isSuccess ? number.format(value) : '—'}</strong>
            <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.metricHints.${name}`)}</p>
          </div>
        ))}
      </section>
      <div
        aria-label={t('admin.services')}
        className='flex flex-wrap gap-2 rounded-xl bg-surface-container-low p-1.5'
        role='tablist'
      >
        {tabs.map((item) => (
          <button
            aria-selected={tab === item}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === item ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/60'}`}
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
            categories={list.categoryOptions}
            category={list.category}
            keyword={list.keyword}
            onChange={list.update}
            onReset={list.reset}
            status={list.status}
          />
          <CatalogTable list={list} onDelete={setDeleting} onEdit={(item) => setEditing({ mode: 'edit', item })} />
        </>
      ) : null}
      {tab === 'center' ? <CenterPricingPanel /> : null}
      {tab === 'surcharge' ? <SurchargePreview /> : null}
      <PricingGuidelines />
      {editing ? (
        <CatalogItemDialog
          categories={list.categoryOptions}
          item={editing.mode === 'edit' ? editing.item : undefined}
          key={editing.mode === 'edit' ? editing.item.id : 'create'}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {deleting ? <DeleteCatalogItemDialog item={deleting} onClose={() => setDeleting(null)} /> : null}
    </div>
  )
}
