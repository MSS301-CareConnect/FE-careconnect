import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { signOut } from './session-api'

export function SignOutButton() {
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
    <span className='inline-flex flex-col items-end'>
      <button
        className='rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container'
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
