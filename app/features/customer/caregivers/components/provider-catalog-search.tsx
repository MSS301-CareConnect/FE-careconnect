import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const key = 'customer.provider' as const

export function ProviderCatalogSearch({ keyword, onSearch }: { keyword: string; onSearch: (value: string) => void }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(keyword)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(draft.trim())
  }

  return (
    <section className='relative isolate overflow-hidden border-b border-[#dce5dc] bg-[#f7f8f5]'>
      <div
        aria-hidden='true'
        className='absolute inset-0 bg-[#fbfcf9]'
        style={{
          backgroundImage: "url('/images/caregiver-catalog-hero.jpg')",
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto 100%'
        }}
      />
      <div aria-hidden='true' className='absolute inset-0 bg-[#fbfcf9]/88 lg:hidden' />
      <div
        aria-hidden='true'
        className='absolute inset-0 hidden lg:block'
        style={{
          backgroundImage:
            'linear-gradient(90deg, #fbfcf9 0%, rgba(251,252,249,.98) 29%, rgba(251,252,249,.84) 48%, rgba(251,252,249,.08) 82%)'
        }}
      />
      <div className='relative mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20'>
        <p className='text-xs font-bold uppercase tracking-[0.16em] text-[#075b31]'>{t(`${key}.catalogBadge`)}</p>
        <h1 className='mt-4 max-w-[18ch] text-[clamp(2.75rem,4.4vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#1b2922]'>
          {t(`${key}.catalogTitle`)}
        </h1>
        <p className='mt-5 max-w-[54ch] text-base leading-7 text-[#435b4a] lg:text-lg lg:leading-8'>
          {t(`${key}.catalogIntro`)}
        </p>

        <form
          className='mt-9 flex max-w-[850px] flex-col gap-3 sm:flex-row sm:items-stretch lg:mt-12'
          onSubmit={submit}
          role='search'
        >
          <div className='flex min-h-15 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#bbccbd] bg-white px-4 transition-colors focus-within:border-[#075b31] focus-within:ring-2 focus-within:ring-[#075b31]/10 sm:px-5'>
            <Icon className='shrink-0 text-2xl text-[#075b31]' name='search' />
            <input
              aria-label={t(`${key}.searchPlaceholder`)}
              className='h-full min-w-0 flex-1 bg-transparent py-4 text-base text-[#1b2922] outline-none placeholder:text-[#78877d]'
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t(`${key}.searchPlaceholder`)}
              type='search'
              value={draft}
            />
          </div>
          <button
            className='inline-flex min-h-15 items-center justify-center gap-3 rounded-xl bg-[#075b31] px-8 text-sm font-bold text-white transition-colors hover:bg-[#064a29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
            type='submit'
          >
            {t(`${key}.search`)}
            <Icon className='text-lg' name='arrow_forward' />
          </button>
        </form>
        <p className='mt-3 text-xs leading-5 text-[#66796c]'>{t(`${key}.searchHint`)}</p>
      </div>
    </section>
  )
}
