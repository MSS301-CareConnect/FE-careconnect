import type { Config } from '@react-router/dev/config'
import { vercelPreset } from '@vercel/react-router/vite'

export default {
  // NestJS is the single backend; this client is deployed as static SPA assets.
  presets: [vercelPreset()],
  ssr: false
} satisfies Config
