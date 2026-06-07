import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://backend:3000',
        changeOrigin: true,
      },
      '/api/socket.io': {
        target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://backend:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
