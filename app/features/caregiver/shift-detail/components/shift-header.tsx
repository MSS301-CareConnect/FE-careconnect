import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const ARIA_BREADCRUMB = 'Breadcrumb'
const ICON_HOME = 'home'
const ICON_CHEVRON = 'chevron_right'
const ICON_PHONE = 'phone_in_talk'
const ICON_PRINT = 'print'
const ICON_SHARE = 'share'
const ICON_CHECK = 'check'

interface ShiftHeaderProps {
  code: string
  shiftStatus: 'ready' | 'ongoing'
  onShare: () => void
  copiedToast: boolean
}

export function ShiftHeader({ code, shiftStatus, onShare, copiedToast }: ShiftHeaderProps) {
  const { t } = useTranslation()

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
      <div className='space-y-1'>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label={ARIA_BREADCRUMB}
          className='flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant'
        >
          <Link className='flex items-center gap-1 transition-colors hover:text-primary' to='/caregiver/dashboard'>
            <span className='material-symbols-outlined text-[16px]'>{ICON_HOME}</span>
            {t('caregiver.shiftDetail.breadcrumb.home')}
          </Link>
          <span className='material-symbols-outlined text-[14px] text-outline-variant'>{ICON_CHEVRON}</span>
          <Link className='transition-colors hover:text-primary' to='/caregiver/schedule'>
            {t('caregiver.shiftDetail.breadcrumb.schedule')}
          </Link>
          <span className='material-symbols-outlined text-[14px] text-outline-variant'>{ICON_CHEVRON}</span>
          <span className='font-semibold text-on-surface'>
            {t('caregiver.shiftDetail.breadcrumb.shiftCode', { code })}
          </span>
        </nav>

        {/* Heading & Status Badges */}
        <div className='flex flex-wrap items-center gap-2 pt-1'>
          <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
            {t('caregiver.shiftDetail.header.title', { code })}
          </h1>
          {shiftStatus === 'ready' ? (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-primary' />
              {t('caregiver.shiftDetail.header.statusReady')}
            </span>
          ) : (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary'>
              <span className='h-2 w-2 rounded-full bg-white' />
              {t('caregiver.shiftDetail.header.statusOngoing')}
            </span>
          )}
          <span className='inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant'>
            {t('caregiver.shiftDetail.header.assignment')}
          </span>
        </div>
      </div>

      {/* Quick Actions Group */}
      <div className='flex flex-wrap items-center gap-2'>
        <a
          className='inline-flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2.5 text-xs font-bold text-on-surface shadow-xs transition-colors hover:bg-surface-container-high sm:text-sm'
          href='tel:19006868'
        >
          <span className='material-symbols-outlined text-[20px] text-primary'>{ICON_PHONE}</span>
          <span>
            {t('caregiver.shiftDetail.header.hotline')}{' '}
            <span className='font-bold text-primary'>{t('caregiver.shiftDetail.header.hotlineNumber')}</span>
          </span>
        </a>

        <button
          className='inline-flex cursor-pointer items-center gap-2 rounded-lg bg-surface-container px-3.5 py-2.5 text-xs font-bold text-on-surface shadow-xs transition-colors hover:bg-surface-container-high sm:text-sm'
          onClick={handlePrint}
          type='button'
        >
          <span className='material-symbols-outlined text-[20px] text-primary'>{ICON_PRINT}</span>
          <span>{t('caregiver.shiftDetail.header.print')}</span>
        </button>

        <div className='relative'>
          <button
            className='inline-flex cursor-pointer items-center gap-2 rounded-lg bg-surface-container px-3.5 py-2.5 text-xs font-bold text-on-surface shadow-xs transition-colors hover:bg-surface-container-high sm:text-sm'
            onClick={onShare}
            type='button'
          >
            <span className='material-symbols-outlined text-[20px] text-primary'>{ICON_SHARE}</span>
            <span>{t('caregiver.shiftDetail.header.share')}</span>
          </button>
          {copiedToast && (
            <div className='absolute right-0 top-full z-20 mt-1 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 text-xs font-medium text-inverse-on-surface shadow-lg flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-[16px] text-secondary-fixed'>{ICON_CHECK}</span>
              {t('caregiver.shiftDetail.header.copiedToast')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
