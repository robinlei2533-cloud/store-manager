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
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-core';
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) return 'vendor-antd';
          if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack')) return 'vendor-state';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'vendor-charts';
          if (id.includes('node_modules/ogl')) return 'vendor-effects';
          if (id.includes('localDb') || id.includes('seedData')) return 'database';
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
