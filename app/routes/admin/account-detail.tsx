import { AccountDetailPage } from '~/features/admin/identity/account-detail-page'
import { useParams } from 'react-router'

export default function AccountDetailRoute() {
  const { id } = useParams()
  return <AccountDetailPage key={id} />
}
