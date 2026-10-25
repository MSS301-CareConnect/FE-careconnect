import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'

export default defineConfig(({ command, mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const cacheRoot = process.env.CARECONNECT_VITE_CACHE_ROOT

  return {
    cacheDir: command === 'serve' && cacheRoot ? mkdtempSync(join(cacheRoot, 'vite-')) : undefined,
    plugins: [tailwindcss(), reactRouter(), devtoolsJson()],
    resolve: {
      tsconfigPaths: true
    },
    css: {
      devSourcemap: true
    },
    server: {
      proxy: {
        '/api': {
          target: environment.API_PROXY_TARGET ?? 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  }
})
