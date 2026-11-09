import { motion } from 'motion/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { setAppLanguage, type SupportedLanguage } from '~/shared/i18n/i18n'

const languages: SupportedLanguage[] = ['vi', 'en']

/** VI / EN as a small pill with a forest highlight that slides to the chosen language ("Soft Bento", 2026-11-09). */
export function LanguageSwitch({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { i18n, t } = useTranslation()
  const id = useId()
  const currentLanguage = i18n.resolvedLanguage?.split('-')[0] ?? 'vi'
  const dark = tone === 'dark'

  return (
    <div
      aria-label={t('common.language.selector')}
      className={`flex rounded-full p-1 ${dark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-forest-900/[0.06] ring-1 ring-forest-900/5'}`}
      role='group'
    >
      {languages.map((language) => {
        const isCurrent = currentLanguage === language
        const languageName = t(language === 'vi' ? 'common.language.vietnamese' : 'common.language.english')

        return (
          <button
            aria-label={t('common.language.switchTo', { language: languageName })}
            aria-pressed={isCurrent}
            className={`relative min-h-8 min-w-10 rounded-full px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${dark ? 'focus-visible:outline-white' : 'focus-visible:outline-forest-900'} ${isCurrent ? (dark ? 'text-forest-950' : 'text-white') : dark ? 'text-white/70 hover:text-white' : 'text-forest-800/70 hover:text-forest-950'}`}
            key={language}
            onClick={() => void setAppLanguage(language)}
            type='button'
          >
            {isCurrent ? (
              <motion.span
                aria-hidden='true'
                className={`absolute inset-0 rounded-full ${dark ? 'bg-mint-200' : 'bg-forest-900'}`}
                layoutId={`${id}-language`}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className='relative'>
              {t(language === 'vi' ? 'common.language.vietnameseShort' : 'common.language.englishShort')}
            </span>
          </button>
        )
      })}
    </div>
  )
}
