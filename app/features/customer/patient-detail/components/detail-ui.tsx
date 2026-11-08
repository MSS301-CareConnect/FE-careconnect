import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

/** A titled card of the profile with its own "Edit" button (no page-wide edit mode). */
export function DetailSection({
  title,
  icon,
  editLabel,
  onEdit,
  action,
  children
}: {
  title: string
  icon: string
  /** Accessible name of the edit button, e.g. "Edit basic information". */
  editLabel?: string
  onEdit?: () => void
  /** Another header action, e.g. "Add medication". */
  action?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] sm:p-6'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='flex items-center gap-2.5 text-base font-semibold text-on-surface'>
          <span className='grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-primary'>
            <Icon className='text-xl' name={icon} />
          </span>
          {title}
        </h2>
        <div className='flex items-center gap-2'>
          {action}
          {onEdit && editLabel ? (
            <button
              aria-label={editLabel}
              className='inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
              onClick={onEdit}
              type='button'
            >
              <Icon className='text-lg' name='edit' />
              <span aria-hidden='true'>{t('customer.patientDetail.edit')}</span>
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

/** Key–value rows; empty values are left to the caller (render an AddPrompt instead). */
export function InfoList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className='grid gap-x-6 gap-y-3 sm:grid-cols-2'>
      {rows.map((row) => (
        <div className='min-w-0' key={row.label}>
          <dt className='text-xs text-on-surface-variant'>{row.label}</dt>
          <dd className='mt-0.5 text-sm font-medium break-words whitespace-pre-line text-on-surface'>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** "+ Add allergies": an empty field the customer can fill, or a quiet "Not provided" for read-only access. */
export function AddPrompt({ label, emptyLabel, onAdd }: { label: string; emptyLabel: string; onAdd?: () => void }) {
  if (!onAdd) return <span className='text-sm text-on-surface-variant'>{emptyLabel}</span>
  return (
    <button
      className='inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-lg border border-dashed py-2 text-left border-outline-variant px-3 text-sm font-medium text-primary transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
      onClick={onAdd}
      type='button'
    >
      <Icon className='shrink-0 text-lg' name='add' />
      {label}
    </button>
  )
}

/** The 115 reminder: small, always visible where health and contacts are shown. */
export function EmergencyCallout({ title, number }: { title: string; number: string }) {
  return (
    <a
      className='flex items-center gap-3 rounded-xl border border-error/20 bg-error-container/50 px-4 py-3 text-sm text-on-error-container transition-colors hover:bg-error-container focus-visible:outline-2 focus-visible:outline-error'
      href={`tel:${number}`}
    >
      <Icon className='text-xl text-error' name='emergency' />
      <span className='min-w-0 flex-1 font-medium'>{title}</span>
      <span className='text-base font-bold text-error tabular-nums'>{number}</span>
    </a>
  )
}

export interface FieldValue {
  label: string
  value?: ReactNode
}

/**
 * Filled fields as key–value rows; empty ones gathered below as "+ Add …" buttons (or one "Not provided" line for a
 * viewer), so a half-empty profile does not read as a wall of dashes.
 */
export function FieldsBlock({ fields, onAdd }: { fields: FieldValue[]; onAdd?: () => void }) {
  const { t } = useTranslation()
  const filled = fields.filter((field) => field.value !== undefined && field.value !== null && field.value !== '')
  const empty = fields.filter((field) => !filled.includes(field))
  return (
    <div className='flex flex-col gap-4'>
      {filled.length ? <InfoList rows={filled.map((field) => ({ label: field.label, value: field.value }))} /> : null}
      {empty.length ? (
        onAdd ? (
          <div className='flex flex-wrap gap-2'>
            {empty.map((field) => (
              <AddPrompt
                emptyLabel=''
                key={field.label}
                label={t('customer.patientDetail.addField', { field: field.label.toLocaleLowerCase() })}
                onAdd={onAdd}
              />
            ))}
          </div>
        ) : (
          <p className='text-sm text-on-surface-variant'>
            {t('customer.patientDetail.notProvidedList', { fields: empty.map((field) => field.label).join(', ') })}
          </p>
        )
      ) : null}
    </div>
  )
}
