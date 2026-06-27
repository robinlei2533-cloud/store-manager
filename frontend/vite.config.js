import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 5173 },
  plugins: [react()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'index.html'),
        fan: resolve(__dirname, 'fan-app.html'),
        store: resolve(__dirname, 'store-app.html'),
      },
      output: {
        manualChunks: undefined,
      },
    },
    chunkSizeWarningLimit: 2000,
  },
})
