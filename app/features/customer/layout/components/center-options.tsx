import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useServiceCenters, type ServiceCenterOption } from '~/entities/care-center/care-center-api'
import { formatMoney } from '~/entities/booking/booking-format'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { apiErrorStatus } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.centerPicker' as const
const SEARCH_THRESHOLD = 6

/** Lowercases and strips Vietnamese diacritics so "binh an" matches "Bình An". */
function searchable(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D').toLowerCase()
}

type CenterOptionsProps = {
  /** Null chooses the platform-wide configuration. */
  onPick: (center: ServiceCenterOption | null) => void
  size: 'menu' | 'dialog'
}

/** The selectable centers with the platform-wide option, shared by the header menu and the first-visit dialog. */
export function CenterOptions({ onPick, size }: CenterOptionsProps) {
  const { t, i18n } = useTranslation()
  const searchId = useId()
  const { center: selected } = useSelectedCenter()
  const centers = useServiceCenters()
  const [query, setQuery] = useState('')
  const needle = searchable(query.trim())
  const visible = (centers.data ?? []).filter(
    (center) => !needle || searchable(`${center.name} ${center.address ?? ''}`).includes(needle)
  )
  const isDialog = size === 'dialog'
  const optionClass = `group flex w-full items-center gap-3 rounded-xl text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${isDialog ? 'min-h-16 px-4 py-3' : 'min-h-12 px-3 py-2'}`

  function option(center: ServiceCenterOption | null) {
    const isCurrent = (center?.id ?? null) === (selected?.id ?? null)
    return (
      <li key={center?.id ?? 'general'}>
        <button
          aria-current={isCurrent ? 'true' : undefined}
          className={`${optionClass} ${isCurrent ? 'bg-primary-fixed/60' : 'hover:bg-surface-container-low'}`}
          onClick={() => onPick(center)}
          type='button'
        >
          <span
            aria-hidden='true'
            className={`grid shrink-0 place-items-center rounded-lg ${isDialog ? 'h-10 w-10' : 'h-8 w-8'} ${center ? 'bg-primary text-on-primary' : 'bg-warning-container text-on-warning-container'}`}
          >
            <Icon className={isDialog ? 'text-xl' : 'text-lg'} name={center ? 'home_health' : 'public'} />
          </span>
          <span className='min-w-0 flex-1'>
            <span className='block truncate text-sm font-bold text-on-surface'>
              {center?.name ?? t(`${key}.general.name`)}
            </span>
            {center ? (
              <>
                {center.address ? (
                  <span
                    className={`block text-xs leading-5 text-on-surface-variant ${isDialog ? 'line-clamp-2' : 'truncate'}`}
                  >
                    {center.address}
                  </span>
                ) : null}
                {isDialog ? <CenterFacts center={center} language={i18n.language} /> : null}
              </>
            ) : (
              <span className='block text-xs leading-5 text-on-surface-variant'>{t(`${key}.general.description`)}</span>
            )}
          </span>
          {isCurrent ? (
            <span className='flex shrink-0 items-center gap-1 text-xs font-bold text-primary'>
              <Icon aria-hidden='true' className='text-lg' name='check' />
              {t(`${key}.current`)}
            </span>
          ) : (
            <Icon
              aria-hidden='true'
              className='shrink-0 text-lg text-outline transition-transform group-hover:translate-x-0.5 group-hover:text-primary'
              name='chevron_right'
            />
          )}
        </button>
      </li>
    )
  }

  if (centers.isPending)
    return (
      <p className='flex items-center gap-2 px-3 py-6 text-sm text-on-surface-variant' role='status'>
        <Icon aria-hidden='true' className='animate-spin text-xl text-primary' name='progress_activity' />
        {t(`${key}.states.loading`)}
      </p>
    )

  if (centers.isError && apiErrorStatus(centers.error) === 401)
    return (
      <div className='px-3 py-5'>
        <p className='text-sm font-bold text-on-surface'>{t(`${key}.states.signInTitle`)}</p>
        <p className='mt-1 text-sm leading-6 text-on-surface-variant'>{t(`${key}.states.signInText`)}</p>
        <Link
          className='mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          to='/login'
        >
          {t(`${key}.states.signIn`)}
          <Icon aria-hidden='true' className='text-lg' name='arrow_forward' />
        </Link>
      </div>
    )

  if (centers.isError)
    return (
      <div className='flex flex-wrap items-center justify-between gap-3 px-3 py-5 text-sm' role='alert'>
        <span className='text-on-surface-variant'>{t(`${key}.states.error`)}</span>
        <button
          className='font-bold text-primary underline-offset-4 hover:underline'
          onClick={() => void centers.refetch()}
          type='button'
        >
          {t(`${key}.states.retry`)}
        </button>
      </div>
    )

  return (
    <div className='flex min-h-0 flex-col'>
      {centers.data.length >= SEARCH_THRESHOLD ? (
        <div className={isDialog ? 'pb-3' : 'p-1 pb-2'}>
          <label className='sr-only' htmlFor={searchId}>
            {t(`${key}.search`)}
          </label>
          <span className='relative block'>
            <Icon
              aria-hidden='true'
              className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant'
              name='search'
            />
            <input
              className='h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-11 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15'
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(`${key}.searchPlaceholder`)}
              type='search'
              value={query}
            />
          </span>
        </div>
      ) : null}
      <p className={`text-xs font-semibold text-on-surface-variant ${isDialog ? 'pb-2' : 'px-3 pb-1'}`}>
        {t(`${key}.count`, { count: centers.data.length })}
      </p>
      <ul
        aria-label={t(`${key}.menu`)}
        className={`min-h-0 overflow-y-auto ${isDialog ? 'max-h-[min(22rem,45dvh)]' : 'max-h-72'}`}
      >
        {visible.map((center) => option(center))}
        {centers.data.length === 0 ? (
          <li className='px-3 py-4 text-sm text-on-surface-variant'>{t(`${key}.states.empty`)}</li>
        ) : visible.length === 0 ? (
          <li className='px-3 py-4 text-sm text-on-surface-variant'>{t(`${key}.states.noMatch`)}</li>
        ) : null}
      </ul>
      <ul className={`mt-2 bg-surface-container-low ${isDialog ? 'rounded-xl' : 'rounded-lg'}`}>{option(null)}</ul>
    </div>
  )
}

/** Hours, phone, starting price and service count, so a family can compare centers before choosing one. */
function CenterFacts({ center, language }: { center: ServiceCenterOption; language: string }) {
  const { t } = useTranslation()
  const facts = [
    center.operatingHours ? (['schedule', center.operatingHours] as const) : null,
    center.phoneNumber ? (['call', center.phoneNumber] as const) : null,
    center.minPrice !== undefined
      ? (['payments', t(`${key}.facts.fromPrice`, { price: formatMoney(center.minPrice, language) })] as const)
      : null,
    center.serviceCount
      ? (['medical_services', t(`${key}.facts.services`, { count: center.serviceCount })] as const)
      : null
  ].filter((fact) => fact !== null)
  if (facts.length === 0) return null
  return (
    <span className='mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs leading-5 text-on-surface-variant'>
      {facts.map(([icon, text]) => (
        <span className='inline-flex items-center gap-1 tabular-nums' key={icon}>
          <Icon aria-hidden='true' className='text-sm text-primary' name={icon} />
          {text}
        </span>
      ))}
    </span>
  )
}
