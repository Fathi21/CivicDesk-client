import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5136',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**'],
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    },
  },
})
