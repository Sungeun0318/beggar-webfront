import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/auth': 'http://127.0.0.1:8080',
      '/users': 'http://127.0.0.1:8080',
      '/rooms': 'http://127.0.0.1:8080',
      '/locations': 'http://127.0.0.1:8080',
      '/api': 'http://127.0.0.1:8080',
      '/community/posts': 'http://127.0.0.1:8080',
      '/community/chats': 'http://127.0.0.1:8080',
      '/ws-stomp': {
        target: 'http://127.0.0.1:8080',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
