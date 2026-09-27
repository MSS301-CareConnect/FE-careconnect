import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')

  return {
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
          target: environment.API_PROXY_TARGET ?? 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
