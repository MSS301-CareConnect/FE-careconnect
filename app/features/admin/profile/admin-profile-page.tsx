import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SecuritySessions } from '~/features/shared/auth/security-sessions'
import { PasswordChangePanel } from '~/features/shared/profile/password-change-panel'
import { PersonalInfoPanel } from '~/features/shared/profile/personal-info-panel'
import { dateLocale } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'
import { PillTabs } from '~/shared/ui/pill-tabs'
import { tabPanelId } from '~/shared/ui/tabs'

const key = 'admin.profilePage' as const
const TABS = ['info', 'security'] as const
type Tab = (typeof TABS)[number]
const ID_BASE = 'admin-profile'

/**
 * The administrator's own profile inside the admin shell (2026-11-10): personal information (`PUT /users/me`) and
 * `?tab=security` — change the password (all sessions end, back to sign-in) and the signed-in devices.
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

  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader description={t(`${key}.subtitle`)} title={t(`${key}.title`)} />
      <PillTabs
        idBase={ID_BASE}
        items={TABS.map((item) => ({ value: item, label: t(`${key}.tabs.${item}`) }))}
        label={t(`${key}.tabsLabel`)}
        onChange={choose}
        value={tab}
      />
      <div
        aria-labelledby={`${ID_BASE}-tab-${tab}`}
        className='max-w-3xl space-y-6'
        id={tabPanelId(ID_BASE)}
        role='tabpanel'
      >
        {!user ? (
          <p className='text-sm text-on-surface-variant' role='status'>
            {t('auth.loading')}
          </p>
        ) : tab === 'info' ? (
          <PersonalInfoPanel key={user.id} memberSince={memberSince} user={user} />
        ) : (
          <>
            <PasswordChangePanel />
            <SecuritySessions />
          </>
        )}
      </div>
    </div>
  )
}
