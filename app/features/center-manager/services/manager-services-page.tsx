import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import {
  careCatalogErrorStatus,
  careCatalogKeys,
  fetchCatalogItems,
  fetchCenterOfferings,
  fetchPricePlans
} from '~/entities/care-catalog/care-catalog-api'
import { planPrice } from '~/entities/care-catalog/price-plan-price'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import type { CenterOfferingRecord, PricePlanRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'
import { DeleteOfferingDialog, DeletePlanDialog } from './components/delete-dialogs'
import { OfferingList } from './components/offering-list'
import { PlansHeading, PricePlanTable } from './components/price-plan-table'
import { OfferingCreateDialog, OfferingEditDialog, PricePlanEditor } from './service-editors'

const key = 'centerManager.services' as const
type PlanEditorState = { mode: 'create' } | { mode: 'edit'; plan: PricePlanRecord } | null

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className='flex items-center gap-3 rounded-2xl border border-outline-variant/50 bg-white px-4 py-3'>
      <span className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
        <Icon name={icon} />
      </span>
      <span>
        <strong className='block text-xl leading-tight tabular-nums'>{value}</strong>
        <span className='text-xs text-on-surface-variant'>{label}</span>
      </span>
    </div>
  )
}

function CenterStats({ offerings }: { offerings: CenterOfferingRecord[] }) {
  const { t } = useTranslation()
  const plans = offerings.flatMap((offering) => offering.pricePlans ?? [])
  const activePlans = plans.filter((plan) => plan.isActive !== false)
  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      <Stat
        icon='medical_services'
        label={t(`${key}.stats.services`)}
        value={offerings.filter((offering) => offering.status === 'ACTIVE').length}
      />
      <Stat icon='sell' label={t(`${key}.stats.activePlans`)} value={activePlans.length} />
      <Stat
        icon='percent'
        label={t(`${key}.stats.discounted`)}
        value={activePlans.filter((plan) => planPrice(plan).discountPercent > 0).length}
      />
    </div>
  )
}

