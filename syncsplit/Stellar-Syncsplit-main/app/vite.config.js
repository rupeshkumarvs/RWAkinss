import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    open: true,
  },
  define: {
    // Polyfills needed by @stellar/stellar-sdk and wallet kit
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Buffer polyfill for browser
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
