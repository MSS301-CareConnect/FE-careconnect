import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

export function NotFoundPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.documentTitle'))

  return (
    <main className='grid min-h-screen place-items-center bg-surface px-6 py-16 text-on-surface'>
      <div className='max-w-lg rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-sm sm:p-12'>
        <p className='text-xs font-bold tracking-[0.2em] text-primary uppercase'>{t('notFound.eyebrow')}</p>
        <h1 className='mt-3 text-4xl font-bold tracking-tight text-on-surface'>{t('notFound.title')}</h1>
        <p className='mt-3 text-base leading-7 text-on-surface-variant'>{t('notFound.description')}</p>
        <Link
          className='mt-8 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          to='/'
        >
          {t('notFound.action')}
        </Link>
      </div>
    </main>
  )
}
