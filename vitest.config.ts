import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'jsdom',
    maxWorkers: 2,
    include: ['app/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/setup.ts']
  }
})
