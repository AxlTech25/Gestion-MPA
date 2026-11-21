import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'

  return {
    plugins: [react()],
    base,
    server: {
      proxy: {
        // Apache de esta PC escucha en el puerto 80.
        // Si el 80 está ocupado, defina VITE_API_PROXY=http://localhost:8000
        '/gestion_mpa/backend': {
          target: env.VITE_API_PROXY || 'http://localhost',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const auth = req.headers.authorization;
              if (auth) {
                proxyReq.setHeader('Authorization', auth);
              }
            });
          },
        },
      },
    },
  }
})
