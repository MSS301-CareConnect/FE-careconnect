import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'

import { createQueryClient } from '~/shared/api/query-client'
import { i18n, initializeBrowserLanguage } from '~/shared/i18n/i18n'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  useEffect(() => {
    void initializeBrowserLanguage()
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  )
}
