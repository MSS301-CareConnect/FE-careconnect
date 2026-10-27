import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentCenter } from '~/entities/care-center/selected-center'
import { Icon } from '~/shared/ui/icon'

import { usePickCenter } from '../hooks/use-pick-center'
import { CenterOptions } from './center-options'

const key = 'customer.centerPicker' as const

/** Header control beside the logo: shows the chosen center and opens the list right beneath it. */
export function CenterSelector() {
  const { t } = useTranslation()
  const center = useCurrentCenter()
  const pickCenter = usePickCenter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className='relative min-w-0' ref={containerRef}>
      <button
        aria-controls='customer-center-menu'
        aria-expanded={open}
        aria-haspopup='true'
        className={`flex min-h-11 min-w-0 max-w-[11rem] items-center gap-2 rounded-lg border px-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31] sm:max-w-[15rem] xl:max-w-[18rem] ${open ? 'border-[#075b31] bg-white' : 'border-[#d3ded3] bg-white/70 hover:border-[#9fb9a4] hover:bg-white'}`}
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        <Icon
          aria-hidden='true'
          className={`shrink-0 text-xl ${center ? 'text-[#075b31]' : 'text-[#8a5a12]'}`}
          name={center ? 'home_health' : 'public'}
        />
        <span className='flex min-w-0 flex-col'>
          <span className='text-[11px] leading-tight text-[#617367]'>{t(`${key}.label`)}</span>
          <span className='truncate text-sm font-bold leading-tight text-[#1b2922]'>
            {center?.name ?? t(`${key}.none`)}
          </span>
        </span>
        <Icon
          aria-hidden='true'
          className={`shrink-0 text-lg text-[#44594b] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          name='expand_more'
        />
      </button>
      {open ? (
        <div
          aria-label={t(`${key}.menu`)}
          className='absolute top-full left-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-[#dfe6dc] bg-white p-2 shadow-lg'
          id='customer-center-menu'
          role='region'
        >
          <CenterOptions
            onPick={(value) => {
              pickCenter(value)
              setOpen(false)
              buttonRef.current?.focus()
            }}
            size='menu'
          />
        </div>
      ) : null}
    </div>
  )
}
