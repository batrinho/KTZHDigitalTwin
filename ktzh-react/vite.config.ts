import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api-gateway-production-69b0.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/ws': {
        target: 'wss://api-gateway-production-69b0.up.railway.app',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
