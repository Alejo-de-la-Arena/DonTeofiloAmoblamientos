import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), imagetools()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
