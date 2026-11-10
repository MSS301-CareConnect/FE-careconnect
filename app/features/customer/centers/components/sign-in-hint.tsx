import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

/** What a visitor sees where a request answered 401: why, and a sign-in link that brings them back here. */
export function SignInHint({ title, text }: { title?: string; text: string }) {
  const { t } = useTranslation()
  const location = useLocation()
  const next = encodeURIComponent(`${location.pathname}${location.search}`)

  return (
    <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5'>
      <p className='flex min-w-0 items-start gap-3 text-sm leading-6 text-on-surface-variant'>
        <Icon aria-hidden='true' className='mt-0.5 shrink-0 text-xl text-primary' name='lock' />
        <span>
          {title ? <strong className='block font-semibold text-on-surface'>{title}</strong> : null}
          {text}
        </span>
      </p>
      <Link
        className='inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        to={`/login?next=${next}`}
      >
        <Icon aria-hidden='true' className='text-lg' name='login' />
        {t('customer.centerPicker.states.signIn')}
      </Link>
    </div>
  )
}
