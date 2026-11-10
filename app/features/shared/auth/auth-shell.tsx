import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useOutlet } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'
import { easeSoft } from '~/shared/ui/motion'

import { AuthBrandPanel, authPanelPhotos, type AuthMode } from './auth-brand-panel'

export type { AuthMode } from './auth-brand-panel'

const modeOf = (pathname: string): AuthMode =>
  pathname.startsWith('/register') ? 'register' : pathname.startsWith('/forgot-password') ? 'forgot' : 'login'

/**
 * Layout of /login, /register and /forgot-password. It stays mounted across those pages, so on desktop the forest
 * card and the form slide past each other (CSS `translate`, 760 ms) and the pages swap while they cross.
 */
export function AuthShell() {
  const { t } = useTranslation()
  const location = useLocation()
  const outlet = useOutlet()
  const mode = modeOf(location.pathname)
  const panelOnLeft = mode !== 'register'
  const back =
    mode === 'forgot' ? { to: '/login', label: t('auth.shell.backToSignIn') } : { to: '/', label: t('auth.backHome') }

  // Warm the other photos so a swap never waits on an image.
  useEffect(() => {
    for (const src of Object.values(authPanelPhotos)) {
      const image = new Image()
      image.src = src
    }
  }, [])

  return (
    <main className='relative min-h-dvh overflow-x-hidden bg-[#f8f9f6] text-forest-950 lg:h-dvh lg:overflow-hidden'>
      {/* Language Switch: anchored top-right; dark tone while the forest card sits on the right */}
      <div className='fixed top-4 right-4 z-40 sm:top-6 sm:right-8'>
        <div className='lg:hidden'>
          <LanguageSwitch />
        </div>
        <div className='hidden lg:block'>
          <LanguageSwitch tone={panelOnLeft ? 'light' : 'dark'} />
        </div>
      </div>

      {/* Sliding Brand Card on Desktop */}
      <div
        className={`cc-auth-card-slide absolute inset-y-0 left-0 z-20 hidden w-1/2 lg:block ${
          panelOnLeft ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Curved Card: the arc sits on the side facing the form */}
        <div className={`h-full w-full overflow-hidden ${panelOnLeft ? 'cc-auth-card-left' : 'cc-auth-card-right'}`}>
          <AuthBrandPanel curve={panelOnLeft ? 'right' : 'left'} mode={mode} />
        </div>

        {/* Floating Circular Switch Button with < or > icon */}
        {mode === 'forgot' ? null : (
          <div
            className={`absolute top-1/2 z-30 -translate-y-1/2 transition-all duration-[760ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
              panelOnLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
            }`}
          >
            <Link
              aria-label={panelOnLeft ? t('auth.shell.registerTab') : t('auth.shell.signInTab')}
              className='group grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-forest-900 text-mint-300 shadow-[0_10px_25px_-4px_rgba(7,29,24,0.45)] transition-all duration-200 hover:scale-110 hover:bg-mint-300 hover:text-forest-950 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
              title={panelOnLeft ? t('auth.shell.registerTab') : t('auth.shell.signInTab')}
              to={mode === 'login' ? '/register' : '/login'}
            >
              <Icon
                className={`text-2xl transition-transform ${
                  panelOnLeft ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'
                }`}
                name={panelOnLeft ? 'chevron_right' : 'chevron_left'}
              />
            </Link>
          </div>
        )}
      </div>

      {/* Form Area: slides the opposite way to the card on desktop */}
      <div
        className={`cc-auth-form-slide flex flex-col justify-between px-4 py-4 sm:px-8 lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 lg:w-1/2 lg:overflow-y-auto lg:p-0 ${
          panelOnLeft ? 'lg:translate-x-full' : 'lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <header className='flex items-center px-2 py-2 sm:px-4 lg:px-12 lg:pt-6'>
          <Link
            className='inline-flex min-h-10 items-center gap-1.5 rounded-full border border-forest-900/10 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-forest-800 shadow-xs backdrop-blur transition-all hover:border-forest-900/20 hover:bg-forest-50 hover:text-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
            to={back.to}
          >
            <Icon className='text-base' name='arrow_back' />
            {back.label}
          </Link>
        </header>

        {/* Mobile Brand Banner */}
        <div className='mx-2 my-2 overflow-hidden rounded-2xl lg:hidden'>
          <div className='flex items-center justify-between bg-forest-900 px-5 py-3.5 text-white shadow-md'>
            <Link className='inline-flex items-center gap-2 font-bold' to='/'>
              <span className='grid h-8 w-8 place-items-center rounded-lg bg-mint-300 text-forest-950 shadow-xs'>
                <Icon className='text-base' name='volunteer_activism' />
              </span>
              <span className='tracking-tight'>{t('common.brand')}</span>
            </Link>
            <span className='text-xs font-medium text-mint-200'>{t('auth.shell.panel.login.eyebrow')}</span>
          </div>
        </div>

        {/* Mobile Tabs */}
        {mode === 'forgot' ? null : <AuthTabs active={mode} />}

        {/* Form Card */}
        <div className='my-auto flex w-full justify-center px-2 py-6 sm:px-6 lg:px-10'>
          <div className='w-full max-w-[460px] rounded-3xl border border-forest-900/5 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-9'>
            <AnimatePresence initial={false} mode='wait'>
              <motion.div
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.28, ease: easeSoft } }}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                key={mode}
                transition={{ duration: 0.4, delay: 0.08, ease: easeSoft }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Spacer for bottom balance */}
        <div className='h-4' />
      </div>
    </main>
  )
}

/** Sign in | Sign up tabs on mobile */
function AuthTabs({ active }: { active: 'login' | 'register' }) {
  const { t } = useTranslation()
  const offset = (mode: 'login' | 'register') => (mode === 'register' ? '100%' : '0%')
  const tabs = [
    { mode: 'login', to: '/login', label: t('auth.shell.signInTab') },
    { mode: 'register', to: '/register', label: t('auth.shell.registerTab') }
  ] as const

  return (
    <nav
      aria-label={t('auth.shell.tabsLabel')}
      className='relative mx-2 mt-2 mb-2 grid grid-cols-2 rounded-2xl bg-forest-900/[0.06] p-1 sm:mx-6 lg:hidden'
    >
      <motion.span
        animate={{ x: offset(active) }}
        aria-hidden='true'
        className='absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-xs'
        initial={false}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      />
      {tabs.map((tab) => (
        <Link
          aria-current={tab.mode === active ? 'page' : undefined}
          className={`relative grid min-h-10 place-items-center rounded-xl text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${
            tab.mode === active ? 'text-forest-950' : 'text-forest-800/60 hover:text-forest-950'
          }`}
          key={tab.mode}
          to={tab.to}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

/** Re-runs the soft entrance when its `key` changes — one step of a form replacing another. */
export function AuthSwap(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
      transition={{ duration: 0.4, ease: easeSoft }}
      {...props}
    />
  )
}
