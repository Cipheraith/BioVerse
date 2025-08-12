import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'logo.png', 'index.html'],
        manifest: {
          name: 'BioVerse',
          short_name: 'BioVerse',
          description: 'Zambia\'s first AI-powered Health Co-ordination system.',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'bio.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'bio.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'bio.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'apple touch icon',
            },
            {
              src: 'bio.png',
              sizes: 'any',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
    optimizeDeps: {
      include: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
