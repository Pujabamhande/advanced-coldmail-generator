import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const backendEnvDirectory = fileURLToPath(new URL('../../backend', import.meta.url))

export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, backendEnvDirectory, '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': `http://localhost:${backendEnv.PORT || '6000'}`
      }
    }
  }
})
