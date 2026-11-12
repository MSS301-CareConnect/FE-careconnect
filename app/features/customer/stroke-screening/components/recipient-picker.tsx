import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { FormField, Select } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'

import type { StrokeScreeningState } from '../hooks/use-stroke-screening'
import { FormSection } from './form-parts'

const key = 'customer.strokeScreening.recipient' as const

/**
 * Who the screening is for: a family profile (prefills age, sex and BMI from CareRecipientService) or manual entry.
 * The profile's chronic conditions are shown as a reference only — the history answers stay the customer's own.
 */
export function RecipientPicker({ state }: { state: StrokeScreeningState }) {
  const { t } = useTranslation()
  const { recipients, recipientId, prefill, profile } = state
  const items = recipients.data?.items ?? []
  const fields = prefill?.prefilled.map((field) => t(`${key}.fields.${field}`)).join(', ')

  return (
    <FormSection description={t(`${key}.description`)} icon='family_restroom' title={t(`${key}.title`)}>
      <FormField
        hint={recipients.isPending ? t(`${key}.loading`) : recipients.isError ? t(`${key}.listError`) : undefined}
        label={t(`${key}.label`)}
      >
        {(props) => (
          <Select
            {...props}
            disabled={recipients.isPending || profile.isPending}
            onChange={(event) => state.chooseRecipient(event.target.value)}
            value={recipientId}
          >
            <option value=''>{t(`${key}.manual`)}</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      {recipients.isSuccess && items.length === 0 ? (
        <p className='mt-3 flex flex-wrap items-center gap-x-2 text-sm text-on-surface-variant'>
          {t(`${key}.empty`)}
          <Link
            className='font-semibold text-forest-800 underline-offset-2 hover:underline'
            to='/customer/patient-profiles/new'
          >
            {t(`${key}.createLink`)}
          </Link>
        </p>
      ) : null}

      <div aria-live='polite'>
        {profile.isPending ? (
          <p className='mt-3 flex items-center gap-2 text-sm text-on-surface-variant'>
            <Icon className='animate-spin text-lg' name='progress_activity' />
            {t(`${key}.loading`)}
          </p>
        ) : null}
        {profile.isError ? <p className='mt-3 text-sm font-medium text-error'>{t(`${key}.fetchError`)}</p> : null}
        {prefill ? (
          <div className='cc-fade-up mt-4 space-y-3'>
            <p className='flex items-start gap-2 rounded-2xl bg-mint-50 px-4 py-3 text-sm text-forest-900 ring-1 ring-mint-200/70'>
              <Icon className='mt-px text-lg text-forest-700' name={fields ? 'task_alt' : 'info'} />
              <span>
                {fields
                  ? t(`${key}.prefilled`, { name: prefill.name, fields })
                  : t(`${key}.prefilledNone`, { name: prefill.name })}
              </span>
            </p>
            {prefill.chronicConditions ? (
              <div className='rounded-2xl border border-outline-variant px-4 py-3 text-sm'>
                <p className='font-semibold text-on-surface'>{t(`${key}.conditions`)}</p>
                <p className='mt-0.5 text-on-surface'>{prefill.chronicConditions}</p>
                <p className='mt-1 text-xs text-on-surface-variant'>{t(`${key}.conditionsHint`)}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormSection>
  )
}
