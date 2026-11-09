import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { authIcon, authInput, authLabel } from './auth-styles'

type PasswordFieldProps = {
  autoComplete: 'current-password' | 'new-password'
  id: string
  label: string
  onChange: (value: string) => void
  value: string
  /** `auth`: the sign-in / registration / reset look (lock icon, mint focus). Other screens keep the default. */
  variant?: 'default' | 'auth'
  action?: ReactNode
  required?: boolean
  requiredIndicator?: boolean
}

export function PasswordField({
  autoComplete,
  id,
  label,
  onChange,
  value,
  variant = 'default',
  action,
  required = true,
  requiredIndicator
}: PasswordFieldProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const auth = variant === 'auth'
  const showAsterisk = auth && (requiredIndicator ?? required)

  return (
    <div>
      <div className='mb-1.5 flex items-center justify-between gap-2'>
        <label
          className={`${auth ? authLabel : 'block text-sm font-semibold text-on-surface'} ${
            showAsterisk ? "after:ml-1 after:font-bold after:text-rose-500 after:content-['*']" : ''
          }`}
          htmlFor={id}
        >
          {label}
        </label>
        {action}
      </div>
      <div className={`relative ${auth ? 'group' : ''}`}>
        {auth ? <Icon className={authIcon} name='lock' /> : null}
        <input
          autoComplete={autoComplete}
          className={
            auth
              ? `${authInput} pr-11`
              : 'h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'
          }
          id={id}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
          aria-pressed={visible}
          className={
            auth
              ? 'absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-forest-800/40 transition-colors hover:text-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
              : 'absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          }
          onClick={() => setVisible((current) => !current)}
          type='button'
        >
          <svg
            aria-hidden='true'
            fill='none'
            height='20'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.8'
            viewBox='0 0 24 24'
            width='20'
          >
            <path d='M2.5 12C4.5 8.5 7.8 6 12 6s7.5 2.5 9.5 6c-2 3.5-5.3 6-9.5 6S4.5 15.5 2.5 12Z' />
            <circle cx='12' cy='12' r='2.5' />
            {auth ? (
              // The slash draws in and out instead of popping (after the EXE eye button).
              <path
                className='transition-[stroke-dashoffset] duration-200 ease-out'
                d='M4 4l16 16'
                strokeDasharray='23'
                strokeDashoffset={visible ? 0 : 23}
              />
            ) : (
              visible && <path d='M4 4l16 16' />
            )}
          </svg>
        </button>
      </div>
    </div>
  )
}
