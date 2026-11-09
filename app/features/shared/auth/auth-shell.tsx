import { motion, type HTMLMotionProps } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'
import { easeSoft } from '~/shared/ui/motion'

import { AuthBrandPanel, type AuthMode } from './auth-brand-panel'

export type { AuthMode } from './auth-brand-panel'

/**
 * Shared frame of /login, /register and /forgot-password ("Soft Bento", 2026-11-09, after the owner's EXE auth
 * screens). Desktop (lg): the whole screen split in two — the forest panel and the form, each a full-height half.
 * Sign-in and reset keep the panel on the left, registration moves it to the right, so going /login ↔ /register
 * slides both halves across. The back link and the language switch ride on top of the form half. Phones: one column
 * — the back link and language switch, a short forest strip, Sign in | Sign up tabs, then the form.
 *
 * The three screens are separate routes, so the frame remounts on every switch; `previousMode` remembers the screen
 * that was open so the halves start where they were and slide to their new side.
 */
let previousMode: AuthMode | null = null

const panelOnLeft = (mode: AuthMode) => mode !== 'register'

type AuthShellProps = {
  mode: AuthMode
  back: { to: string; label: string }
  children: ReactNode
}

export function AuthShell({ mode, back, children }: AuthShellProps) {
  const [arrivedFrom] = useState(() => previousMode)
  const [leftNow, setLeftNow] = useState(() => panelOnLeft(arrivedFrom ?? mode))
  const sliding = arrivedFrom !== null && panelOnLeft(arrivedFrom) !== panelOnLeft(mode)
  const formSide = leftNow ? 'lg:translate-x-full' : 'lg:translate-x-0'

  useEffect(() => {
    previousMode = mode
    // Two frames: the first paint keeps the old side, the next one moves it, so the CSS transition runs.
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setLeftNow(panelOnLeft(mode)))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [mode])

  return (
    <main className='relative min-h-dvh overflow-clip bg-white text-forest-950 lg:h-dvh lg:min-h-[40rem]'>
      <div
        className={`cc-auth-slide flex items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:absolute lg:top-0 lg:left-0 lg:z-20 lg:w-1/2 lg:px-10 lg:py-6 xl:px-14 ${formSide}`}
      >
        <Link
          className='inline-flex min-h-11 items-center gap-1.5 rounded-full bg-forest-900/[0.05] py-2 pr-4 pl-3 text-sm font-semibold whitespace-nowrap text-forest-800 transition-colors hover:bg-forest-900/10 hover:text-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
          to={back.to}
        >
          <Icon className='text-lg' name='arrow_back' />
          {back.label}
        </Link>
        <LanguageSwitch />
      </div>

      <div
        className={`cc-auth-slide mx-3 overflow-hidden rounded-[1.75rem] sm:mx-5 lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 lg:mx-0 lg:w-1/2 lg:rounded-none ${leftNow ? 'lg:translate-x-0' : 'lg:translate-x-full'}`}
      >
        <AuthBrandPanel delay={sliding ? 0.38 : 0.15} mode={mode} />
      </div>

      {mode === 'forgot' ? null : <AuthTabs active={mode} arrivedFrom={arrivedFrom} />}

      <div
        className={`cc-auth-slide flex lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 lg:overflow-y-auto lg:pt-20 ${formSide}`}
      >
        <motion.div
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          className='m-auto w-full max-w-[30rem] px-5 pt-6 pb-10 sm:px-8 lg:px-10 lg:py-10'
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, delay: sliding ? 0.38 : 0.12, ease: easeSoft }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  )
}

/** Sign in | Sign up on phones; the white highlight slides from the screen that was open before. */
function AuthTabs({ active, arrivedFrom }: { active: 'login' | 'register'; arrivedFrom: AuthMode | null }) {
  const { t } = useTranslation()
  const offset = (mode: AuthMode | null) => (mode === 'register' ? '100%' : '0%')
  const tabs = [
    { mode: 'login', to: '/login', label: t('auth.shell.signInTab') },
    { mode: 'register', to: '/register', label: t('auth.shell.registerTab') }
  ] as const

  return (
    <nav
      aria-label={t('auth.shell.tabsLabel')}
      className='relative mx-5 mt-5 grid grid-cols-2 rounded-2xl bg-forest-900/[0.06] p-1 sm:mx-8 lg:hidden'
    >
      <motion.span
        animate={{ x: offset(active) }}
        aria-hidden='true'
        className='absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-[var(--shadow-soft)]'
        initial={{ x: offset(arrivedFrom === 'register' || arrivedFrom === 'login' ? arrivedFrom : active) }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      />
      {tabs.map((tab) => (
        <Link
          aria-current={tab.mode === active ? 'page' : undefined}
          className={`relative grid min-h-11 place-items-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${tab.mode === active ? 'text-forest-950' : 'text-forest-800/60 hover:text-forest-950'}`}
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
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      transition={{ duration: 0.45, ease: easeSoft }}
      {...props}
    />
  )
}
