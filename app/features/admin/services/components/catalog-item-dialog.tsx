import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  type CatalogItemField,
  type CatalogItemFieldError
} from '../catalog-item-form'
import { catalogStatuses } from '../hooks/use-catalog-list'
import { useCatalogItemForm } from '../hooks/use-catalog-item-form'
import { CatalogImageField } from './catalog-image-field'
import { CategorySelect } from './category-select'

const key = 'admin.servicesPage.form' as const
const controlBase =
  'mt-1.5 w-full rounded-xl border border-outline-variant/60 bg-surface-container-low px-3.5 text-sm text-on-surface outline-none transition-colors placeholder:text-outline hover:border-primary/40 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-error aria-[invalid=true]:bg-error-container/30 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error/25'
/** Single-line controls share one height; selects keep the text and the picker icon on one line. */
const control = `${controlBase} h-11 min-w-0 whitespace-nowrap`

/** Moves focus to the first control marked invalid, in form order, and brings it into view. */
function focusFirstInvalid(root: HTMLElement | null) {
  const invalid = root?.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (!invalid) return
  invalid.focus({ preventScroll: true })
  invalid.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
}

type FieldProps = {
  id: string
  label: string
  required?: boolean
  error: CatalogItemFieldError | undefined
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
  hint?: ReactNode
  className?: string
}

function Field({ id, label, required, error, children, hint, className = '' }: FieldProps) {
  const { t } = useTranslation()
  const errorId = `${id}-error`
  return (
    <div className={`min-w-0 ${className}`}>
      <label className='text-[13px] font-semibold text-on-surface' htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden='true' className='ml-0.5 text-error' title={t(`${key}.required`)}>
            *
          </span>
        ) : null}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      {error || hint ? (
        <div className='mt-1 flex justify-between gap-2 text-xs'>
          {error ? (
            <p className='flex items-center gap-1 font-medium text-error' id={errorId}>
              <Icon className='text-sm' name='error' />
              {t(`${key}.errors.${error}`)}
            </p>
          ) : (
            <span />
          )}
          {hint}
        </div>
      ) : null}
    </div>
  )
}

type CatalogItemDialogProps = {
  item?: CatalogItemRecord
  onClose: () => void
}

