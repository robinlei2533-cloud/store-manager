import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 5173 },
  plugins: [react()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
    chunkSizeWarningLimit: 4000,
  },
})