export function ManagerServicesPage() {
  const { t, i18n } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? ''
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [offeringEditor, setOfferingEditor] = useState<'create' | 'edit' | null>(null)
  const [planEditor, setPlanEditor] = useState<PlanEditorState>(null)
  const [deleting, setDeleting] = useState<{ kind: 'offering' } | { kind: 'plan'; plan: PricePlanRecord } | null>(null)
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
  const normalized = search.trim().toLocaleLowerCase(locale)
  const visible = all.filter((offering) =>
    `${offering.catalogItem.name} ${offering.catalogItem.category}`.toLocaleLowerCase(locale).includes(normalized)
  )
  const hasActivePlan = plans.data?.some((plan) => plan.isActive !== false)
  const addPlanButton = (
    <button
      className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary/10 px-4 text-sm font-bold text-primary hover:bg-primary/15'
      disabled={plans.isError && careCatalogErrorStatus(plans.error) === 403}
      onClick={() => setPlanEditor({ mode: 'create' })}
      type='button'
    >
      <Icon name='add' /> {t(`${key}.addPlan`)}
    </button>
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
    <div className={`${bentoContainer} space-y-7`}>
      <BentoPageHeader
        actions={
          <button
            className='inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-peach-300 px-6 text-sm font-bold text-forest-950 shadow-[0_10px_24px_-12px_rgb(246_146_95/0.8)] transition-[background-color,transform] hover:bg-peach-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-200 active:scale-[0.97] disabled:opacity-50'
            disabled={!centerId || !offerings.isSuccess}
            onClick={() => setOfferingEditor('create')}
            type='button'
          >
            <Icon name='add' /> {t(`${key}.addOffering`)}
          </button>
        }
        description={t(`${key}.subtitle`)}
        eyebrow={t(`${key}.eyebrow`)}
        icon='medical_information'
        title={t(`${key}.title`)}
        variant='hero'
      />

      {!centerId ? (
        <div
          className='rounded-2xl border border-outline-variant/60 bg-white p-8 text-sm text-on-surface-variant'
          role='alert'
        >
          {t(`${key}.noCenter`)}
        </div>
      ) : offerings.isPending ? (
        <div className='grid gap-4 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.6fr)]' role='status'>
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
        <>
          {all.length ? <CenterStats offerings={all} /> : null}
          <div className='grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(260px,0.62fr)_minmax(0,1.6fr)] lg:items-start'>
            <section className='overflow-hidden rounded-2xl border border-outline-variant/50 bg-white lg:sticky lg:top-6'>
              <div className='border-b border-outline-variant/40 p-5'>
                <div className='mb-4 flex items-baseline justify-between gap-3'>
                  <h2 className='text-lg font-bold'>{t(`${key}.count`, { count: all.length })}</h2>
                  <span className='text-xs font-semibold text-primary'>
                    {t(`${key}.activeCount`, { count: all.filter((offering) => offering.status === 'ACTIVE').length })}
                  </span>
                </div>
                <label className='relative block'>
                  <span className='sr-only'>{t(`${key}.search`)}</span>
                  <span className='pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant'>
                    <Icon name='search' />
                  </span>
                  <input
                    className='min-h-11 w-full rounded-xl border border-outline-variant/60 bg-surface-container-low pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
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
                <OfferingList offerings={visible} onSelect={selectOffering} selectedId={selected?.id} />
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
                      <div className='mt-2 flex flex-wrap items-center gap-3'>
                        <h2 className='break-words text-2xl font-bold tracking-tight'>{selected.catalogItem.name}</h2>
                        <ProviderStatusBadge label={t(`${key}.statuses.${selected.status}`)} status={selected.status} />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        className='inline-flex min-h-11 items-center gap-2 rounded-xl border border-outline-variant/70 px-4 text-sm font-bold hover:bg-surface-container-low'
                        onClick={() => setOfferingEditor('edit')}
                        type='button'
                      >
                        <Icon name='edit' /> {t(`${key}.editOffering`)}
                      </button>
                      <button
                        aria-label={t(`${key}.deleteOffering`)}
                        className='inline-flex size-11 items-center justify-center rounded-xl border border-outline-variant/70 text-on-surface-variant hover:border-error/40 hover:bg-error/10 hover:text-error'
                        onClick={() => setDeleting({ kind: 'offering' })}
                        title={t(`${key}.deleteOffering`)}
                        type='button'
                      >
                        <Icon name='delete' />
                      </button>
                    </div>
                  </div>
                  <p className='mt-4 max-w-3xl text-sm leading-6 text-on-surface-variant'>
                    {selected.description || selected.catalogItem.description || t(`${key}.descriptionFallback`)}
                  </p>
                  {selected.catalogItem.status !== 'ACTIVE' ? (
                    <p className='mt-3 text-xs font-semibold text-error'>{t(`${key}.catalogInactive`)}</p>
                  ) : plans.isSuccess && !hasActivePlan ? (
                    <p className='mt-3 inline-flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2 text-xs font-semibold text-warning'>
                      <Icon name='visibility_off' /> {t(`${key}.notSellable`)}
                    </p>
                  ) : null}
                </div>
                <div className='p-5 sm:p-7'>
                  {plans.isSuccess && plans.data.length > 0 ? (
                    <PricePlanTable
                      addPlanButton={addPlanButton}
                      key={selected.id}
                      offeringId={selected.id}
                      onDeletePlan={(plan) => setDeleting({ kind: 'plan', plan })}
                      onEditPlan={(plan) => setPlanEditor({ mode: 'edit', plan })}
                      plans={plans.data}
                    />
                  ) : (
                    <>
                      <PlansHeading actions={addPlanButton} />
                      {plans.isPending ? (
                        <p className='text-sm text-on-surface-variant' role='status'>
                          {t(`${key}.plansLoading`)}
                        </p>
                      ) : plans.isError ? (
                        <div className='text-sm text-error' role='alert'>
                          {t(careCatalogErrorStatus(plans.error) === 403 ? `${key}.forbidden` : `${key}.plansError`)}{' '}
                          {careCatalogErrorStatus(plans.error) !== 403 ? (
                            <button
                              className='font-semibold underline'
                              onClick={() => void plans.refetch()}
                              type='button'
                            >
                              {t(`${key}.retry`)}
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <p className='rounded-xl bg-surface-container-low p-5 text-sm text-on-surface-variant'>
                          {t(`${key}.plansEmpty`)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </section>
            ) : (
              <div className='rounded-2xl border border-outline-variant/50 bg-white p-10 text-center text-sm text-on-surface-variant'>
                {t(`${key}.choose`)}
              </div>
            )}
          </div>
        </>
      )}

      {offeringEditor === 'create' && centerId ? (
        <OfferingCreateDialog
          catalog={catalog.data ?? []}
          catalogError={catalog.isError}
          catalogLoading={catalog.isPending}
          centerId={centerId}
          existingCatalogIds={new Set(all.map((offering) => offering.catalogItem.id))}
          onClose={() => setOfferingEditor(null)}
          onCreated={(id) => {
            setOfferingEditor(null)
            selectOffering(id)
          }}
          onRetryCatalog={() => void catalog.refetch()}
        />
      ) : null}
      {offeringEditor === 'edit' && centerId && selected ? (
        <OfferingEditDialog centerId={centerId} offering={selected} onClose={() => setOfferingEditor(null)} />
      ) : null}
      {deleting?.kind === 'offering' && selected ? (
        <DeleteOfferingDialog
          activePlanCount={(plans.data ?? selected.pricePlans ?? []).filter((plan) => plan.isActive !== false).length}
          offering={selected}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null)
            setParams((previous) => {
              const next = new URLSearchParams(previous)
              next.delete('offering')
              return next
            })
          }}
        />
      ) : null}
      {deleting?.kind === 'plan' ? (
        <DeletePlanDialog
          lastActive={
            deleting.plan.isActive !== false &&
            (plans.data ?? []).filter((plan) => plan.isActive !== false).length === 1
          }
          onClose={() => setDeleting(null)}
          plan={deleting.plan}
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
