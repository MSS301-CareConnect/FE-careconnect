import type { Route } from './+types/home'
import { HomePage } from '~/features/home/home-page'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'SaaS-Sentry' },
    {
      name: 'description',
      content: 'Quản trị bản quyền phần mềm và tối ưu chi phí công nghệ.'
    }
  ]
}

export default function Home() {
  return <HomePage />
}
