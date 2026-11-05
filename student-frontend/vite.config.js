import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Critical: Dev server proxy configuration to forward /reyes API calls to Spring Boot backend at http://localhost:8080. If misconfigured, frontend network calls will fail with CORS or 404 errors.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/reyes': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
