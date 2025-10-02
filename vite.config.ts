

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    
    proxy: {
      '/api': {
        target: 'http://45.198.59.161', // Nginx port 80
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
