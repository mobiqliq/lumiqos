import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'LumiqOS Intelligence Platform',
        short_name: 'LumiqOS',
        description: 'AI-first Intelligence OS for Education',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://api-gateway:3000',
        changeOrigin: true,
      },
    },
  },
})
