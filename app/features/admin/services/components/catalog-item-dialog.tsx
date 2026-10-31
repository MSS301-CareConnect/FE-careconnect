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
import { CategorySelect } from './category-select'

const key = 'admin.servicesPage.form' as const
const control =
  'mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid=true]:bg-error-container/40 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error/60'

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
}

function Field({ id, label, required, error, children, hint }: FieldProps) {
  const { t } = useTranslation()
  const errorId = `${id}-error`
  return (
    <div>
      <label className='text-xs font-semibold text-on-surface-variant' htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden='true' className='ml-0.5 text-error' title={t(`${key}.required`)}>
            *
          </span>
        ) : null}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      <div className='mt-1 flex justify-between gap-3 text-xs'>
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
      className='fixed inset-0 z-50 overflow-y-auto bg-on-surface/50 p-4'
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !isSaving) onClose()
      }}
      role='presentation'
    >
      <section
        aria-labelledby={titleId}
        aria-modal='true'
        className='mx-auto my-10 w-full max-w-xl rounded-xl bg-white p-6 shadow-xl'
        role='dialog'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-xl font-bold' id={titleId}>
              {t(item ? `${key}.editTitle` : `${key}.createTitle`)}
            </h2>
            <p className='mt-1 text-sm text-outline'>{t(`${key}.hint`)}</p>
          </div>
          <button
            aria-label={t('admin.servicesPage.close')}
            className='rounded-lg p-1 text-outline hover:bg-surface-container-low'
            disabled={isSaving}
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <form
          className='mt-5 space-y-4'
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          ref={formRef}
        >
          {formError ? (
            <div
              className='flex items-start gap-2 rounded-lg bg-error-container/40 p-3 text-sm text-error'
              ref={alertRef}
              role='alert'
            >
              <Icon className='text-lg' name='error' />
              <p>{t(`${key}.formErrors.${formError}`)}</p>
            </div>
          ) : null}
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
          <Field
            error={errors.description}
            hint={
              <span className='shrink-0 text-outline'>
                {t(`${key}.descriptionCount`, { count: draft.description.length, max: DESCRIPTION_MAX_LENGTH })}
              </span>
            }
            id={fieldId('description')}
            label={t(`${key}.description`)}
          >
            {(props) => (
              <textarea
                {...props}
                className={`${control} min-h-28 resize-y`}
                onChange={(event) => update('description', event.target.value)}
                placeholder={t(`${key}.descriptionPlaceholder`)}
                value={draft.description}
              />
            )}
          </Field>
          <Field error={errors.status} id={fieldId('status')} label={t(`${key}.status`)} required>
            {(props) => (
              <select
                {...props}
                className={control}
                onChange={(event) => update('status', catalogStatuses.find((s) => s === event.target.value) ?? '')}
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
          <div className='flex justify-end gap-2 pt-2'>
            <button
              className='rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold'
              disabled={isSaving}
              onClick={onClose}
              type='button'
            >
              {t(`${key}.cancel`)}
            </button>
            <button
              className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
              disabled={isSaving}
              type='submit'
            >
              <Icon className='text-lg' name={item ? 'save' : 'add_circle'} />
              {isSaving ? t(`${key}.saving`) : t(item ? `${key}.save` : `${key}.create`)}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
