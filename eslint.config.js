import js from '@eslint/js'
import query from '@tanstack/eslint-plugin-query'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

import noHardcodedUiText from './eslint-rules/no-hardcoded-ui-text.cjs'

export default tseslint.config([
  globalIgnores(['dist', 'build', 'coverage', '.react-router', 'app/shared/api/generated/**']),
  ...query.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      project: {
        rules: {
          'no-hardcoded-ui-text': noHardcodedUiText
        }
      }
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      'project/no-hardcoded-ui-text': 'error',
      'no-empty-pattern': 'off'
    }
  }
])
