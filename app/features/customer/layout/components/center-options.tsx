import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useServiceCenters, type ServiceCenterOption } from '~/entities/care-center/care-center-api'
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
  const { t } = useTranslation()
  const searchId = useId()
  const { center: selected } = useSelectedCenter()
  const centers = useServiceCenters()
  const [query, setQuery] = useState('')
  const needle = searchable(query.trim())
  const visible = (centers.data ?? []).filter(
    (center) => !needle || searchable(`${center.name} ${center.address ?? ''}`).includes(needle)
  )
  const isDialog = size === 'dialog'
  const optionClass = `group flex w-full items-center gap-3 rounded-xl text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#075b31] ${isDialog ? 'min-h-16 px-4 py-3' : 'min-h-12 px-3 py-2'}`

  function option(center: ServiceCenterOption | null) {
    const isCurrent = (center?.id ?? null) === (selected?.id ?? null)
    return (
      <li key={center?.id ?? 'general'}>
        <button
          aria-current={isCurrent ? 'true' : undefined}
          className={`${optionClass} ${isCurrent ? 'bg-[#e8f2e8]' : 'hover:bg-[#f2f6f1]'}`}
          onClick={() => onPick(center)}
          type='button'
        >
          <span
            aria-hidden='true'
            className={`grid shrink-0 place-items-center rounded-lg ${isDialog ? 'h-10 w-10' : 'h-8 w-8'} ${center ? 'bg-[#075b31] text-white' : 'bg-[#f3efe2] text-[#8a5a12]'}`}
          >
            <Icon className={isDialog ? 'text-xl' : 'text-lg'} name={center ? 'home_health' : 'public'} />
          </span>
          <span className='min-w-0 flex-1'>
            <span className='block truncate text-sm font-bold text-[#1b2922]'>
              {center?.name ?? t(`${key}.general.name`)}
            </span>
            {center ? (
              center.address ? (
                <span className='block truncate text-xs leading-5 text-[#617367]'>{center.address}</span>
              ) : null
            ) : (
              <span className='block text-xs leading-5 text-[#617367]'>{t(`${key}.general.description`)}</span>
            )}
          </span>
          {isCurrent ? (
            <span className='flex shrink-0 items-center gap-1 text-xs font-bold text-[#075b31]'>
              <Icon aria-hidden='true' className='text-lg' name='check' />
              {t(`${key}.current`)}
            </span>
          ) : (
            <Icon
              aria-hidden='true'
              className='shrink-0 text-lg text-[#9aab9e] transition-transform group-hover:translate-x-0.5 group-hover:text-[#075b31]'
              name='chevron_right'
            />
          )}
        </button>
      </li>
    )
  }

  if (centers.isPending)
    return (
      <p className='flex items-center gap-2 px-3 py-6 text-sm text-[#526a57]' role='status'>
        <Icon aria-hidden='true' className='animate-spin text-xl text-[#075b31]' name='progress_activity' />
        {t(`${key}.states.loading`)}
      </p>
    )

  if (centers.isError && apiErrorStatus(centers.error) === 401)
    return (
      <div className='px-3 py-5'>
        <p className='text-sm font-bold text-[#1b2922]'>{t(`${key}.states.signInTitle`)}</p>
        <p className='mt-1 text-sm leading-6 text-[#5e7063]'>{t(`${key}.states.signInText`)}</p>
        <Link
          className='mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#075b31] px-4 text-sm font-bold text-white hover:bg-[#064a29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
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
        <span className='text-[#415548]'>{t(`${key}.states.error`)}</span>
        <button
          className='font-bold text-[#075b31] underline-offset-4 hover:underline'
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
              className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-[#6b806e]'
              name='search'
            />
            <input
              className='h-11 w-full rounded-xl border border-[#d9e4da] bg-[#fbfcfa] pl-11 pr-4 text-sm text-[#1b2922] outline-none transition-colors placeholder:text-[#78877d] focus:border-[#075b31] focus:ring-2 focus:ring-[#075b31]/10'
              id={searchId}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(`${key}.searchPlaceholder`)}
              type='search'
              value={query}
            />
          </span>
        </div>
      ) : null}
      <p className={`text-xs font-semibold text-[#617367] ${isDialog ? 'pb-2' : 'px-3 pb-1'}`}>
        {t(`${key}.count`, { count: centers.data.length })}
      </p>
      <ul
        aria-label={t(`${key}.menu`)}
        className={`min-h-0 overflow-y-auto ${isDialog ? 'max-h-[min(22rem,45dvh)]' : 'max-h-72'}`}
      >
        {visible.map((center) => option(center))}
        {centers.data.length === 0 ? (
          <li className='px-3 py-4 text-sm text-[#5e7063]'>{t(`${key}.states.empty`)}</li>
        ) : visible.length === 0 ? (
          <li className='px-3 py-4 text-sm text-[#5e7063]'>{t(`${key}.states.noMatch`)}</li>
        ) : null}
      </ul>
      <ul className={`mt-2 bg-[#fbfaf5] ${isDialog ? 'rounded-xl' : 'rounded-lg'}`}>{option(null)}</ul>
    </div>
  )
}