export function CatalogItemDialog({ item, onClose }: CatalogItemDialogProps) {
  const { t } = useTranslation()
  const idPrefix = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const { draft, update, errors, formError, focusRequest, submit, isSaving } = useCatalogItemForm(item, onClose)
  const fieldId = (field: CatalogItemField) => `${idPrefix}-${field}`
  const titleId = `${idPrefix}-title`

  useEffect(() => {
    if (focusRequest > 0) focusFirstInvalid(formRef.current)
  }, [focusRequest])

  useEffect(() => {
    if (formError) alertRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }, [formError])

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-on-surface/50 backdrop-blur-xs sm:items-center sm:p-4'
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !isSaving) onClose()
      }}
      role='presentation'
    >
      <section
        aria-labelledby={titleId}
        aria-modal='true'
        className='flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:my-auto sm:max-h-[90dvh] sm:rounded-2xl'
        role='dialog'
      >
        <header className='flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/40 px-5 py-4 sm:px-6'>
          <div className='min-w-0'>
            <h2 className='text-lg font-bold tracking-tight text-on-surface' id={titleId}>
              {t(item ? `${key}.editTitle` : `${key}.createTitle`)}
            </h2>
            <p className='mt-0.5 text-[13px] leading-5 text-on-surface-variant'>{t(`${key}.hint`)}</p>
          </div>
          <button
            aria-label={t('admin.servicesPage.close')}
            className='grid h-10 w-10 shrink-0 place-items-center rounded-xl text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface'
            disabled={isSaving}
            onClick={onClose}
            type='button'
          >
            <Icon className='text-xl' name='close' />
          </button>
        </header>

        <form
          className='flex min-h-0 flex-1 flex-col'
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          ref={formRef}
        >
          <div className='min-h-0 flex-1 overflow-y-auto'>
            {formError ? (
              <div
                className='mx-5 mt-5 flex items-start gap-2 rounded-xl bg-error-container/40 p-3 text-sm text-error sm:mx-6'
                ref={alertRef}
                role='alert'
              >
                <Icon className='text-lg' name='error' />
                <p>{t(`${key}.formErrors.${formError}`)}</p>
              </div>
            ) : null}

            <div className='grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_19rem] md:gap-7'>
              {/* Service details */}
              <div className='flex flex-col gap-4'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-outline'>
                  {t(`${key}.detailsSection`)}
                </h3>
                <Field error={errors.name} id={fieldId('name')} label={t(`${key}.name`)} required>
                  {(props) => (
                    <input
                      {...props}
                      autoFocus
                      className={control}
                      maxLength={NAME_MAX_LENGTH}
                      onChange={(event) => update('name', event.target.value)}
                      placeholder={t(`${key}.namePlaceholder`)}
                      value={draft.name}
                    />
                  )}
                </Field>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <Field error={errors.category} id={fieldId('category')} label={t(`${key}.category`)} required>
                    {(props) => (
                      <CategorySelect
                        className={control}
                        controlProps={props}
                        onChange={(value) => update('category', value)}
                        value={draft.category}
                      />
                    )}
                  </Field>

                  <Field error={errors.status} id={fieldId('status')} label={t(`${key}.status`)} required>
                    {(props) => (
                      <select
                        {...props}
                        className={control}
                        onChange={(event) =>
                          update('status', catalogStatuses.find((s) => s === event.target.value) ?? '')
                        }
                        value={draft.status}
                      >
                        {catalogStatuses.map((status) => (
                          <option key={status} value={status}>
                            {t(`admin.servicesPage.statuses.${status}`)}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>

                <Field
                  className='flex flex-1 flex-col'
                  error={errors.description}
                  hint={
                    <span className='shrink-0 tabular-nums text-outline'>
                      {t(`${key}.descriptionCount`, { count: draft.description.length, max: DESCRIPTION_MAX_LENGTH })}
                    </span>
                  }
                  id={fieldId('description')}
                  label={t(`${key}.description`)}
                >
                  {(props) => (
                    <textarea
                      {...props}
                      className={`${controlBase} min-h-36 flex-1 resize-none py-2.5 leading-6`}
                      onChange={(event) => update('description', event.target.value)}
                      placeholder={t(`${key}.descriptionPlaceholder`)}
                      value={draft.description}
                    />
                  )}
                </Field>
              </div>

              {/* Image and live card preview */}
              <aside className='space-y-4 md:border-l md:border-outline-variant/40 md:pl-7'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-outline'>{t(`${key}.mediaSection`)}</h3>
                <CatalogImageField
                  control={control}
                  disabled={isSaving}
                  draft={draft}
                  error={errors.imageUrl}
                  inputId={fieldId('imageUrl')}
                  onCategory={(value) => update('category', value)}
                  onImageUrl={(value) => update('imageUrl', value)}
                />
              </aside>
            </div>
          </div>

          <footer className='flex shrink-0 items-center justify-end gap-3 border-t border-outline-variant/40 bg-surface-container-lowest px-5 py-3.5 sm:px-6'>
            <button
              className='h-11 rounded-xl bg-surface-container-low px-5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container'
              disabled={isSaving}
              onClick={onClose}
              type='button'
            >
              {t(`${key}.cancel`)}
            </button>
            <button
              className='inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-container disabled:opacity-60'
              disabled={isSaving}
              type='submit'
            >
              <Icon className='text-lg' name={item ? 'save' : 'add_circle'} />
              {isSaving ? t(`${key}.saving`) : t(item ? `${key}.save` : `${key}.create`)}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
