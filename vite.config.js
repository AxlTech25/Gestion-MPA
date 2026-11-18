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
        // En este equipo IIS ocupa :80; Apache/XAMPP escucha en :8000 (httpd.conf Listen 8000)
        '/gestion_mpa/backend': {
          target: 'http://localhost:8000',
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
