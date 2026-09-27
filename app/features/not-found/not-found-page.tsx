import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

export function NotFoundPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.documentTitle'))

  return (
    <main className='grid min-h-screen place-items-center px-6 py-16'>
      <div className='max-w-lg text-center'>
        <p className='text-sm font-semibold tracking-[0.2em] text-teal-700 uppercase'>{t('notFound.eyebrow')}</p>
        <h1 className='mt-4 text-4xl font-semibold tracking-tight text-slate-950'>{t('notFound.title')}</h1>
        <p className='mt-4 text-base leading-7 text-slate-600'>{t('notFound.description')}</p>
        <Link
          className='mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950'
          to='/'
        >
          {t('notFound.action')}
        </Link>
      </div>
    </main>
  )
}
