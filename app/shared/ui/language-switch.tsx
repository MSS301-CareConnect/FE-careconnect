import { useTranslation } from 'react-i18next'

import { setAppLanguage, type SupportedLanguage } from '~/shared/i18n/i18n'

const languages: SupportedLanguage[] = ['vi', 'en']

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage?.split('-')[0] ?? 'vi'

  return (
    <div aria-label={t('common.language.selector')} className='flex gap-1' role='group'>
      {languages.map((language) => {
        const isCurrent = currentLanguage === language
        const languageName = t(language === 'vi' ? 'common.language.vietnamese' : 'common.language.english')

        return (
          <button
            aria-label={t('common.language.switchTo', { language: languageName })}
            aria-pressed={isCurrent}
            className='min-h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-secondary-container aria-pressed:text-primary'
            key={language}
            onClick={() => void setAppLanguage(language)}
            type='button'
          >
            {t(language === 'vi' ? 'common.language.vietnameseShort' : 'common.language.englishShort')}
          </button>
        )
      })}
    </div>
  )
}
