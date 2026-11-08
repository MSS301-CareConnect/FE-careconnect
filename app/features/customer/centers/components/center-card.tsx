import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { ServiceCenterOption } from '~/entities/care-center/care-center-api'
import { Icon } from '~/shared/ui/icon'

import { CenterFacts } from './center-facts'
import { ChooseCenterButton } from './choose-center-button'

const key = 'customer.centers' as const

/** The center photo when there is one, otherwise a calm branded tile (never an empty block). */
export function CenterPhoto({ center, className }: { center: ServiceCenterOption; className: string }) {
  const { t } = useTranslation()
  if (center.imageUrl)
    return (
      <img
        alt={t(`${key}.photoAlt`, { name: center.name })}
        className={`object-cover ${className}`}
        decoding='async'
        loading='lazy'
        src={center.imageUrl}
      />
    )
  return (
    <span aria-hidden='true' className={`grid place-items-center bg-brand-50 text-primary ${className}`}>
      <Icon className='text-4xl' name='home_health' />
    </span>
  )
}

/** A center in the directory: photo, name, the facts to compare, then "View center" and "Choose this center". */
export function CenterCard({ center }: { center: ServiceCenterOption }) {
  const { t } = useTranslation()

  return (
    <article className='cc-lift group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-card)] hover:border-brand-200'>
      <CenterPhoto center={center} className='aspect-[16/9] w-full' />
      <div className='flex flex-1 flex-col p-5'>
        <h2 className='text-lg leading-snug font-semibold text-on-surface'>
          <Link
            aria-label={t(`${key}.viewNamed`, { name: center.name })}
            className='rounded after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/centers/${center.id}`}
          >
            {center.name}
          </Link>
        </h2>
        <CenterFacts center={center} className='mt-3' />
        <div className='mt-auto pt-5'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4'>
            <span aria-hidden='true' className='text-sm font-medium text-primary group-hover:underline'>
              {t(`${key}.view`)}
            </span>
            <ChooseCenterButton center={center} size='sm' />
          </div>
        </div>
      </div>
    </article>
  )
}
