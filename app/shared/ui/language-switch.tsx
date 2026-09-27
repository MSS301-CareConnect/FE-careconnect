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
            className='rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-700 aria-pressed:border-teal-700 aria-pressed:bg-teal-50 aria-pressed:text-teal-800'
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
