import assert from 'node:assert/strict'
import test from 'node:test'

import { validateOpenApi } from './validate-openapi.mjs'

test('accepts one module tag and explicit request/response contracts', () => {
  const issues = validateOpenApi({
    tags: [{ name: 'Users' }],
    paths: {
      '/users': {
        post: {
          tags: ['Users'],
          operationId: 'createUser',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' }
              }
            }
          },
          responses: {
            201: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserResponse' }
                }
              }
            }
          }
        }
      }
    }
  })

  assert.deepEqual(issues, [])
})

test('reports ambiguous tags, duplicate ids, and unclear body contract names', () => {
  const document = {
    tags: [{ name: 'Users' }, { name: 'Modules' }],
    paths: {
      '/users': {
        post: {
          tags: ['Users', 'Modules'],
          operationId: 'save',
          requestBody: {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserDto' } }
            }
          },
          responses: {
            200: {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/UserDto' } }
              }
            }
          }
        }
      },
      '/modules': {
        get: { tags: ['Unknown'], operationId: 'save', responses: {} }
      }
    }
  }

  assert.deepEqual(validateOpenApi(document), [
    'POST /users must declare exactly one tag (found 2)',
    'POST /users request body component "UserDto" must end with Request',
    'POST /users success response component "UserDto" must end with Response',
    'GET /modules uses undeclared tag "Unknown"',
    'GET /modules duplicates operationId "save"'
  ])
})
