import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type PasswordFieldProps = {
  autoComplete: 'current-password' | 'new-password'
  id: string
  label: string
  onChange: (value: string) => void
  value: string
}

export function PasswordField({ autoComplete, id, label, onChange, value }: PasswordFieldProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label className='block text-sm font-semibold text-on-surface' htmlFor={id}>
        {label}
      </label>
      <div className='relative mt-2'>
        <input
          autoComplete={autoComplete}
          className='h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pr-12 pl-4 text-sm text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'
          id={id}
          onChange={(event) => onChange(event.target.value)}
          required
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
          aria-pressed={visible}
          className='absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          onClick={() => setVisible((current) => !current)}
          type='button'
        >
          <svg
            aria-hidden='true'
            fill='none'
            height='22'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.8'
            viewBox='0 0 24 24'
            width='22'
          >
            <path d='M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z' />
            <circle cx='12' cy='12' r='2.5' />
            {visible && <path d='M4 4l16 16' />}
          </svg>
        </button>
      </div>
    </div>
  )
}
