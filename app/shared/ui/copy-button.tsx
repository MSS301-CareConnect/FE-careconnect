import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from './icon'

/** Copies a short value (a booking code) and confirms in place for two seconds. */
export function CopyButton({ value, className = '' }: { value: string; className?: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <button
      aria-label={copied ? t('common.kit.copied') : `${t('common.kit.copy')} ${value}`}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary ${className}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => setCopied(true))
      }}
      type='button'
    >
      <Icon className={`text-base ${copied ? 'cc-pop' : ''}`} name={copied ? 'check' : 'content_copy'} />
      <span aria-live='polite'>{copied ? t('common.kit.copied') : t('common.kit.copy')}</span>
    </button>
  )
}
