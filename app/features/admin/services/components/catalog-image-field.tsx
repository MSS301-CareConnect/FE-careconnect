import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_ICONS,
  serviceCategoryGroup,
  type ServiceCategoryKey
} from '~/entities/care-catalog/service-category'
import { useServiceCategoryLabel } from '~/entities/care-catalog/use-service-category-label'
import { Icon } from '~/shared/ui/icon'

import { IMAGE_URL_MAX_LENGTH, type CatalogItemDraft, type CatalogItemFieldError } from '../catalog-item-form'
import { CATALOG_IMAGE_TYPES, useCatalogImageUpload } from '../hooks/use-catalog-image-upload'

const key = 'admin.servicesPage.form' as const

/** One suggested cover photo per platform category; picking one also fills an empty category. */
const IMAGE_PRESETS: ReadonlyArray<{ category: ServiceCategoryKey; url: string }> = [
  {
    category: 'elderly',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'rehabilitation',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'chronic',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'postSurgery',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'nursing',
    url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'motherBaby',
    url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80'
  }
]

const categoryValue = (category: ServiceCategoryKey) =>
  SERVICE_CATEGORIES.find((option) => option.key === category)?.value ?? ''

type CatalogImageFieldProps = {
  draft: CatalogItemDraft
  /** id of the link input, so the form's first-invalid focus and the label keep working. */
  inputId: string
  error: CatalogItemFieldError | undefined
  disabled: boolean
  onImageUrl: (imageUrl: string) => void
  onCategory: (category: string) => void
  control: string
}

/**
 * Cover image of a standard service: upload from the device (button or drop on the preview), paste a link, or pick a
 * suggested photo. The live card preview shows what customers will see.
 */
