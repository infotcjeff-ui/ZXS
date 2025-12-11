import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// ServerAvatar deployment config (root path)
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-htaccess',
      closeBundle() {
        // Copy .htaccess to dist after build
        try {
          copyFileSync(join(process.cwd(), '.htaccess'), join(process.cwd(), 'dist', '.htaccess'))
          console.log('✓ Copied .htaccess to dist')
        } catch (err) {
          console.warn('Could not copy .htaccess:', err.message)
        }
      },
    },
  ],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})

