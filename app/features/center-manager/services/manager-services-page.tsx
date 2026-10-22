import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import {
  careCatalogErrorStatus,
  careCatalogKeys,
  fetchCatalogItems,
  fetchCenterOfferings,
  fetchPricePlans
} from '~/entities/care-catalog/care-catalog-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import type { PricePlanRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { OfferingEditor, PricePlanEditor } from './service-editors'

const key = 'centerManager.services' as const
type PlanEditorState = { mode: 'create' } | { mode: 'edit'; plan: PricePlanRecord } | null

export function ManagerServicesPage() {
  const { t, i18n } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? ''
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [offeringEditor, setOfferingEditor] = useState<'create' | 'edit' | null>(null)
  const [planEditor, setPlanEditor] = useState<PlanEditorState>(null)
  useDocumentTitle(t(`${key}.documentTitle`))

  const offerings = useQuery({
    queryKey: careCatalogKeys.centerOfferings(centerId),
    queryFn: () => fetchCenterOfferings(centerId),
    enabled: Boolean(centerId),
    retry: false
  })
  const catalog = useQuery({
    queryKey: careCatalogKeys.items,
    queryFn: fetchCatalogItems,
    enabled: Boolean(centerId && offeringEditor === 'create'),
    retry: false
  })
  const all = offerings.data ?? []
  const selected = all.find((offering) => offering.id === params.get('offering')) ?? all[0]
  const plans = useQuery({
    queryKey: careCatalogKeys.pricePlans(selected?.id ?? ''),
    queryFn: () => fetchPricePlans(selected!.id),
    enabled: Boolean(selected),
    retry: false
  })
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
  const number = new Intl.NumberFormat(locale)
  const normalized = search.trim().toLocaleLowerCase(locale)
  const visible = all.filter((offering) =>
    `${offering.catalogItem.name} ${offering.catalogItem.category}`.toLocaleLowerCase(locale).includes(normalized)
  )

  function selectOffering(id: string) {
    setPlanEditor(null)
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('offering', id)
      return next
    })
  }

  return (
    <div className='mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:py-10'>
      <nav aria-label={t('centerManager.menu')} className='flex items-center gap-2 text-xs text-on-surface-variant'>
        <Link className='hover:text-primary' to='/center-manager'>
          {t('centerManager.role')}
        </Link>
        <Icon className='text-sm' name='chevron_right' />
        <span className='font-semibold text-primary'>{t('centerManager.serviceMenu')}</span>
      </nav>

      <header className='grid gap-5 border-b border-outline-variant/50 pb-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end'>
        <div>
          <p className='mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary'>{t(`${key}.eyebrow`)}</p>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>{t(`${key}.title`)}</h1>
          <p className='mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base'>
            {t(`${key}.subtitle`)}
          </p>
        </div>
        <button
          className='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-transform hover:opacity-95 active:translate-y-0.5 disabled:opacity-50'
          disabled={!centerId || !offerings.isSuccess}
          onClick={() => setOfferingEditor('create')}
          type='button'
        >
          <Icon name='add' /> {t(`${key}.addOffering`)}
        </button>
      </header>

      {!centerId ? (
        <div
          className='rounded-2xl border border-outline-variant/60 bg-white p-8 text-sm text-on-surface-variant'
          role='alert'
        >
          {t(`${key}.noCenter`)}
        </div>
      ) : offerings.isPending ? (
        <div className='grid gap-4 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]' role='status'>
          <div className='h-80 animate-pulse rounded-2xl bg-surface-container' />
          <div className='h-80 animate-pulse rounded-2xl bg-surface-container' />
          <span className='sr-only'>{t(`${key}.loading`)}</span>
        </div>
      ) : offerings.isError ? (
        <div className='rounded-2xl border border-outline-variant/60 bg-white p-8' role='alert'>
          <p className='text-sm'>
            {t(careCatalogErrorStatus(offerings.error) === 403 ? `${key}.forbidden` : `${key}.loadError`)}
          </p>
          {careCatalogErrorStatus(offerings.error) !== 403 ? (
            <button
              className='mt-4 min-h-11 text-sm font-bold text-primary underline'
              onClick={() => void offerings.refetch()}
              type='button'
            >
              {t(`${key}.retry`)}
            </button>
          ) : null}
        </div>
      ) : (
        <div className='grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)] lg:items-start'>
          <section className='overflow-hidden rounded-2xl border border-outline-variant/50 bg-white'>
            <div className='border-b border-outline-variant/40 p-5'>
              <div className='mb-4 flex items-baseline justify-between gap-3'>
                <h2 className='text-lg font-bold'>{t(`${key}.count`, { count: all.length })}</h2>
                <span className='text-xs font-semibold text-primary'>
                  {t(`${key}.activeCount`, { count: all.filter((offering) => offering.status === 'ACTIVE').length })}
                </span>
              </div>
              <label className='block text-xs font-semibold text-on-surface-variant'>
                {t(`${key}.search`)}
                <input
                  className='mt-2 min-h-11 w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t(`${key}.searchPlaceholder`)}
                  type='search'
                  value={search}
                />
              </label>
            </div>
            {all.length === 0 ? (
              <div className='p-8 text-center text-sm leading-6 text-on-surface-variant'>{t(`${key}.empty`)}</div>
            ) : visible.length === 0 ? (
              <div className='p-8 text-center text-sm text-on-surface-variant'>{t(`${key}.noMatches`)}</div>
            ) : (
              <ul className='max-h-[65dvh] divide-y divide-outline-variant/40 overflow-y-auto'>
                {visible.map((offering) => (
                  <li key={offering.id}>
                    <button
                      aria-pressed={selected?.id === offering.id}
                      className={`w-full px-5 py-4 text-left transition-colors hover:bg-surface-container-low ${selected?.id === offering.id ? 'border-l-[3px] border-primary bg-primary/5 pl-[17px]' : ''}`}
                      onClick={() => selectOffering(offering.id)}
                      type='button'
                    >
                      <span className='block text-sm font-bold'>{offering.catalogItem.name}</span>
                      <span className='mt-1 block text-xs text-on-surface-variant'>
                        {offering.catalogItem.category}
                      </span>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${offering.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                      >
                        {t(`${key}.statuses.${offering.status}`)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {selected ? (
            <section className='min-w-0 overflow-hidden rounded-2xl border border-outline-variant/50 bg-white'>
              <div className='border-b border-outline-variant/40 p-5 sm:p-7'>
                <div className='flex flex-wrap items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <p className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>
                      {selected.catalogItem.category}
                    </p>
                    <h2 className='mt-2 break-words text-2xl font-bold tracking-tight'>{selected.catalogItem.name}</h2>
                  </div>
                  <button
                    className='min-h-11 rounded-xl border border-outline-variant/70 px-4 text-sm font-bold hover:bg-surface-container-low'
                    onClick={() => setOfferingEditor('edit')}
                    type='button'
                  >
                    {t(`${key}.editOffering`)}
                  </button>
                </div>
                <p className='mt-4 text-sm leading-6 text-on-surface-variant'>
                  {selected.description || selected.catalogItem.description || t(`${key}.descriptionFallback`)}
                </p>
                {selected.catalogItem.status !== 'ACTIVE' ? (
                  <p className='mt-3 text-xs font-semibold text-error'>{t(`${key}.catalogInactive`)}</p>
                ) : null}
              </div>
              <div className='p-5 sm:p-7'>
                <div className='flex flex-wrap items-start justify-between gap-4'>
                  <div>
                    <h3 className='text-lg font-bold'>{t(`${key}.plans`)}</h3>
                    <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.plansHint`)}</p>
                  </div>
                  <button
                    className='min-h-11 rounded-xl bg-primary/10 px-4 text-sm font-bold text-primary hover:bg-primary/15'
                    disabled={plans.isError && careCatalogErrorStatus(plans.error) === 403}
                    onClick={() => setPlanEditor({ mode: 'create' })}
                    type='button'
                  >
                    {t(`${key}.addPlan`)}
                  </button>
                </div>
                {plans.isPending ? (
                  <p className='mt-6 text-sm text-on-surface-variant' role='status'>
                    {t(`${key}.plansLoading`)}
                  </p>
                ) : plans.isError ? (
                  <div className='mt-6 text-sm text-error' role='alert'>
                    {t(careCatalogErrorStatus(plans.error) === 403 ? `${key}.forbidden` : `${key}.plansError`)}{' '}
                    {careCatalogErrorStatus(plans.error) !== 403 ? (
                      <button className='font-semibold underline' onClick={() => void plans.refetch()} type='button'>
                        {t(`${key}.retry`)}
                      </button>
                    ) : null}
                  </div>
                ) : plans.data.length === 0 ? (
                  <p className='mt-6 rounded-xl bg-surface-container-low p-5 text-sm text-on-surface-variant'>
                    {t(`${key}.plansEmpty`)}
                  </p>
                ) : (
                  <ul className='mt-6 divide-y divide-outline-variant/50 border-t border-outline-variant/50'>
                    {plans.data.map((plan) => (
                      <li className='flex flex-wrap items-center justify-between gap-3 py-4' key={plan.id}>
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <strong className='break-words text-sm'>{plan.planName}</strong>
                            {plan.isActive === false ? (
                              <span className='rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant'>
                                {t(`${key}.planInactive`)}
                              </span>
                            ) : null}
                          </div>
                          <p className='mt-1 text-xs text-on-surface-variant'>
                            {t(`${key}.units.${plan.pricingUnit}`)} ·{' '}
                            {t(`${key}.duration`, { minutes: number.format(plan.durationMinutes) })}
                          </p>
                        </div>
                        <div className='flex items-center gap-3'>
                          <strong className='whitespace-nowrap text-sm text-primary'>
                            {money.format(plan.basePrice)}
                          </strong>
                          <button
                            className='min-h-11 rounded-lg px-3 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low'
                            onClick={() => setPlanEditor({ mode: 'edit', plan })}
                            type='button'
                          >
                            {t(`${key}.editPlan`)}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ) : (
            <div className='rounded-2xl border border-outline-variant/50 bg-white p-10 text-center text-sm text-on-surface-variant'>
              {t(`${key}.choose`)}
            </div>
          )}
        </div>
      )}

      {offeringEditor && centerId ? (
        <OfferingEditor
          catalog={catalog.data ?? []}
          catalogError={catalog.isError}
          catalogLoading={catalog.isPending}
          centerId={centerId}
          existingCatalogIds={new Set(all.map((offering) => offering.catalogItem.id))}
          offering={offeringEditor === 'edit' ? selected : undefined}
          onClose={() => setOfferingEditor(null)}
          onRetryCatalog={() => void catalog.refetch()}
        />
      ) : null}
      {planEditor && selected ? (
        <PricePlanEditor
          offeringId={selected.id}
          plan={planEditor.mode === 'edit' ? planEditor.plan : undefined}
          onClose={() => setPlanEditor(null)}
        />
      ) : null}
    </div>
  )
}
