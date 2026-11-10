import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { ServiceCenterOption } from '~/entities/care-center/care-center-api'
import { bentoCard } from '~/features/customer/ui/bento-styles'
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
    <span
      aria-hidden='true'
      className={`grid place-items-center bg-[radial-gradient(120%_120%_at_0%_0%,var(--color-mint-200),transparent_60%),radial-gradient(120%_120%_at_100%_100%,var(--color-peach-100),transparent_60%)] bg-mint-50 text-forest-800 ${className}`}
    >
      <Icon className='text-4xl' name='home_health' />
    </span>
  )
}

/** A center in the directory: photo, name, the facts to compare, then "View center" and "Choose this center". */
export function CenterCard({ center }: { center: ServiceCenterOption }) {
  const { t } = useTranslation()

  return (
    <article className={`cc-lift group relative flex flex-col overflow-hidden ${bentoCard} hover:border-mint-200`}>
      <div className='m-2 mb-0 overflow-hidden rounded-[1.1rem]'>
        <CenterPhoto
          center={center}
          className='aspect-[16/9] w-full transition-transform duration-500 group-hover:scale-105'
        />
      </div>
      <div className='flex flex-1 flex-col p-5'>
        <h2 className='text-lg leading-snug font-bold tracking-tight text-forest-950'>
          <Link
            aria-label={t(`${key}.viewNamed`, { name: center.name })}
            className='rounded after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/centers/${center.id}`}
          >
            {center.name}
          </Link>
        </h2>
        <CenterFacts center={center} className='mt-3' />
        <div className='mt-auto pt-5'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4'>
            <span
              aria-hidden='true'
              className='inline-flex items-center gap-1 text-sm font-semibold text-forest-800 transition-[gap] group-hover:gap-2'
            >
              {t(`${key}.view`)}
              <Icon className='text-base' name='arrow_forward' />
            </span>
            <ChooseCenterButton center={center} size='sm' />
          </div>
        </div>
      </div>
    </article>
  )
}
