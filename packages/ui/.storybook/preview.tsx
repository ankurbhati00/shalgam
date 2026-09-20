import type { Decorator, Preview } from '@storybook/react-vite'

import '../src/styles.css'

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string | undefined) ?? 'light'
  const surface = (context.globals.surface as string | undefined) ?? 'storefront'
  return (
    <div
      data-theme={theme}
      data-surface={surface}
      className="min-h-full bg-background p-6 text-text"
      style={{ colorScheme: theme }}
    >
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'sun',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    viewport: { value: undefined, isRotated: false },
  },
  parameters: {
    layout: 'centered',
    viewport: {
      options: {
        phoneSmall: {
          name: 'Phone · 320',
          styles: { width: '320px', height: '568px' },
          type: 'mobile',
        },
        phone: { name: 'Phone · 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
        phoneLarge: {
          name: 'Phone · 414',
          styles: { width: '414px', height: '896px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet · 768',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        laptop: {
          name: 'Laptop · 1024',
          styles: { width: '1024px', height: '768px' },
          type: 'desktop',
        },
        desktop: {
          name: 'Desktop · 1440',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    backgrounds: { disable: true },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
      expanded: false,
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Design Principles',
          'Architecture',
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Responsive', 'Radius', 'Shadows', 'Icons', 'Motion'],
          'Components',
          ['Primitives', 'Buttons', 'Forms', 'Navigation', 'Overlays', 'Data', 'Commerce'],
          'Design Tokens',
        ],
      },
    },
    a11y: { test: 'todo' },
  },
}

export default preview
