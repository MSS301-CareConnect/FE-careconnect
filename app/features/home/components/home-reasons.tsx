import { motion } from 'motion/react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { easeSoft, Reveal, revealVariants, staggerVariants } from '~/shared/ui/motion'

import { homeContainer, sectionEyebrow, sectionTitle } from './home-styles'
import { useCurrentWeek } from './use-current-week'

const modes = ['byHour', 'byDay', 'byShift'] as const
type Mode = (typeof modes)[number]
/** Illustrative bar heights (percent) per booking mode — a shape, not data. */
const bars: Record<Mode, number[]> = {
  byHour: [30, 55, 40, 70, 45, 25, 15],
  byDay: [78, 78, 78, 78, 78, 36, 18],
  byShift: [52, 8, 52, 8, 92, 52, 8]
}
const highlight: Record<Mode, number> = { byHour: 3, byDay: 2, byShift: 4 }

const card =
  'flex h-full flex-col rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-forest-900/5 transition-shadow duration-300 hover:shadow-[var(--shadow-float)]'
const iconTile = 'grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-100 text-forest-800'
const lift = { whileHover: { y: -4 }, transition: { type: 'spring' as const, stiffness: 320, damping: 24 } }

/** Icon beside the text on the wide card; above it on the two half-width cards so the copy keeps its width. */
function CardHeading({
  id,
  icon,
  stacked = false
}: {
  id: 'profiles' | 'schedule' | 'family'
  icon: string
  stacked?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className={stacked ? 'mb-5 flex flex-col gap-3' : 'flex items-start gap-4'}>
      <span aria-hidden='true' className={iconTile}>
        <Icon name={icon} />
      </span>
      <span>
        <span className='block text-lg font-semibold text-forest-950'>{t(`home.reasons.${id}.title`)}</span>
        <span className='mt-1 block text-sm leading-6 text-on-surface-variant'>
          {t(`home.reasons.${id}.description`)}
        </span>
      </span>
    </div>
  )
}

/**
 * Reasons as a bento grid (UI redesign 2026-11-09): the family photo, then three cards that each show their point —
 * profile facts as pills, a booking-mode switch that reshapes a week chart, and a week strip with visit progress.
 */
