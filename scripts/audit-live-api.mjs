import { readFileSync } from 'node:fs'
import YAML from 'yaml'

const gateway = process.env.API_PROXY_TARGET ?? 'http://localhost:8080'
const snapshot = YAML.parse(readFileSync(new URL('../openapi/openapi.yaml', import.meta.url), 'utf8'))
const services = {
  identity: new Set(['Authentication', 'Account', 'Role', 'Permission']),
  provider: new Set([
    'ProviderCenter',
    'ProviderCaregiver',
    'ProviderCertificate',
    'ProviderWorkShift',
    'ProviderMedia'
  ]),
  'care-catalog': new Set(['CatalogItem', 'CenterOffering', 'PricePlan']),
  'care-recipient': new Set(['CareRecipient'])
}
const methods = new Set(['get', 'post', 'put', 'patch', 'delete'])
const normalize = (path) => path.replace(/\{[^}]+\}/g, '{}')
const queryNames = (operation) =>
  (operation.parameters ?? [])
    .filter((parameter) => parameter.in === 'query')
    .map((parameter) => parameter.name)
    .sort()

async function readLiveSpec(service) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(new URL(`/api-docs/${service}`, gateway))
      if (response.ok) return response.json()
      if (response.status < 500 || attempt === 3) throw new Error(`${service} Swagger returned HTTP ${response.status}`)
    } catch (error) {
      if (attempt === 3) throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
  }
}

let failures = 0
for (const [service, tags] of Object.entries(services)) {
  const live = await readLiveSpec(service)
  const operations = new Map()
  for (const [path, pathItem] of Object.entries(live.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (methods.has(method)) operations.set(`${method} ${normalize(path)}`, operation)
    }
  }

  let checked = 0
  for (const [path, pathItem] of Object.entries(snapshot.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!methods.has(method) || !tags.has(operation.tags?.[0])) continue
      checked += 1
      const url = `/api${path}`
      const actual = operations.get(`${method} ${normalize(url)}`)
      if (!actual) {
        failures += 1
        console.error(`${service}: missing ${method.toUpperCase()} ${url}`)
        continue
      }
      const oldQuery = queryNames(operation)
      const newQuery = queryNames(actual)
      for (const name of oldQuery.filter((value) => !newQuery.includes(value))) {
        failures += 1
        console.error(`${service}: removed query parameter ${name} on ${method.toUpperCase()} ${url}`)
      }
      for (const name of newQuery.filter((value) => !oldQuery.includes(value))) {
        console.warn(`${service}: new query parameter ${name} on ${method.toUpperCase()} ${url}`)
      }
    }
  }
  console.log(`${service}: checked ${checked} frontend operations against ${operations.size} live operations`)
}

if (failures) process.exitCode = 1
