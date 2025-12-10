import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect build environment
// For GitHub Pages: use /ZXS/
// For ServerAvatar or other deployments: use /
const base = process.env.VITE_BASE_PATH || '/ZXS/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: base,
  build: {
    rollupOptions: {
      output: {
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Disable cache in development
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
