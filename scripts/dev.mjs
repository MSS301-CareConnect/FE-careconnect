import { spawn } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cacheParent = join(process.cwd(), 'node_modules')
const cachePrefix = '.vite-careconnect-'

for (const entry of await readdir(cacheParent, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith(cachePrefix)) continue

  const oldCache = join(cacheParent, entry.name)
  const owner = Number(await readFile(join(oldCache, '.owner'), 'utf8').catch(() => '0'))
  if (owner > 0) {
    try {
      process.kill(owner, 0)
      continue
    } catch (error) {
      if (error.code !== 'ESRCH') continue
    }
  }

  try {
    await rm(oldCache, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  } catch {
    // A Windows file lock may outlive the previous process briefly.
  }
}

const cacheRoot = await mkdtemp(join(cacheParent, cachePrefix))
await writeFile(join(cacheRoot, '.owner'), String(process.pid))
const cli = new URL('../node_modules/@react-router/dev/bin.cjs', import.meta.url)
const child = spawn(
  process.execPath,
  ['--conditions=development', fileURLToPath(cli), 'dev', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, CARECONNECT_VITE_CACHE_ROOT: cacheRoot }
  }
)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.on('error', (error) => {
  console.error(error)
})

child.on('close', async (code) => {
  try {
    await rm(cacheRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  } catch {
    // The next dev run will retry after the process releases its file handles.
  }
  process.exitCode = code ?? 1
})
