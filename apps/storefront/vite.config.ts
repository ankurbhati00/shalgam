import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // `host: true` binds to every interface so a phone on the same Wi-Fi can open the app
  // (Vite prints the Network URL on start).
  server: { host: true, port: 5173, strictPort: false },
  // Pre-bundle the lazily imported mock backend so the first dev load is deterministic.
  optimizeDeps: { include: ['msw', 'msw/browser', '@tanstack/react-query-devtools'] },
  preview: { host: true, port: 4173 },
})
