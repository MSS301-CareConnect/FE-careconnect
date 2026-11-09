import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { easeSoft, Reveal } from '~/shared/ui/motion'

import { BookPreview, ComparePreview, FindPreview } from './home-previews'
import { homeContainer, sectionEyebrow, sectionTitle } from './home-styles'
import { useCurrentWeek } from './use-current-week'

const steps = ['find', 'compare', 'book'] as const
const AUTO_ADVANCE_MS = 5_000

/**
 * "How it works" as tabs (UI redesign 2026-11-09): three steps on the left with a sliding highlight and a progress
 * bar that moves to the next step on its own until the visitor picks one; the right panel cross-fades an app preview.
 * Arrow keys, Home and End move between tabs.
 */
export function HomeProcess() {
  const { t } = useTranslation()
  const id = useId()
  const reduced = useReducedMotion()
  const week = useCurrentWeek()
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const playing = auto && !reduced

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % steps.length), AUTO_ADVANCE_MS)
    return () => window.clearTimeout(timer)
  }, [active, playing])

  function choose(index: number) {
    setAuto(false)
    setActive(index)
  }

  function onKeyDown(event: KeyboardEvent) {
    const last = steps.length - 1
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? active === last
          ? 0
          : active + 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? active === 0
            ? last
            : active - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  const step = steps[active]

  return (
    <section
      aria-labelledby='home-process-title'
      className={`${homeContainer} scroll-mt-24 py-12 lg:py-16`}
      id='how-it-works'
    >
      <Reveal className='max-w-2xl'>
        <p className={sectionEyebrow}>{t('home.processEyebrow')}</p>
        <h2 className={sectionTitle} id='home-process-title'>
          {t('home.processTitle')}
        </h2>
        <p className='mt-3 text-on-surface-variant'>{t('home.processHint')}</p>
      </Reveal>

      <Reveal className='mt-8 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' delay={0.1}>
        <div
          aria-label={t('home.processTitle')}
          aria-orientation='vertical'
          className='flex flex-col gap-2'
          onKeyDown={onKeyDown}
          role='tablist'
        >
          {steps.map((item, index) => {
            const selected = index === active
            return (
              <button
                aria-controls={`${id}-panel`}
                aria-selected={selected}
                className='group relative rounded-3xl p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                id={`${id}-tab-${item}`}
                key={item}
                onClick={() => choose(index)}
                ref={(node) => {
                  tabs.current[index] = node
                }}
                role='tab'
                tabIndex={selected ? 0 : -1}
                type='button'
              >
                {selected ? (
                  <motion.span
                    aria-hidden='true'
                    className='absolute inset-0 -z-0 rounded-3xl bg-white shadow-[var(--shadow-soft)]'
                    layoutId={`${id}-highlight`}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className='relative flex gap-4'>
                  <span
                    aria-hidden='true'
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors duration-300 ${selected ? 'bg-forest-900 text-white' : 'bg-white/70 text-forest-700 group-hover:bg-white'}`}
                  >
                    {index + 1}
                  </span>
                  <span className='flex-1'>
                    <span className='block text-lg font-semibold text-forest-950'>{t(`home.steps.${item}.title`)}</span>
                    <span
                      className={`mt-1 block text-sm leading-6 transition-colors ${selected ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}
                    >
                      {t(`home.steps.${item}.description`)}
                    </span>
                    {selected ? (
                      <span aria-hidden='true' className='mt-4 block h-1 overflow-hidden rounded-full bg-forest-900/10'>
                        <motion.span
                          animate={{ scaleX: 1 }}
                          className='block h-full origin-left rounded-full bg-mint-400'
                          initial={{ scaleX: playing ? 0 : 1 }}
                          key={`${active}-${playing}`}
                          transition={{ duration: playing ? AUTO_ADVANCE_MS / 1000 : 0, ease: 'linear' }}
                        />
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div
          aria-labelledby={`${id}-tab-${step}`}
          className='relative flex min-h-[24rem] flex-col justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-mint-100 via-white/80 to-peach-100 p-5 sm:p-8'
          id={`${id}-panel`}
          role='tabpanel'
        >
          <AnimatePresence mode='wait'>
            <motion.div
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              aria-hidden='true'
              className='mx-auto w-full max-w-md'
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              key={step}
              transition={{ duration: 0.35, ease: easeSoft }}
            >
              {step === 'find' ? <FindPreview /> : null}
              {step === 'compare' ? <ComparePreview /> : null}
              {step === 'book' ? <BookPreview today={week.today} weekdays={week.weekdays} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  )
}
