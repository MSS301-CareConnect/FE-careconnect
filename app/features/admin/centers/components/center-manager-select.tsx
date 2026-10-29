import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useCenterManagers } from '../hooks/use-center-managers'

const key = 'admin.provider.manager' as const

type CenterManagerSelectProps = {
  centerId: string
  value: string
  onChange: (id: string) => void
  className: string
}

/** Picks the center's manager among ACTIVE CENTER_MANAGER accounts; the ID is sent, the name is shown. */
export function CenterManagerSelect({ centerId, value, onChange, className }: CenterManagerSelectProps) {
  const { t } = useTranslation()
  const hintId = useId()
  const managers = useCenterManagers()
  // ProviderService only accepts a manager whose Identity account belongs to this center (H-12).
  const options = (managers.data ?? []).filter((manager) => manager.centerId === centerId)
  // A saved manager who is no longer an active CENTER_MANAGER stays visible instead of silently changing.
  const missing = Boolean(value) && managers.isSuccess && !options.some((manager) => manager.id === value)

  return (
    <div className='text-sm font-medium sm:col-span-2'>
      <label>
        {t(`${key}.label`)}
        <select
          aria-describedby={hintId}
          className={className}
          disabled={!managers.isSuccess}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {managers.isPending ? <option value={value}>{t(`${key}.loading`)}</option> : null}
          {managers.isError ? <option value={value}>{t(`${key}.unavailable`)}</option> : null}
          {managers.isSuccess ? (
            <>
              <option value=''>{t(`${key}.none`)}</option>
              {missing ? <option value={value}>{t(`${key}.inactive`)}</option> : null}
              {options.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.email
                    ? t(`${key}.option`, { name: manager.fullName, email: manager.email })
                    : manager.fullName}
                </option>
              ))}
            </>
          ) : null}
        </select>
      </label>
      <p className='mt-1 text-xs font-normal text-outline' id={hintId}>
        {managers.isError ? (
          <>
            {t(`${key}.error`)}{' '}
            <button className='text-primary underline' onClick={() => void managers.refetch()} type='button'>
              {t(`${key}.retry`)}
            </button>
          </>
        ) : managers.isSuccess && options.length === 0 ? (
          <>
            {t(`${key}.empty`)}{' '}
            <Link className='text-primary underline' to='/admin/accounts'>
              {t(`${key}.createAccount`)}
            </Link>
          </>
        ) : missing ? (
          t(`${key}.inactiveHint`)
        ) : (
          t(`${key}.hint`)
        )}
      </p>
    </div>
  )
}
