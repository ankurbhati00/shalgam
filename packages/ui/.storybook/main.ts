import { defineMain } from '@storybook/react-vite/node'
import remarkGfm from 'remark-gfm'

export default defineMain({
  stories: ['../src/docs/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  docs: { defaultName: 'Docs' },
  staticDirs: ['./public'],
})
