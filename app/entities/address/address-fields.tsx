import { useTranslation } from 'react-i18next'

import { Combobox, type ComboboxOption } from '~/shared/ui/combobox'
import { FormField, Input } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'

import { findProvince, findWard, splitUnitName, type AddressIssues, type AddressParts } from './admin-units'
import { useAdminUnits } from './use-admin-units'

const collator = new Intl.Collator('vi')
const byName = (a: ComboboxOption, b: ComboboxOption) => collator.compare(a.label ?? a.name, b.label ?? b.name)

const toOption = (name: string): ComboboxOption => {
  const { type, name: label } = splitUnitName(name)
  return { value: name, name, label, tag: type }
}

/**
 * Address in today's two-level units (01/07/2025): province / city, then a ward / commune of that province, then the
 * street. Both lists are searchable and sorted by name; choosing another province clears the ward. A stored province or
 * ward that is no longer in the list stays visible with a note so the person can choose it again; a former province
 * merged in 2025 is shown as the province that now includes it.
 */
export function AddressFields({
  value,
  onChange,
  issues = {},
  idPrefix,
  lineMaxLength = 255,
  className = ''
}: {
  value: AddressParts
  onChange: (next: AddressParts) => void
  /** Problems to show under the fields (from `addressIssues`, usually after a submit). */
  issues?: AddressIssues
  idPrefix?: string
  lineMaxLength?: number
  className?: string
}) {
  const { t } = useTranslation()
  const units = useAdminUnits()
  const provinces = units.data
  const provinceMatch = provinces && value.province.trim() ? findProvince(provinces, value.province) : undefined
  const province = provinceMatch?.province
  const ward = province ? findWard(province, value.ward) : undefined

  const provinceOptions = (provinces ?? []).map((item) => toOption(item.name)).sort(byName)
  const wardOptions = (province?.wards ?? []).map(toOption).sort(byName)

  const set = (patch: Partial<AddressParts>) => onChange({ ...value, ...patch })

  const provinceNote = !provinces
    ? undefined
    : provinceMatch?.merged
      ? t('common.address.provinceMerged', { old: value.province.trim(), now: provinceMatch.province.name })
      : value.province.trim() && !province
        ? t('common.address.provinceOutdated', { value: value.province.trim() })
        : undefined
  const wardNote =
    !provinces || provinceMatch?.merged
      ? undefined
      : !province
        ? t('common.address.provinceFirst')
        : value.ward.trim() && !ward
          ? t('common.address.wardOutdated', { value: value.ward.trim() })
          : undefined

  const error = (field: keyof AddressParts) => {
    const issue = issues[field]
    if (!issue) return undefined
    if (field === 'addressLine') return t('common.address.errors.addressLineRequired')
    if (field === 'province')
      return t(
        issue === 'outdated' ? 'common.address.errors.provinceOutdated' : 'common.address.errors.provinceRequired'
      )
    return t(issue === 'outdated' ? 'common.address.errors.wardOutdated' : 'common.address.errors.wardRequired')
  }
  const id = (field: string) => (idPrefix ? `${idPrefix}-${field}` : undefined)

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      <FormField
        error={error('province')}
        hint={error('province') ? undefined : provinceNote}
        id={id('province')}
        label={t('common.address.province')}
      >
        {(props) => (
          <Combobox
            {...props}
            icon='location_city'
            loading={units.isPending}
            onChange={(next) => set({ province: next, ward: next === province?.name ? value.ward : '' })}
            options={provinceOptions}
            placeholder={t('common.address.provincePlaceholder')}
            searchPlaceholder={t('common.address.provinceSearch')}
            value={province?.name ?? value.province}
          />
        )}
      </FormField>
      <FormField
        error={error('ward')}
        hint={error('ward') ? undefined : wardNote}
        id={id('ward')}
        label={t('common.address.ward')}
      >
        {(props) => (
          <Combobox
            {...props}
            disabled={!province}
            icon='holiday_village'
            loading={units.isPending}
            onChange={(next) => set({ ward: next, province: province?.name ?? value.province })}
            options={wardOptions}
            placeholder={t('common.address.wardPlaceholder')}
            searchPlaceholder={t('common.address.wardSearch', { count: wardOptions.length })}
            value={ward ?? (provinceMatch?.merged ? '' : value.ward)}
          />
        )}
      </FormField>
      <FormField
        className='sm:col-span-2'
        error={error('addressLine')}
        hint={t('common.address.addressLineHint')}
        id={id('line')}
        label={t('common.address.addressLine')}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete='street-address'
            maxLength={lineMaxLength}
            onChange={(event) => set({ addressLine: event.target.value })}
            placeholder={t('common.address.addressLinePlaceholder')}
            value={value.addressLine}
          />
        )}
      </FormField>
      {units.isError ? (
        <p className='flex flex-wrap items-center gap-2 text-xs text-error sm:col-span-2' role='alert'>
          <Icon className='text-base' name='error' />
          {t('common.address.loadError')}
          <button
            className='rounded-md px-1.5 py-0.5 font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => void units.refetch()}
            type='button'
          >
            {t('common.address.retry')}
          </button>
        </p>
      ) : (
        <p className='flex items-start gap-1.5 text-xs text-on-surface-variant sm:col-span-2'>
          <Icon className='mt-px text-sm' name='info' />
          {t('common.address.newUnits')}
        </p>
      )}
    </div>
  )
}
