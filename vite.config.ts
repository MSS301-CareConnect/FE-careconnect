import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'

import { paymentDemoPlugin } from './scripts/payment-demo.mjs'

export default defineConfig(({ command, mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const cacheRoot = process.env.CARECONNECT_VITE_CACHE_ROOT
  const apiTarget = environment.API_PROXY_TARGET ?? 'http://localhost:8080'

  return {
    cacheDir: command === 'serve' && cacheRoot ? mkdtempSync(join(cacheRoot, 'vite-')) : undefined,
    plugins: [
      tailwindcss(),
      reactRouter(),
      devtoolsJson(),
      // Dev server only: stands in for PaymentService's customer APIs until the real service exists.
      paymentDemoPlugin({
        target: apiTarget,
        clientId: environment.PAYMENT_DEMO_SERVICE_CLIENT_ID,
        clientSecret: environment.PAYMENT_DEMO_SERVICE_CLIENT_SECRET
      })
    ],
    resolve: {
      tsconfigPaths: true
    },
    css: {
      devSourcemap: true
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
