import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

import { parse } from 'yaml'

const HTTP_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'])

function referencedComponentName(schema) {
  if (!schema || typeof schema !== 'object') return undefined
  if (typeof schema.$ref === 'string') return schema.$ref.split('/').at(-1)
  if (schema.type === 'array') return referencedComponentName(schema.items)
  return undefined
}

function contentSchemas(container) {
  return Object.values(container?.content ?? {})
    .map((mediaType) => mediaType?.schema)
    .filter(Boolean)
}

export function validateOpenApi(document) {
  const issues = []
  const operationIds = new Set()
  const declaredTags = new Set((document.tags ?? []).map((tag) => tag.name))

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method)) continue
      const location = `${method.toUpperCase()} ${path}`
      const tags = operation.tags ?? []

      if (tags.length !== 1) {
        issues.push(`${location} must declare exactly one tag (found ${tags.length})`)
      } else if (!declaredTags.has(tags[0])) {
        issues.push(`${location} uses undeclared tag "${tags[0]}"`)
      }

      if (!operation.operationId) {
        issues.push(`${location} must declare operationId`)
      } else if (operationIds.has(operation.operationId)) {
        issues.push(`${location} duplicates operationId "${operation.operationId}"`)
      } else {
        operationIds.add(operation.operationId)
      }

      for (const schema of contentSchemas(operation.requestBody)) {
        const name = referencedComponentName(schema)
        if (name && !name.endsWith('Request')) {
          issues.push(`${location} request body component "${name}" must end with Request`)
        }
      }

      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        if (!/^2\d\d$/.test(status)) continue
        for (const schema of contentSchemas(response)) {
          const name = referencedComponentName(schema)
          if (name && !name.endsWith('Response')) {
            issues.push(`${location} success response component "${name}" must end with Response`)
          }
        }
      }
    }
  }

  return issues
}

export async function validateOpenApiFile(filePath) {
  const document = parse(await readFile(filePath, 'utf8'))
  const issues = validateOpenApi(document)
  if (issues.length > 0) {
    throw new Error(`OpenAPI conventions failed:\n- ${issues.join('\n- ')}`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const filePath = process.argv[2] ?? './openapi/openapi.yaml'
  await validateOpenApiFile(filePath)
  console.log(`OpenAPI conventions passed: ${filePath}`)
}
