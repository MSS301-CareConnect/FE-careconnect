import { AuthShell } from '~/features/shared/auth/auth-shell'

/** One shell for sign-in, registration and password recovery, so the forest card slides instead of remounting. */
export default function AuthLayoutRoute() {
  return <AuthShell />
}