export function CatalogImageField({
  draft,
  inputId,
  error,
  disabled,
  onImageUrl,
  onCategory,
  control
}: CatalogImageFieldProps) {
  const { t } = useTranslation()
  const categoryLabel = useServiceCategoryLabel()
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  /** The URL whose image failed to load; a new URL is tried again without resetting state in an effect. */
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const upload = useCatalogImageUpload(onImageUrl)
  const imageUrl = draft.imageUrl ?? ''
  const showImage = imageUrl !== '' && failedUrl !== imageUrl
  const group = serviceCategoryGroup(draft.category)
  const busy = disabled || upload.isUploading
  const errorId = `${inputId}-error`
  const uploadErrorId = `${inputId}-upload-error`

  return (
    <div className='space-y-4'>
      <div>
        <p className='text-[13px] font-semibold text-on-surface'>{t(`${key}.imagePreviewTitle`)}</p>
        <div
          className={`mt-1.5 overflow-hidden rounded-xl border bg-white shadow-xs transition-colors ${
            dragging ? 'border-primary ring-2 ring-primary/30' : 'border-outline-variant/60'
          }`}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => {
            if (busy) return
            event.preventDefault()
            setDragging(true)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            if (!busy) upload.pick(event.dataTransfer.files[0])
          }}
        >
          <div className='relative h-32 w-full overflow-hidden bg-surface-container-low'>
            {showImage ? (
              <img
                alt={draft.name || t(`${key}.imagePreviewTitle`)}
                className='h-full w-full object-cover'
                onError={() => setFailedUrl(imageUrl)}
                src={imageUrl}
              />
            ) : (
              <div className='grid h-full w-full place-items-center bg-secondary-container/40'>
                <span className='grid h-12 w-12 place-items-center rounded-xl bg-white text-primary shadow-xs'>
                  <Icon className='text-2xl' name={SERVICE_CATEGORY_ICONS[group]} />
                </span>
              </div>
            )}
            <span className='absolute left-2.5 top-2.5 max-w-[80%] truncate rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-on-surface shadow-xs'>
              {draft.category ? categoryLabel(draft.category) : t(`${key}.category`)}
            </span>
            {dragging || upload.isUploading ? (
              <div className='absolute inset-0 grid place-items-center bg-on-surface/55 px-4 text-center text-sm font-semibold text-white'>
                <span className='inline-flex items-center gap-2' role={upload.isUploading ? 'status' : undefined}>
                  <Icon
                    className={`text-xl ${upload.isUploading ? 'animate-spin' : ''}`}
                    name={upload.isUploading ? 'progress_activity' : 'upload'}
                  />
                  {upload.isUploading ? t(`${key}.imageUploading`) : t(`${key}.imageDrop`)}
                </span>
              </div>
            ) : null}
          </div>
          <div className='px-3 py-2.5'>
            <p className='truncate text-sm font-bold text-on-surface'>{draft.name || t(`${key}.namePlaceholder`)}</p>
            <p className='mt-0.5 line-clamp-2 text-xs leading-5 text-on-surface-variant'>
              {draft.description || t(`${key}.descriptionPlaceholder`)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className='text-[13px] font-semibold text-on-surface'>{t(`${key}.imageUrl`)}</p>
        <button
          aria-describedby={upload.error ? uploadErrorId : undefined}
          className='mt-1.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-secondary-container/40 px-4 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary-container/70 disabled:cursor-not-allowed disabled:opacity-60'
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          type='button'
        >
          <Icon className='text-lg' name={upload.isUploading ? 'progress_activity' : 'upload'} />
          {upload.isUploading ? t(`${key}.imageUploading`) : t(imageUrl ? `${key}.imageReplace` : `${key}.imageUpload`)}
        </button>
        <input
          accept={CATALOG_IMAGE_TYPES.join(',')}
          aria-label={t(`${key}.imageUpload`)}
          className='sr-only'
          disabled={busy}
          onChange={(event) => {
            upload.pick(event.target.files?.[0])
            // Picking the same file again after an error must fire onChange again.
            event.target.value = ''
          }}
          ref={fileInput}
          tabIndex={-1}
          type='file'
        />
        <p className='mt-1 text-xs text-outline'>{t(`${key}.imageUploadHint`)}</p>
        {upload.error ? (
          <p className='mt-1 flex items-center gap-1 text-xs font-medium text-error' id={uploadErrorId} role='alert'>
            <Icon className='text-sm' name='error' />
            {t(`${key}.imageUploadErrors.${upload.error}`)}
          </p>
        ) : null}

        <label className='mt-3 block text-xs font-semibold text-on-surface-variant' htmlFor={inputId}>
          {t(`${key}.imageUrlOr`)}
        </label>
        <div className='relative'>
          <input
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className={`${control} pr-10`}
            disabled={upload.isUploading}
            id={inputId}
            maxLength={IMAGE_URL_MAX_LENGTH}
            onChange={(event) => {
              upload.clearError()
              onImageUrl(event.target.value)
            }}
            placeholder={t(`${key}.imageUrlPlaceholder`)}
            value={imageUrl}
          />
          {imageUrl ? (
            <button
              aria-label={t(`${key}.imageClear`)}
              className='absolute right-1.5 top-1/2 mt-0.75 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-on-surface'
              disabled={upload.isUploading}
              onClick={() => onImageUrl('')}
              title={t(`${key}.imageClear`)}
              type='button'
            >
              <Icon className='text-lg' name='close' />
            </button>
          ) : null}
        </div>
        {error ? (
          <p className='mt-1 flex items-center gap-1 text-xs font-medium text-error' id={errorId}>
            <Icon className='text-sm' name='error' />
            {t(`${key}.errors.${error}`)}
          </p>
        ) : null}
      </div>

      <div>
        <p className='text-[13px] font-semibold text-on-surface'>{t(`${key}.imagePresetsShort`)}</p>
        <div className='mt-2 grid grid-cols-3 gap-2'>
          {IMAGE_PRESETS.map((preset) => {
            const label = t(`common.serviceCategories.${preset.category}`)
            const isSelected = imageUrl === preset.url
            return (
              <button
                aria-label={label}
                aria-pressed={isSelected}
                className={`group relative overflow-hidden rounded-lg text-left ring-offset-1 transition-shadow disabled:opacity-60 ${
                  isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-outline-variant/60 hover:ring-primary/60'
                }`}
                disabled={upload.isUploading}
                key={preset.category}
                onClick={() => {
                  upload.clearError()
                  onImageUrl(preset.url)
                  if (!draft.category) onCategory(categoryValue(preset.category))
                }}
                title={label}
                type='button'
              >
                <img
                  alt=''
                  className='aspect-[4/3] w-full object-cover transition-transform duration-200 group-hover:scale-105'
                  loading='lazy'
                  src={preset.url}
                />
                <span className='absolute inset-x-0 bottom-0 truncate bg-on-surface/65 px-1.5 py-0.5 text-[10px] font-semibold text-white'>
                  {label}
                </span>
                {isSelected ? (
                  <span className='absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-on-primary'>
                    <Icon className='text-sm' name='check' />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
