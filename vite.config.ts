import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // --- START: CORS Proxy Configuration ---
        proxy: {
          // Any request from your frontend to '/api/...' will now be
          // forwarded to 'https://api.didww.com/v3/...' by the Vite server.
          '/api': {
            target: 'https://api.didww.com/v3',
            changeOrigin: true, // Essential for correctly handling virtual hosted APIs
            rewrite: (path) => path.replace(/^\/api/, ''), // Removes the /api prefix before forwarding
            secure: true, // The target is HTTPS
          },
        },
        // --- END: CORS Proxy Configuration ---
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
