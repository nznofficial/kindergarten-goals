import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/kindergarten-goals/, so every asset URL
// needs that prefix. Keyed off `mode` rather than `command`: `vite preview`
// serves the production build but reports command 'serve', so keying off the
// command would leave preview looking for assets at the wrong path.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/kindergarten-goals/' : '/',
  plugins: [react()],
}))
