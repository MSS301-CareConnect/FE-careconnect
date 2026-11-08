import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { SERVICE_CATEGORY_ICONS, serviceCategoryGroup } from '~/entities/care-catalog/service-category'
import { useServiceCategoryLabel } from '~/entities/care-catalog/use-service-category-label'
import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { CatalogStatusBadge } from './catalog-status-badge'

const key = 'admin.servicesPage.viewDialog' as const

type CatalogItemViewDialogProps = {
  item: CatalogItemRecord
  onClose: () => void
  onEdit: () => void
}

/** Balanced 2-column view dialog for standard catalog services (no scrolling required). */
export function CatalogItemViewDialog({ item, onClose, onEdit }: CatalogItemViewDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const categoryLabel = useServiceCategoryLabel()
  const group = serviceCategoryGroup(item.category)

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-xs'
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
      role='presentation'
    >
      <section
        aria-labelledby={titleId}
        aria-modal='true'
        className='w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto'
        role='dialog'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-outline-variant/40 px-6 py-3.5 shrink-0'>
          <div className='flex items-center gap-2.5'>
            <span className='grid h-8 w-8 place-items-center rounded-xl bg-secondary-container/60 text-primary'>
              <Icon className='text-lg' name='visibility' />
            </span>
            <h2 className='text-lg font-bold tracking-tight text-on-surface' id={titleId}>
              {t(`${key}.title`)}
            </h2>
          </div>
          <button
            aria-label={t(`${key}.close`)}
            className='rounded-xl p-1.5 text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface'
            onClick={onClose}
            type='button'
          >
            <Icon className='text-xl' name='close' />
          </button>
        </div>

        {/* 2-Column Balanced Content Body */}
        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start overflow-y-auto flex-1'>
          {/* Left Column: Details */}
          <div className='space-y-4'>
            <div>
              <span className='text-xs font-semibold uppercase tracking-wider text-outline'>
                {t('admin.servicesPage.columns.service')}
              </span>
              <h3 className='mt-1 text-xl font-extrabold tracking-tight text-on-surface'>{item.name}</h3>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <div>
                <span className='block text-xs font-semibold text-outline mb-1'>{t(`${key}.category`)}</span>
                <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary-container/70 px-3 py-1 text-xs font-bold text-primary'>
                  <Icon className='text-sm' name={SERVICE_CATEGORY_ICONS[group]} />
                  {categoryLabel(item.category)}
                </span>
              </div>

              <div>
                <span className='block text-xs font-semibold text-outline mb-1'>{t(`${key}.status`)}</span>
                <CatalogStatusBadge status={item.status} />
              </div>
            </div>

            <div>
              <span className='block text-xs font-semibold text-outline mb-1.5'>{t(`${key}.description`)}</span>
              <div className='rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3.5 text-sm leading-6 text-on-surface min-h-[90px]'>
                {item.description || (
                  <span className='italic text-outline'>{t('admin.servicesPage.noDescription')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview */}
          <div className='space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest/60 p-4'>
            <span className='block text-xs font-bold uppercase tracking-wider text-outline'>{t(`${key}.preview`)}</span>
            <div className='overflow-hidden rounded-xl border border-outline-variant/60 bg-white shadow-xs'>
              <div className='relative aspect-[16/10] w-full overflow-hidden bg-surface-container-low'>
                {item.imageUrl ? (
                  <img alt={item.name} className='h-full w-full object-cover' src={item.imageUrl} />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-primary-fixed/20'>
                    <span className='grid h-14 w-14 place-items-center rounded-2xl bg-white/90 text-primary shadow-xs'>
                      <Icon className='text-3xl' name={SERVICE_CATEGORY_ICONS[group]} />
                    </span>
                  </div>
                )}
                <span className='absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-on-surface shadow-xs'>
                  <Icon className='text-sm text-primary' name={SERVICE_CATEGORY_ICONS[group]} />
                  {categoryLabel(item.category)}
                </span>
              </div>
              <div className='p-3.5'>
                <p className='truncate text-sm font-bold text-on-surface'>{item.name}</p>
                <p className='mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant'>
                  {item.description || t('admin.servicesPage.noDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with pinned buttons */}
        <div className='flex items-center justify-end gap-3 border-t border-outline-variant/40 bg-surface-container-lowest/80 px-6 py-3 shrink-0'>
          <button
            className='rounded-xl bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container'
            onClick={onClose}
            type='button'
          >
            {t(`${key}.close`)}
          </button>
          <button
            className='inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary/90'
            onClick={onEdit}
            type='button'
          >
            <Icon className='text-lg' name='tune' />
            {t(`${key}.edit`)}
          </button>
        </div>
      </section>
    </div>
  )
}
