import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: process.env.NODE_ENV === 'production' ? '/whatsnextstop/' : '/',
  server: {
    proxy: {
      '/api/coffeeisadog': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/coffeeisadog/, '')
          return newPath
        }
      }
    }
  },
  resolve: {
    dedupe: ['vue', 'firebase'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `@use '@/styles/variables' as *\n@use '@/styles/mixins' as *\n`,
      },
    },
  },
})
