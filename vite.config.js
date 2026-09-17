import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/*.wav', '**/*.tmp']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('gsap') || id.includes('lenis') || id.includes('@number-flow')) {
              return 'motion-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
