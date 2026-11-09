import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { dateLocale } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'

import { PasswordChangePanel } from './password-change-panel'
import { PersonalInfoPanel } from './personal-info-panel'

const key = 'customer.profile' as const

/** Personal information (default) or security (`?section=security`) inside the account shell. */
export function MyProfilePage() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const security = searchParams.get('section') === 'security'
  const user = useAuthUser()
  useDocumentTitle(security ? t(`${key}.security.documentTitle`) : t(`${key}.documentTitle`))

  if (!user)
    return (
      <p className='pt-8 text-sm text-on-surface-variant' role='status'>
        {t('auth.loading')}
      </p>
    )

  const memberSince =
    user.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
      ? new Intl.DateTimeFormat(dateLocale(i18n.language), { month: '2-digit', year: 'numeric' }).format(
          new Date(user.createdAt)
        )
      : null

  return (
    <div>
      <CustomerPageHeader
        description={security ? t(`${key}.security.description`) : t(`${key}.description`)}
        title={security ? t(`${key}.security.title`) : t(`${key}.title`)}
      />
      {security ? <PasswordChangePanel /> : <PersonalInfoPanel key={user.id} memberSince={memberSince} user={user} />}
    </div>
  )
}
