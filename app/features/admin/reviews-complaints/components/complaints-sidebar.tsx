import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'

const key = 'admin.reviewsComplaintsPage' as const

export function ComplaintsSidebar() {
  const { t } = useTranslation()
  return (
    <aside className='space-y-4'>
      <section className='rounded-xl bg-primary p-5 text-white shadow-sm'>
        <Icon className='text-3xl' name='shield' />
        <h2 className='mt-3 text-lg font-bold'>{t(`${key}.protocol.title`)}</h2>
        <p className='mt-2 text-sm leading-6 text-white/80'>{t(`${key}.protocol.hint`)}</p>
        <ol className='mt-5 space-y-3'>
          {(['receive', 'hold', 'verify', 'decide'] as const).map((step, index) => (
            <li className='flex items-center gap-3 rounded-lg bg-white/10 p-3 text-sm font-semibold' key={step}>
              <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary'>
                {index + 1}
              </span>
              {t(`${key}.protocol.steps.${step}`)}
            </li>
          ))}
        </ol>
      </section>
      <section className='rounded-xl bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-2'>
          <Icon className='text-xl text-primary' name='volunteer_activism' />
          <h2 className='text-lg font-bold'>{t(`${key}.feedback.title`)}</h2>
        </div>
        {(['first', 'second'] as const).map((item) => (
          <blockquote className='mt-4 border-t border-outline-variant/25 pt-4' key={item}>
            <div className='flex items-center justify-between gap-2 text-sm'>
              <strong>{t(`${key}.feedback.${item}Name`)}</strong>
              <span className='text-amber-500' aria-label={t(`${key}.feedback.rating`)}>
                ★★★★★
              </span>
            </div>
            <p className='mt-1 text-xs text-outline'>#{t(`${key}.feedback.${item}Booking`)}</p>
            <p className='mt-2 text-sm leading-6 text-on-surface-variant'>“{t(`${key}.feedback.${item}Quote`)}”</p>
          </blockquote>
        ))}
      </section>
    </aside>
  )
}
