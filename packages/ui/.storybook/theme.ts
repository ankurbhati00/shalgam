import { create } from 'storybook/theming/create'

const logo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="152" height="32" viewBox="0 0 152 32"><rect width="32" height="32" rx="10" fill="#c9f24a"/><path d="M11 21c1.2 1.6 3 2.4 5 2.4 2.8 0 4.6-1.4 4.6-3.6 0-2-1.3-3-4.3-3.8-3.4-.9-5-2.3-5-4.9 0-2.7 2.2-4.6 5.5-4.6 2.1 0 3.8.7 5 2" fill="none" stroke="#141410" stroke-width="2.6" stroke-linecap="round"/><text x="42" y="22" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="18" font-weight="700" fill="#141410">Shalgam UI</text></svg>`,
  )

export const shalgamTheme = create({
  base: 'light',
  brandTitle: 'Shalgam UI',
  brandUrl: 'https://github.com/shalgam',
  brandImage: logo,
  brandTarget: '_self',

  colorPrimary: '#7fa81f',
  colorSecondary: '#5d8a1c',

  appBg: '#f7f7f4',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e8e7e2',
  appBorderRadius: 12,

  fontBase: "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif",
  fontCode: 'ui-monospace, Menlo, monospace',

  textColor: '#1c1b17',
  textInverseColor: '#ffffff',
  textMutedColor: '#6b6a63',

  barTextColor: '#6b6a63',
  barSelectedColor: '#5d8a1c',
  barHoverColor: '#5d8a1c',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: '#dcdbd5',
  inputTextColor: '#1c1b17',
  inputBorderRadius: 8,
})
