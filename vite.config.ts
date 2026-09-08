import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/kindergarten-goals/ , so every asset
// URL needs that prefix. Use '/' locally so `npm run dev` behaves normally.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kindergarten-goals/' : '/',
  plugins: [react()],
}))
