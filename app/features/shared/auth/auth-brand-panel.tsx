import { AnimatePresence, motion } from 'motion/react'
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

export const authPanelPhotos = {
  login: '/images/login-care-moment.jpg',
  register: '/images/care-for-families.jpg',
  forgot: '/images/care-at-home-hero.jpg'
} as const

/**
 * The forest half of the auth screen: brand, eyebrow, a title with one serif accent,
 * a large photo with floating glass chip positioned to avoid covering faces, and value pillars.
 */
export function AuthBrandPanel({
  mode,
  curve = 'right'
}: {
  mode: AuthMode
  /** Side of the card that is curved — content keeps clear of the arc on that side. */
  curve?: 'left' | 'right'
}) {
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
    <aside
      className={`relative isolate flex h-full flex-col justify-between overflow-hidden bg-forest-900 px-8 py-8 text-white transition-[padding] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] sm:px-10 lg:py-10 ${
        curve === 'right' ? 'lg:pr-[19%] lg:pl-12 xl:pl-16' : 'lg:pr-12 lg:pl-[19%] xl:pr-16'
      }`}
    >
      {/* Soft ambient lighting glows */}
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -top-24 -right-20 -z-10 h-72 w-72 rounded-full bg-mint-400/20 blur-3xl'
      />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -bottom-28 -left-20 -z-10 h-72 w-72 rounded-full bg-peach-300/15 blur-3xl'
      />

      {/* Brand logo */}
      <div>
        <Link
          className='inline-flex items-center gap-2.5 rounded-full pr-3 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
          to='/'
        >
          <span
            aria-hidden='true'
            className='grid h-10 w-10 place-items-center rounded-xl bg-mint-300 text-forest-950 shadow-xs'
          >
            <Icon className='text-xl' name='volunteer_activism' />
          </span>
          <span className='font-bold text-xl tracking-tight'>{t('common.brand')}</span>
        </Link>
      </div>

      {/* Dynamic mode content: the photo flexes so the footer always stays in view */}
      <AnimatePresence initial={false} mode='wait'>
        <motion.div
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          className='flex min-h-0 flex-1 flex-col justify-center gap-4 py-5 xl:gap-5'
          exit={{ opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: 0.28, ease: easeSoft } }}
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          key={mode}
          transition={{ duration: 0.45, delay: 0.08, ease: easeSoft }}
        >
          <div className='shrink-0'>
            <p className='inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-mint-100 backdrop-blur-xs'>
              <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-300' />
              {eyebrow}
            </p>
            <h2 className='mt-3 max-w-[20ch] text-[1.65rem] leading-[1.2] font-bold tracking-tight text-balance xl:text-[2.1rem]'>
              <Trans
                components={{ accent: <em className='cc-accent-serif text-peach-200 not-italic' /> }}
                i18nKey={titleKeys[mode]}
              />
            </h2>
            <p className='mt-2 max-w-md text-sm leading-relaxed text-white/75 xl:text-[15px]'>{description}</p>
          </div>

          {/* Hero photo: taller, with badge placed at top-right to NEVER cover faces */}
          <div className='relative hidden max-h-72 min-h-28 w-full flex-1 overflow-hidden rounded-3xl border border-white/15 shadow-xl lg:block'>
            <img
              alt=''
              className='h-full w-full object-cover object-center'
              fetchPriority='high'
              src={authPanelPhotos[mode]}
            />
            <span
              aria-hidden='true'
              className='absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent'
            />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              className='absolute top-3.5 right-3.5 z-10'
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className='cc-glass flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-xs font-semibold text-forest-950 shadow-md'>
                <span className='grid h-5 w-5 place-items-center rounded-full bg-mint-300 text-forest-950'>
                  <Icon className='text-xs' filled name={mode === 'forgot' ? 'mark_email_read' : 'verified'} />
                </span>
                {chip}
              </span>
            </motion.div>
          </div>

          {/* Feature pillars */}
          <div className='hidden shrink-0 lg:block'>
            <PanelPoints mode={mode} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Subtle brand reassurance footer */}
      <div className='hidden shrink-0 items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/60 lg:flex'>
        <span>
          © {t('common.brand')} {new Date().getFullYear()}
        </span>
        <span className='inline-flex items-center gap-1.5 text-mint-200/90 font-medium'>
          <Icon className='text-sm' name='verified_user' />
          {t('auth.shell.securityNote')}
        </span>
      </div>
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
      <ul className='grid grid-cols-3 gap-3'>
        {pillars.map((pillar) => (
          <li className='min-w-0 rounded-2xl bg-white/[0.07] p-3 border border-white/10 shadow-sm' key={pillar.icon}>
            <span className='grid h-8 w-8 place-items-center rounded-xl bg-mint-400/20 text-mint-200'>
              <Icon className='text-base' name={pillar.icon} />
            </span>
            <p className='mt-2 text-xs font-semibold text-white/95'>{pillar.title}</p>
            <p className='mt-0.5 text-[11px] leading-4 text-white/60'>{pillar.text}</p>
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
    <ul className='grid gap-2'>
      {lines.map((line, index) => (
        <li
          className='flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-2.5 text-xs font-medium text-white/90 border border-white/10 shadow-sm'
          key={line}
        >
          {mode === 'register' ? (
            <Icon className='shrink-0 text-base text-mint-300' filled name='check_circle' />
          ) : (
            <span
              aria-hidden='true'
              className='grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-300 text-[11px] font-bold text-forest-950'
            >
              {index + 1}
            </span>
          )}
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}
