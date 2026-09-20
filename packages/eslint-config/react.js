import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

import { baseConfig } from './base.js'

/**
 * Flat config for React packages and apps.
 * @param {{ tsconfigRootDir: string; allowDefaultProject?: string[] }} options
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function reactConfig({ tsconfigRootDir, allowDefaultProject = [] }) {
  return tseslint.config(
    ...baseConfig({ tsconfigRootDir, allowDefaultProject }),
    reactHooks.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    {
      files: ['**/*.{ts,tsx}'],
      plugins: { 'react-refresh': reactRefresh },
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true, allowExportNames: ['route', 'loader'] },
        ],
        'jsx-a11y/no-autofocus': 'off',
      },
    },
    {
      // Stories, tests and route/page modules legitimately export non-components.
      files: [
        '**/*.stories.tsx',
        '**/*.test.{ts,tsx}',
        '**/routes/**',
        '**/pages/**',
        '**/route.tsx',
      ],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  )
}
