import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export function CaregiverFooter() {
  const { t, i18n } = useTranslation()
  const year = new Intl.DateTimeFormat(i18n.resolvedLanguage, { year: 'numeric' }).format(new Date())
  return (
    <footer className='border-t border-outline-variant/20 bg-surface-container-low'>
      <div className='mx-auto max-w-7xl px-6 py-12 lg:px-12'>
        <div className='grid gap-10 md:grid-cols-3'>
          <div>
            <p className='text-xl font-extrabold text-primary'>{t('caregiver.footer.brand')}</p>
            <p className='mt-4 text-sm leading-7 text-on-surface-variant'>{t('caregiver.footer.description')}</p>
            <p className='mt-5 flex items-start gap-2 text-xs leading-5 text-outline'>
              <Icon className='text-lg' name='verified_user' />
              {t('caregiver.footer.credential')}
            </p>
          </div>
          <div>
            <h2 className='font-bold'>{t('caregiver.footer.support')}</h2>
            <p className='mt-4 flex items-center gap-2 text-sm text-on-surface-variant'>
              <Icon name='call' />
              {t('caregiver.footer.supportDetail')}
            </p>
            <p className='mt-4 flex items-center gap-2 text-sm text-on-surface-variant'>
              <Icon name='health_and_safety' />
              {t('caregiver.footer.advice')}
            </p>
          </div>
          <div>
            <h2 className='font-bold'>{t('caregiver.footer.policies')}</h2>
            <ul className='mt-4 space-y-3'>
              {(['clinical', 'insurance', 'emergency', 'benefits'] as const).map((key) => (
                <li key={key}>
                  <button
                    className='text-left text-sm text-outline disabled:cursor-not-allowed'
                    disabled
                    title={t('caregiver.unavailable')}
                    type='button'
                  >
                    {t(`caregiver.footer.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='mt-10 flex flex-col justify-between gap-5 border-t border-outline-variant/30 pt-6 text-xs text-outline md:flex-row'>
          <div>
            <p>{t('caregiver.footer.copyright', { year })}</p>
            <p className='mt-2'>{t('caregiver.footer.audience')}</p>
          </div>
          <div className='flex flex-wrap items-center gap-4'>
            <span className='flex items-center gap-2'>
              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
              {t('caregiver.footer.status')}
            </span>
            {(['terms', 'privacy'] as const).map((key) => (
              <button disabled key={key} title={t('caregiver.unavailable')} type='button'>
                {t(`caregiver.footer.${key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
