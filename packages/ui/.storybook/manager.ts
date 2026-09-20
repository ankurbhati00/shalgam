import { addons } from 'storybook/manager-api'

import { shalgamTheme } from './theme'

addons.setConfig({
  theme: shalgamTheme,
  sidebar: {
    showRoots: true,
  },
})
