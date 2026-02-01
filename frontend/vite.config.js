import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirigir llamadas API al backend en puerto 3000
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/products': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/categories': 'http://localhost:3000',
      '/tags': 'http://localhost:3000',
      '/img': 'http://localhost:3000',
    }
  }
})
