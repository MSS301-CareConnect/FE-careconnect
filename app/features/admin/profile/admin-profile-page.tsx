import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SecuritySessions } from '~/features/shared/auth/security-sessions'
import { PasswordChangePanel } from '~/features/shared/profile/password-change-panel'
import { PersonalInfoPanel } from '~/features/shared/profile/personal-info-panel'
import { dateLocale } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Avatar } from '~/shared/ui/avatar'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'
import { Icon } from '~/shared/ui/icon'
import { PillTabs } from '~/shared/ui/pill-tabs'
import { tabPanelId } from '~/shared/ui/tabs'

const key = 'admin.profilePage' as const
const TABS = ['info', 'security'] as const
type Tab = (typeof TABS)[number]
const ID_BASE = 'admin-profile'

/**
 * The administrator's own profile inside the admin shell (2026-11-10, two columns since 2026-11-11): an identity card
 * (who is signed in, role, contact, member since) beside the tabs — personal information (`PUT /users/me`) and
 * `?tab=security`: change the password (all sessions end, back to sign-in) and the signed-in devices.
 */
export function AdminProfilePage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.find((item) => item === params.get('tab')) ?? 'info'
  const user = useAuthUser()
  useDocumentTitle(t(`${key}.documentTitle`))

  function choose(next: Tab) {
    setParams(next === 'info' ? {} : { tab: next }, { replace: true })
  }

  const memberSince =
    user?.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
      ? new Intl.DateTimeFormat(dateLocale(i18n.language), { month: '2-digit', year: 'numeric' }).format(
          new Date(user.createdAt)
        )
      : null
  const name = user?.fullName || user?.email || ''

  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t(`${key}.subtitle`)} title={t(`${key}.title`)} />
      {!user ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('auth.loading')}
        </p>
      ) : (
        <div className='grid items-start gap-5 lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)]'>
          <aside className='relative isolate overflow-hidden rounded-[1.75rem] bg-forest-900 p-6 text-white shadow-[var(--shadow-float)] lg:sticky lg:top-24'>
            <span
              aria-hidden='true'
              className='pointer-events-none absolute -top-20 -right-12 -z-10 h-56 w-56 rounded-full bg-mint-400/25 blur-3xl'
            />
            <Avatar className='h-20 w-20 rounded-full text-2xl ring-4 ring-white/15' decorative name={name} />
            <p className='mt-4 text-xl leading-tight font-bold break-words'>{name}</p>
            <p className='mt-2 flex flex-wrap items-center gap-2 text-[13px] font-semibold'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-mint-300 px-3 py-1 text-forest-950'>
                <Icon className='text-base' name='shield_person' />
                {t('admin.role')}
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-mint-100 ring-1 ring-white/10'>
                <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-300' />
                {t(`${key}.active`)}
              </span>
            </p>
            <ul className='mt-5 space-y-3 border-t border-white/10 pt-5 text-sm text-white/80'>
              <li className='flex items-start gap-2.5'>
                <Icon className='mt-0.5 text-lg text-mint-300' name='mail' />
                <span className='min-w-0 break-all'>{user.email}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Icon className='mt-0.5 text-lg text-mint-300' name='call' />
                <span className='tabular-nums'>{user.phoneNumber || t(`${key}.noPhone`)}</span>
              </li>
              {memberSince ? (
                <li className='flex items-start gap-2.5'>
                  <Icon className='mt-0.5 text-lg text-mint-300' name='event_available' />
                  <span className='tabular-nums'>{t(`${key}.memberSince`, { date: memberSince })}</span>
                </li>
              ) : null}
            </ul>
          </aside>
          <div className='min-w-0 space-y-5'>
            <PillTabs
              idBase={ID_BASE}
              items={TABS.map((item) => ({ value: item, label: t(`${key}.tabs.${item}`) }))}
              label={t(`${key}.tabsLabel`)}
              onChange={choose}
              value={tab}
            />
            <div aria-labelledby={`${ID_BASE}-tab-${tab}`} className='space-y-5' id={tabPanelId(ID_BASE)} role='tabpanel'>
              {tab === 'info' ? (
                <PersonalInfoPanel key={user.id} memberSince={memberSince} title={t(`${key}.infoTitle`)} user={user} />
              ) : (
                <>
                  <p className='flex items-start gap-2 rounded-2xl bg-peach-50 px-4 py-3 text-sm text-peach-700 ring-1 ring-peach-200'>
                    <Icon className='mt-0.5 text-lg' name='info' />
                    {t(`${key}.securityNote`)}
                  </p>
                  <PasswordChangePanel />
                  <SecuritySessions />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
