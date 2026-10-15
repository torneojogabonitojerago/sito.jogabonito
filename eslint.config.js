import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui primitives and the data context/hook modules co-export a component with a
    // tightly-coupled constant/hook by convention — safe, only affects HMR granularity.
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/data/store.tsx',
      'src/data/tournaments-registry.tsx',
      'src/data/site-config.tsx',
      'src/pages/admin/AdminGate.tsx',
      'src/pages/admin/ui.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
