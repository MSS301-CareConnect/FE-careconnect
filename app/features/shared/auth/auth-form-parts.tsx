import { motion } from 'motion/react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { easeSoft } from '~/shared/ui/motion'

import { authError, authIcon, authInput, authLabel, authNotice } from './auth-styles'

type AuthTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & {
  id: string
  label: string
  icon: string
  inputClassName?: string
}

/** Label + input with a leading Material Symbol that turns mint while the field has focus. */
export function AuthTextField({ id, label, icon, inputClassName, ...input }: AuthTextFieldProps) {
  return (
    <div>
      <label className={authLabel} htmlFor={id}>
        {label}
      </label>
      <div className='group relative mt-2'>
        <Icon className={authIcon} name={icon} />
        <input className={`${authInput} ${inputClassName ?? ''}`} id={id} {...input} />
      </div>
    </div>
  )
}

/** "Step 1 of 2" with one segment per step; finished segments are mint, the current one forest. */
export function AuthSteps({ steps, current }: { steps: string[]; current: number }) {
  const { t } = useTranslation()
  const shown = Math.min(current, steps.length - 1)

  return (
    <div className='mb-6'>
      <p className='text-xs font-bold tracking-[0.08em] text-forest-700 uppercase'>
        {t('auth.shell.steps.progress', { current: shown + 1, total: steps.length })}
      </p>
      <ol aria-label={t('auth.shell.steps.label')} className='mt-2.5 grid auto-cols-fr grid-flow-col gap-2'>
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <li aria-current={active ? 'step' : undefined} className='min-w-0' key={step}>
              <span className='block h-1.5 overflow-hidden rounded-full bg-forest-900/[0.08]'>
                <motion.span
                  animate={{ scaleX: done || active ? 1 : 0 }}
                  className={`block h-full origin-left rounded-full ${done ? 'bg-mint-400' : 'bg-forest-900'}`}
                  initial={false}
                  transition={{ duration: 0.5, ease: easeSoft }}
                />
              </span>
              <span
                className={`mt-1.5 flex items-center gap-1 truncate text-xs font-semibold ${active ? 'text-forest-950' : done ? 'text-mint-500' : 'text-forest-800/45'}`}
              >
                {done ? <Icon className='text-sm' name='check' /> : null}
                {step}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Error (`role="alert"`) or neutral notice (`role="status"`) with its icon. */
export function AuthMessage({ tone, children }: { tone: 'error' | 'notice'; children: ReactNode }) {
  return (
    <p className={tone === 'error' ? authError : authNotice} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon
        className={`mt-px shrink-0 text-lg ${tone === 'error' ? 'text-error' : 'text-mint-500'}`}
        filled
        name={tone === 'error' ? 'error' : 'mark_email_read'}
      />
      <span>{children}</span>
    </p>
  )
}
