import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gestion_mpa/backend': {
        target: 'http://localhost',
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
})
