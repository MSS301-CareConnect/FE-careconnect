import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { copyText } from '../lib/clipboard'
import { Icon } from './icon'

/**
 * Copies a short value (a booking code) and confirms in place for two seconds. `compact` keeps only the icon on narrow
 * screens; the label stays for screen readers.
 */
export function CopyButton({
  value,
  compact = false,
  className = ''
}: {
  value: string
  compact?: boolean
  className?: string
}) {
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
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary ${className}`}
      onClick={async () => {
        if (await copyText(value)) setCopied(true)
      }}
      type='button'
    >
      <Icon className={`text-base ${copied ? 'cc-pop' : ''}`} name={copied ? 'check' : 'content_copy'} />
      <span aria-live='polite' className={compact ? 'max-sm:sr-only' : ''}>
        {copied ? t('common.kit.copied') : t('common.kit.copy')}
      </span>
    </button>
  )
}
