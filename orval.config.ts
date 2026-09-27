import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: {
      target: './openapi/openapi.yaml'
    },
    output: {
      baseUrl: {
        runtime: 'env.API_BASE_URL',
        imports: [
          {
            name: 'env',
            importPath: '~/shared/config/env'
          }
        ]
      },
      clean: true,
      client: 'react-query',
      formatter: 'prettier',
      httpClient: 'fetch',
      mode: 'tags-split',
      commonTypesFileName: 'transport-types.ts',
      indexFiles: true,
      mock: {
        indexMockFiles: true,
        path: './app/shared/api/generated/mocks',
        generators: [
          {
            type: 'faker',
            arrayItems: true,
            schemas: true,
            useExamples: true
          },
          {
            type: 'msw',
            delay: 150
          }
        ]
      },
      override: {
        fetch: {
          forceSuccessResponse: true
        }
      },
      schemas: {
        path: './app/shared/api/generated/contracts',
        splitByTags: true
      },
      tagsSplitDeduplication: true,
      target: './app/shared/api/generated/api'
    }
  }
})
