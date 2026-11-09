import { motion } from 'motion/react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { easeSoft } from '~/shared/ui/motion'

export type AuthMode = 'login' | 'register' | 'forgot'

const titleKeys = {
  login: 'auth.shell.panel.login.title',
  register: 'auth.shell.panel.register.title',
  forgot: 'auth.shell.panel.forgot.title'
} as const

const photos = {
  login: '/images/login-care-moment.jpg',
  register: '/images/care-for-families.jpg',
  forgot: '/images/care-at-home-hero.jpg'
} as const

/**
 * The forest half of the auth card. Desktop: brand, eyebrow, a title with one serif word, a photo with a floating
 * glass chip, what the screen offers and the link to the other screen. Phones: only brand, title and description.
 * The content re-enters (key = mode) once the halves have finished sliding.
 */
export function AuthBrandPanel({ mode, delay }: { mode: AuthMode; delay: number }) {
  const { t } = useTranslation()
  const eyebrow =
    mode === 'login'
      ? t('auth.shell.panel.login.eyebrow')
      : mode === 'register'
        ? t('auth.registration.eyebrow')
        : t('auth.shell.panel.forgot.eyebrow')
  const description =
    mode === 'login'
      ? t('auth.visualDescription')
      : mode === 'register'
        ? t('auth.shell.panel.register.description')
        : t('auth.shell.panel.forgot.description')
  const chip =
    mode === 'login'
      ? t('auth.shell.panel.login.chip')
      : mode === 'register'
        ? t('auth.shell.panel.register.chip')
        : t('auth.shell.panel.forgot.chip')

  return (
    <aside className='relative isolate flex h-full flex-col overflow-hidden bg-forest-900 px-6 pt-5 pb-6 text-white sm:px-8 lg:px-12 lg:pt-10 lg:pb-10 xl:px-16'>
      <span
        aria-hidden='true'
        className='absolute -top-28 -right-24 -z-10 h-80 w-80 rounded-full bg-mint-400/20 blur-3xl'
      />
      <span
        aria-hidden='true'
        className='absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-peach-300/15 blur-3xl'
      />

      <Link
        className='inline-flex w-fit items-center gap-2 rounded-full pr-2 text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
        to='/'
      >
        <span aria-hidden='true' className='grid h-10 w-10 place-items-center rounded-full bg-mint-200 text-forest-900'>
          <Icon className='text-xl' name='volunteer_activism' />
        </span>
        {t('common.brand')}
      </Link>

      <motion.div
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        className='flex min-h-0 flex-1 flex-col'
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        key={mode}
        transition={{ duration: 0.5, delay, ease: easeSoft }}
      >
        <p className='mt-7 hidden w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-mint-100 lg:inline-flex'>
          <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-300' />
          {eyebrow}
        </p>
        <h2 className='mt-4 max-w-[22ch] text-[1.55rem] leading-[1.15] font-bold tracking-tight text-balance lg:text-[clamp(1.9rem,2.4vw,2.35rem)]'>
          <Trans components={{ accent: <em className='cc-accent-serif text-peach-200' /> }} i18nKey={titleKeys[mode]} />
        </h2>
        <p className='mt-2 max-w-md text-sm leading-6 text-white/70 lg:mt-3 lg:text-[15px]'>{description}</p>

        <div className='relative mt-6 hidden min-h-[7rem] flex-1 overflow-hidden rounded-3xl lg:block'>
          <img
            alt=''
            className='absolute inset-0 h-full w-full object-cover object-center'
            fetchPriority='high'
            src={photos[mode]}
          />
          <span aria-hidden='true' className='absolute inset-0 bg-gradient-to-t from-forest-950/50 to-transparent' />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            className='absolute bottom-4 left-4'
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className='cc-glass flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-sm font-semibold text-forest-900 shadow-[var(--shadow-soft)]'>
              <span className='grid h-7 w-7 place-items-center rounded-full bg-mint-200 text-forest-900'>
                <Icon className='text-base' filled name={mode === 'forgot' ? 'mark_email_read' : 'verified'} />
              </span>
              {chip}
            </span>
          </motion.div>
        </div>

        <div className='mt-6 hidden lg:block'>
          <PanelPoints mode={mode} />
        </div>

        <div className='mt-6 hidden items-center justify-between gap-4 border-t border-white/10 pt-5 lg:flex'>
          <span className='text-sm text-white/70'>
            {mode === 'login'
              ? t('auth.registration.needAccount')
              : mode === 'register'
                ? t('auth.registration.haveAccount')
                : t('auth.shell.rememberPassword')}
          </span>
          <Link
            className='inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            to={mode === 'login' ? '/register' : '/login'}
          >
            {mode === 'login' ? t('auth.shell.registerTab') : t('auth.shell.signInTab')}
            <Icon className='text-base' name='arrow_forward' />
          </Link>
        </div>
      </motion.div>
    </aside>
  )
}

function PanelPoints({ mode }: { mode: AuthMode }) {
  const { t } = useTranslation()

  if (mode === 'login') {
    const pillars = [
      {
        icon: 'verified_user',
        title: t('auth.shell.panel.login.pillars.profilesTitle'),
        text: t('auth.shell.panel.login.pillars.profilesText')
      },
      {
        icon: 'event_available',
        title: t('auth.shell.panel.login.pillars.bookingTitle'),
        text: t('auth.shell.panel.login.pillars.bookingText')
      },
      {
        icon: 'monitoring',
        title: t('auth.shell.panel.login.pillars.followTitle'),
        text: t('auth.shell.panel.login.pillars.followText')
      }
    ]
    return (
      <ul className='grid grid-cols-3 gap-4'>
        {pillars.map((pillar) => (
          <li className='min-w-0' key={pillar.icon}>
            <span className='grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-mint-200'>
              <Icon className='text-xl' name={pillar.icon} />
            </span>
            <p className='mt-2.5 text-sm font-semibold'>{pillar.title}</p>
            <p className='mt-0.5 text-xs leading-5 text-white/60'>{pillar.text}</p>
          </li>
        ))}
      </ul>
    )
  }

  const lines =
    mode === 'register'
      ? [t('auth.registration.benefitOne'), t('auth.registration.benefitTwo'), t('auth.registration.benefitThree')]
      : [
          t('auth.shell.panel.forgot.stepOne'),
          t('auth.shell.panel.forgot.stepTwo'),
          t('auth.shell.panel.forgot.stepThree')
        ]

  return (
    <ul className='grid gap-2.5'>
      {lines.map((line, index) => (
        <li className='flex items-center gap-3 text-[15px] font-medium text-white/90' key={line}>
          {mode === 'register' ? (
            <Icon className='shrink-0 text-xl text-mint-300' filled name='check_circle' />
          ) : (
            <span
              aria-hidden='true'
              className='grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint-200 text-xs font-bold text-forest-900'
            >
              {index + 1}
            </span>
          )}
          {line}
        </li>
      ))}
    </ul>
  )
}
