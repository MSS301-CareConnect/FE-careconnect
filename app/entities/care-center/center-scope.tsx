import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { useServiceCenters } from './care-center-api'
import { openCenterPicker, useCurrentCenter } from './selected-center'

const key = 'customer.centerPicker' as const
const actionClass =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/** States which center a list follows, or that it shows the platform-wide configuration. */
export function CenterScope({ generalText }: { generalText: string }) {
  const { t } = useTranslation()
  const center = useCurrentCenter()

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border px-5 py-4 ${center ? 'border-outline-variant/60 bg-secondary-container/70' : 'border-warning/25 bg-warning-container/60'}`}
    >
      <p className='flex min-w-0 items-start gap-3 text-sm leading-6 text-on-surface'>
        <Icon
          aria-hidden='true'
          className={`mt-0.5 shrink-0 text-xl ${center ? 'text-primary' : 'text-warning'}`}
          name={center ? 'home_health' : 'info'}
        />
        <span>
          {center ? (
            <>
              {t(`${key}.scope.showing`)} <strong className='font-bold text-primary'>{center.name}</strong>
            </>
          ) : (
            generalText
          )}
        </span>
      </p>
      <button
        className={`${actionClass} ${center ? 'border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
        onClick={openCenterPicker}
        type='button'
      >
        <Icon aria-hidden='true' className='text-lg' name={center ? 'swap_horiz' : 'home_health'} />
        {t(center ? `${key}.change` : `${key}.choose`)}
      </button>
    </div>
  )
}

/** Shown in place of a load error while no center is chosen: the next step is choosing one. */
export function CenterReminder({ title, text }: { title: string; text: string }) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col items-center rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-14 text-center shadow-xs'>
      <span
        aria-hidden='true'
        className='grid h-14 w-14 place-items-center rounded-2xl bg-secondary-container text-primary'
      >
        <Icon className='text-3xl' name='home_health' />
      </span>
      <h3 className='mt-5 text-xl font-bold tracking-[-0.02em] text-on-surface'>{title}</h3>
      <p className='mt-2 max-w-[46ch] text-sm leading-6 text-on-surface-variant'>{text}</p>
      <button
        className={`${actionClass} mt-6 bg-primary text-on-primary hover:bg-primary-container`}
        onClick={openCenterPicker}
        type='button'
      >
        <Icon aria-hidden='true' className='text-lg' name='home_health' />
        {t(`${key}.choose`)}
      </button>
      <Link
        className='mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
        to='/customer/centers'
      >
        {t(`${key}.browseAll`)}
        <Icon aria-hidden='true' className='text-lg' name='arrow_forward' />
      </Link>
    </div>
  )
}

/**
 * One small line under a page title — "At TT An Tâm · Change" — replacing the old banner. It appears only when the
 * customer can actually choose between several centers; with a single center there is nothing to say.
 */
export function CenterContextLine() {
  const { t } = useTranslation()
  const center = useCurrentCenter()
  const centers = useServiceCenters()
  if ((centers.data?.length ?? 0) < 2) return null

  return (
    <span className='inline-flex flex-wrap items-center gap-x-1.5 text-sm text-on-surface-variant'>
      <Icon aria-hidden='true' className='text-base text-primary' name='home_health' />
      {center ? t(`${key}.context.at`, { name: center.name }) : t(`${key}.context.none`)}
      <span aria-hidden='true'>·</span>
      <button
        className='rounded font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
        onClick={openCenterPicker}
        type='button'
      >
        {center ? t(`${key}.context.change`) : t(`${key}.context.choose`)}
      </button>
    </span>
  )
}
