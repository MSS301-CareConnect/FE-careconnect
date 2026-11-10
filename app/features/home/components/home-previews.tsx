import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { easeSoft } from '~/shared/ui/motion'

/**
 * Decorative app previews for the "How it works" tabs (UI redesign 2026-11-09). They illustrate the flow with
 * generic labels and placeholder lines — no invented people or numbers — and are hidden from assistive technology.
 */
const item = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: easeSoft } }
}
const list = { hidden: {}, shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }

function Line({ className = '' }: { className?: string }) {
  return <span className={`block h-2 rounded-full bg-forest-900/10 ${className}`} />
}

export function FindPreview() {
  const { t } = useTranslation()
  return (
    <motion.div animate='shown' className='flex flex-col gap-3' initial='hidden' variants={list}>
      <motion.div
        className='flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-forest-700/70 shadow-[var(--shadow-soft)]'
        variants={item}
      >
        <Icon className='text-xl text-forest-700' name='search' />
        {t('home.preview.search')}
        <span className='ml-auto grid h-8 w-8 place-items-center rounded-full bg-forest-900 text-white'>
          <Icon className='text-base' name='tune' />
        </span>
      </motion.div>
      {[0, 1, 2].map((index) => (
        <motion.div
          className={`flex items-center gap-3 rounded-2xl p-3 ${index === 0 ? 'bg-white shadow-[var(--shadow-soft)] ring-2 ring-mint-300' : 'bg-white/60'}`}
          key={index}
          variants={item}
        >
          <span className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint-100 text-forest-700'>
            <Icon name='person' />
          </span>
          <span className='flex flex-1 flex-col gap-2'>
            <span className='text-sm font-semibold text-forest-900'>{t('home.preview.caregiver')}</span>
            <Line className='w-2/3' />
          </span>
          <span className='flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-forest-700'>
            <Icon className='text-sm' filled name='verified' />
            {t('home.preview.verified')}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}

export function ComparePreview() {
  const { t } = useTranslation()
  const facts = [
    { id: 'experience', icon: 'workspace_premium', fill: '78%' },
    { id: 'certificates', icon: 'verified_user', fill: '92%' },
    { id: 'reviews', icon: 'star', fill: '86%' }
  ] as const
  return (
    <motion.div
      animate='shown'
      className='overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]'
      initial='hidden'
      variants={list}
    >
      <motion.div className='h-20 bg-forest-900' variants={item} />
      <div className='-mt-8 px-5 pb-5'>
        <motion.div className='flex flex-col items-start gap-3' variants={item}>
          <span className='grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-mint-100 text-forest-700'>
            <Icon className='text-3xl' name='person' />
          </span>
          <span className='flex w-full flex-col gap-2'>
            <span className='font-semibold text-forest-900'>{t('home.preview.caregiver')}</span>
            <Line className='w-1/2' />
          </span>
        </motion.div>
        <div className='mt-5 grid gap-3 sm:grid-cols-3'>
          {facts.map((fact) => (
            <motion.div className='rounded-2xl bg-mint-50/70 p-3' key={fact.id} variants={item}>
              <span className='flex items-center gap-1.5 text-xs font-semibold text-forest-700'>
                <Icon className='text-base' filled={fact.id === 'reviews'} name={fact.icon} />
                {t(`home.preview.${fact.id}`)}
              </span>
              <span className='mt-3 block h-1.5 overflow-hidden rounded-full bg-forest-900/10'>
                <motion.span
                  animate={{ width: fact.fill }}
                  className='block h-full rounded-full bg-mint-400'
                  initial={{ width: 0 }}
                  transition={{ delay: 0.35, duration: 0.8, ease: easeSoft }}
                />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function BookPreview({
  weekdays,
  today
}: {
  weekdays: { key: string; label: string; day: number }[]
  today: number
}) {
  const { t } = useTranslation()
  const slots = ['07:00', '08:00', '13:30', '18:00'] as const
  return (
    <motion.div animate='shown' className='flex flex-col gap-3' initial='hidden' variants={list}>
      <motion.div
        className='grid grid-cols-3 rounded-full bg-white p-1 text-center text-xs font-semibold'
        variants={item}
      >
        <span className='rounded-full bg-forest-900 py-2 text-white'>{t('home.preview.byHour')}</span>
        <span className='py-2 text-forest-700'>{t('home.preview.byDay')}</span>
        <span className='py-2 text-forest-700'>{t('home.preview.byShift')}</span>
      </motion.div>
      <motion.div
        className='grid grid-cols-7 gap-1.5 rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]'
        variants={item}
      >
        {weekdays.map((weekday, index) => (
          <span
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${index === today ? 'bg-forest-900 text-white' : 'text-forest-700'}`}
            key={weekday.key}
          >
            <span className='opacity-70'>{weekday.label}</span>
            <span className='text-sm font-semibold'>{weekday.day}</span>
          </span>
        ))}
      </motion.div>
      <motion.div className='grid grid-cols-4 gap-2' variants={item}>
        {slots.map((slot) => (
          <span
            className={`rounded-xl py-2 text-center text-sm font-semibold ${slot === '08:00' ? 'bg-mint-300 text-forest-950' : 'bg-white/70 text-forest-700'}`}
            key={slot}
          >
            {slot}
          </span>
        ))}
      </motion.div>
      <motion.span
        className='mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-peach-300 text-sm font-semibold text-forest-950'
        variants={item}
      >
        {t('home.preview.send')}
        <Icon className='text-lg' name='send' />
      </motion.span>
    </motion.div>
  )
}
