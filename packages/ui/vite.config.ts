import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Used by Storybook (via @storybook/react-vite) — the package itself is consumed as source.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