export function HomeReasons() {
  const { t } = useTranslation()
  const legendId = useId()
  const week = useCurrentWeek()
  const [mode, setMode] = useState<Mode>('byHour')

  return (
    <section
      aria-labelledby='home-reasons-title'
      className={`${homeContainer} scroll-mt-24 py-12 lg:py-16`}
      id='home-reasons'
    >
      <Reveal className='max-w-2xl'>
        <p className={sectionEyebrow}>{t('home.reasonsEyebrow')}</p>
        <h2 className={sectionTitle} id='home-reasons-title'>
          {t('home.reasonsTitle')}
        </h2>
      </Reveal>

      <div className='mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <Reveal className='relative min-h-[20rem] overflow-hidden rounded-[2rem] bg-mint-100 shadow-[var(--shadow-soft)]'>
          <img
            alt={t('home.reasonsPhotoAlt')}
            className='absolute inset-0 h-full w-full object-cover object-[100%_35%]'
            decoding='async'
            height={900}
            loading='lazy'
            src='/images/care-for-families.jpg'
            width={1600}
          />
        </Reveal>

        <motion.ul
          className='grid gap-4 sm:grid-cols-2'
          initial='hidden'
          variants={staggerVariants(0.1)}
          viewport={{ once: true, amount: 0.15 }}
          whileInView='shown'
        >
          <motion.li className='sm:col-span-2' variants={revealVariants}>
            <motion.div className={card} {...lift}>
              <CardHeading icon='badge' id='profiles' />
              <div aria-hidden='true' className='mt-5 flex flex-wrap gap-2'>
                {(['experience', 'certificates', 'reviews'] as const).map((fact, index) => (
                  <motion.span
                    className='inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3.5 py-2 text-sm font-medium text-white'
                    initial={{ opacity: 0, x: -10 }}
                    key={fact}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.45, ease: easeSoft }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, x: 0 }}
                  >
                    <Icon className='text-base text-mint-300' name='check' />
                    {t(`home.preview.${fact}`)}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.li>

          <motion.li variants={revealVariants}>
            <motion.div className={card} {...lift}>
              <CardHeading icon='event_available' id='schedule' stacked />
              <div
                aria-labelledby={legendId}
                className='grid grid-cols-3 rounded-full bg-mint-50 p-1 text-xs font-semibold'
                role='group'
              >
                <span className='sr-only' id={legendId}>
                  {t('home.preview.modeLegend')}
                </span>
                {modes.map((item) => (
                  <button
                    aria-label={t(`home.preview.${item}`)}
                    aria-pressed={item === mode}
                    className='relative rounded-full px-1 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest-900'
                    key={item}
                    onClick={() => setMode(item)}
                    type='button'
                  >
                    {item === mode ? (
                      <motion.span
                        aria-hidden='true'
                        className='absolute inset-0 rounded-full bg-forest-900'
                        layoutId={`${legendId}-mode`}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <span className={`relative ${item === mode ? 'text-white' : 'text-forest-700'}`}>
                      {t(`home.preview.modeShort.${item}`)}
                    </span>
                  </button>
                ))}
              </div>
              <div aria-hidden='true' className='mt-auto flex h-28 items-end gap-2 pt-5'>
                {bars[mode].map((height, index) => (
                  <motion.span
                    animate={{ height: `${Math.max(height, 6)}%` }}
                    className={`flex-1 rounded-full ${index === highlight[mode] ? 'bg-forest-800' : 'bg-peach-200'}`}
                    initial={false}
                    key={week.weekdays[index]?.key ?? index}
                    transition={{ type: 'spring', stiffness: 220, damping: 22, delay: index * 0.03 }}
                  />
                ))}
              </div>
              <div aria-hidden='true' className='mt-2 flex gap-2 text-center text-[11px] text-on-surface-variant'>
                {week.weekdays.map((weekday) => (
                  <span className='flex-1' key={weekday.key}>
                    {weekday.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.li>

          <motion.li variants={revealVariants}>
            <motion.div className={card} {...lift}>
              <CardHeading icon='assignment' id='family' stacked />
              <div aria-hidden='true' className='mt-auto rounded-2xl bg-mint-50/80 p-3'>
                <p className='text-xs font-semibold text-forest-700'>{t('home.preview.thisWeek')}</p>
                <div className='mt-2 grid grid-cols-7 gap-1'>
                  {week.weekdays.map((weekday, index) => (
                    <span
                      className={`flex flex-col items-center rounded-xl py-1.5 text-[11px] ${index === week.today ? 'bg-forest-900 text-white' : 'text-forest-700'}`}
                      key={weekday.key}
                    >
                      <span className='opacity-70'>{weekday.label}</span>
                      <span className='text-sm font-semibold'>{weekday.day}</span>
                      <span
                        className={`mt-0.5 h-1 w-1 rounded-full ${index % 2 === 0 ? (index === week.today ? 'bg-mint-300' : 'bg-mint-400') : 'bg-transparent'}`}
                      />
                    </span>
                  ))}
                </div>
                <p className='mt-3 text-xs font-medium text-forest-700'>
                  {t('home.heroChips.progressValue', { done: 4, total: 6 })}
                </p>
                <span className='mt-1.5 block h-1.5 overflow-hidden rounded-full bg-forest-900/10'>
                  <motion.span
                    className='block h-full rounded-full bg-mint-400'
                    initial={{ width: 0 }}
                    transition={{ delay: 0.4, duration: 0.9, ease: easeSoft }}
                    viewport={{ once: true }}
                    whileInView={{ width: '66%' }}
                  />
                </span>
              </div>
            </motion.div>
          </motion.li>
        </motion.ul>
      </div>
    </section>
  )
}
