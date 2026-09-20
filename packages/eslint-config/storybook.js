import storybook from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'

import { reactConfig } from './react.js'

/**
 * React config plus Storybook rules, for the design-system package.
 * Design-system modules deliberately export variants and helpers next to
 * components, so the fast-refresh-only rule is disabled here.
 * @param {{ tsconfigRootDir: string }} options
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function storybookConfig({ tsconfigRootDir }) {
  return tseslint.config(
    ...reactConfig({ tsconfigRootDir, allowDefaultProject: [] }),
    ...storybook.configs['flat/recommended'],
    {
      files: ['**/*.{ts,tsx}'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  )
}
