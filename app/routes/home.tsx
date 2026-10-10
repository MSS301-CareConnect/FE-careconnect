import type { Route } from './+types/home'
import { HomePage } from '~/features/home/home-page'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'CareConnect' }]
}

export default function Home() {
  return <HomePage />
}
