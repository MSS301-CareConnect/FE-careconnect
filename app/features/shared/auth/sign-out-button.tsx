import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { signOut } from './session-api'

export function SignOutButton({ appearance = 'default' }: { appearance?: 'default' | 'menu' }) {
  const { t } = useTranslation()
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleSignOut() {
    setPending(true)
    setFailed(false)
    try {
      await signOut()
      window.location.replace('/login')
    } catch {
      setPending(false)
      setFailed(true)
    }
  }

  return (
    <span className={appearance === 'menu' ? 'flex w-full flex-col' : 'inline-flex flex-col items-end'}>
      <button
        className={
          appearance === 'menu'
            ? 'w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-on-surface hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary'
            : 'rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container'
        }
        disabled={pending}
        onClick={() => void handleSignOut()}
        type='button'
      >
        {pending ? t('auth.signingOut') : t('auth.signOut')}
      </button>
      {failed && (
        <span className='text-xs text-error' role='alert'>
          {t('auth.signOutFailed')}
        </span>
      )}
    </span>
  )
}
