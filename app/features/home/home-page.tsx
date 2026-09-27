import { useTranslation } from 'react-i18next'

import { LanguageSwitch } from '~/shared/ui/language-switch'

const foundationKeys = ['contract', 'boundaries', 'ai'] as const

export function HomePage() {
  const { t } = useTranslation()

  return (
    <main className='mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-8'>
      <div className='mb-10 flex justify-end'>
        <LanguageSwitch />
      </div>
      <div className='max-w-3xl'>
        <p className='text-sm font-semibold tracking-[0.2em] text-teal-700 uppercase'>{t('common.brand')}</p>
        <h1 className='mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl'>{t('home.title')}</h1>
        <p className='mt-6 max-w-2xl text-lg leading-8 text-slate-600'>{t('home.description')}</p>
      </div>

      <section aria-labelledby='foundation-heading' className='mt-14 grid gap-4 md:grid-cols-3'>
        <h2 id='foundation-heading' className='sr-only'>
          {t('home.foundationHeading')}
        </h2>
        {foundationKeys.map((foundation) => (
          <article key={foundation} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h3 className='font-semibold text-slate-950'>{t(`home.foundations.${foundation}.title`)}</h3>
            <p className='mt-3 text-sm leading-6 text-slate-600'>{t(`home.foundations.${foundation}.description`)}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
