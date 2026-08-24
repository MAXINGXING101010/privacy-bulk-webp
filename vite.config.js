import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@vercel/postgres': path.resolve(__dirname, 'src/__mocks__/vercel-postgres.js'),
    },
  },
})
