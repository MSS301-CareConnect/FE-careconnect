import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CATEGORY_MAX_LENGTH } from '../catalog-item-form'
import type { CategoryOption } from '../service-categories'
import { NEW_CATEGORY_OPTION } from '../service-category.constants'

const key = 'admin.servicesPage' as const

type CategorySelectProps = {
  /** Field props from the dialog; the invalid state goes to the control the admin is editing. */
  controlProps: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }
  className: string
  options: readonly CategoryOption[]
  value: string
  onChange: (value: string) => void
}

/**
 * Dropdown of suggested categories with a trailing "add new" option that reveals a free-text
 * input. A stored category that matches no option exactly opens directly in free-text mode so an
 * edit shows and keeps it unchanged.
 */
export function CategorySelect({ controlProps, className, options, value, onChange }: CategorySelectProps) {
  const { t } = useTranslation()
  const { id, ...invalidProps } = controlProps
  const [custom, setCustom] = useState(() => value !== '' && !options.some((option) => option.value === value))
  // Only a user switching to free text moves focus; an edit that opens in free-text mode does not.
  const [focusCustom, setFocusCustom] = useState(false)
  const standard = options.filter((option): option is Required<CategoryOption> => option.standardKey !== undefined)
  const stored = options.filter((option) => option.standardKey === undefined)

  return (
    <>
      <select
        {...(custom ? {} : invalidProps)}
        className={className}
        id={id}
        onChange={(event) => {
          const next = event.target.value
          const adding = next === NEW_CATEGORY_OPTION
          setCustom(adding)
          setFocusCustom(adding)
          onChange(adding ? '' : next)
        }}
        value={custom ? NEW_CATEGORY_OPTION : value}
      >
        <option value=''>{t(`${key}.form.categoryChoose`)}</option>
        <optgroup label={t(`${key}.form.categoryStandardGroup`)}>
          {standard.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`${key}.categories.${option.standardKey}`)}
            </option>
          ))}
        </optgroup>
        {stored.length ? (
          <optgroup label={t(`${key}.form.categoryStoredGroup`)}>
            {stored.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </optgroup>
        ) : null}
        <option value={NEW_CATEGORY_OPTION}>{t(`${key}.form.categoryAddNew`)}</option>
      </select>
      {custom ? (
        <div className='mt-2'>
          <label className='text-xs font-medium text-on-surface-variant' htmlFor={`${id}-custom`}>
            {t(`${key}.form.categoryCustom`)}
          </label>
          <input
            {...invalidProps}
            autoFocus={focusCustom}
            className={className}
            id={`${id}-custom`}
            maxLength={CATEGORY_MAX_LENGTH}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t(`${key}.form.categoryPlaceholder`)}
            value={value}
          />
        </div>
      ) : null}
    </>
  )
}
