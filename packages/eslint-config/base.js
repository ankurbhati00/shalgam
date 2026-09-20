import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Base flat config shared by every Shalgam package.
 * @param {{ tsconfigRootDir: string; allowDefaultProject?: string[] }} options
 *   `allowDefaultProject` lists files that are linted but not part of any tsconfig
 *   (defaults to config files; packages that include them in a tsconfig pass `[]`).
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function baseConfig({ tsconfigRootDir, allowDefaultProject = ['*.config.ts'] }) {
  return tseslint.config(
    {
      ignores: ['dist/**', 'storybook-static/**', 'coverage/**', 'node_modules/**', '**/*.d.ts'],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        globals: { ...globals.browser, ...globals.es2023 },
        parserOptions: {
          projectService: {
            allowDefaultProject: ['*.js', '*.mjs', ...allowDefaultProject],
          },
          tsconfigRootDir,
        },
      },
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false, arguments: false } },
        ],
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          { allowNumber: true, allowBoolean: true },
        ],
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/no-unnecessary-condition': [
          'error',
          { allowConstantLoopConditions: true },
        ],
        '@typescript-eslint/prefer-nullish-coalescing': [
          'error',
          { ignorePrimitives: { boolean: true } },
        ],
        '@typescript-eslint/no-invalid-void-type': [
          'error',
          { allowInGenericTypeArguments: true, allowAsThisParameter: true },
        ],
      },
    },
    {
      files: ['**/*.js', '**/*.mjs'],
      ...tseslint.configs.disableTypeChecked,
    },
    prettier,
  )
}
