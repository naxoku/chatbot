import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Configuración PWA
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache strategies optimizadas
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        
        // Runtime caching para API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutos
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
            },
          },
          {
            urlPattern: /\.(?:woff2?|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
              },
            },
          },
        ],
        
        // Skip waiting y clients claim para actualizaciones inmediatas
        skipWaiting: true,
        clientsClaim: true,
        
        // Cleanup de caches old
        cleanupOutdatedCaches: true,
        
        // Navigation preload deshabilitado temporalmente para evitar errores
        // navigationPreload: true,
      },
      
      // PWA Manifest
      manifest: {
        name: 'Asistente UCT - ChatBot Inteligente',
        short_name: 'UCT Chat',
        description: 'Asistente de chat inteligente con IA para la Universidad Católica de Temuco',
        theme_color: '#3E8BD6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/logo_ddper.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logouct.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        categories: ['productivity', 'education', 'utilities'],
        lang: 'es',
        dir: 'ltr',
      },
      
      // DevOptions para desarrollo
      devOptions: {
        enabled: true,
        type: 'module',
      },
      
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimizaciones de minificación
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    
    // Configuración de chunking manual para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React y React DOM en un chunk separado
          'react-vendor': ['react', 'react-dom'],
          
          // React Router en su propio chunk
          'router': ['react-router-dom'],
          
          // UI Components (shadcn/ui y Radix)
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          
          // FontAwesome
          'icons': ['@fortawesome/fontawesome-free'],
          
          // Utilidades y librerías
          'utils': [
            'axios',
            'dompurify', 
            'lucide-react',
            'marked',
            'nanoid'
          ],
          
          // D3 y visualizaciones
          'd3': ['d3', 'dagre', 'reactflow'],
          
          // Tipografía
          'typography': ['@tailwindcss/typography']
        },
        
        // Optimización de nombres de archivos para mejor cache busting
        chunkFileNames: 'js/[name]-[hash].js',
        
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
    },
    
    // Configuración de target para navegadores modernos
    target: 'esnext',
    
    // Configuración de assets
    assetsInlineLimit: 4096, // Inline assets menores a 4kb
    
    // Reporte de warnings
    chunkSizeWarningLimit: 1000,
    
    // Habilitar source maps para debugging
    sourcemap: false, // Deshabilitar en producción para mejor performance
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Optimizaciones para desarrollo
  esbuild: {
    // Eliminar console.log en producción
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  
  // Configuración de dependencias optimizadas
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ]
  }
})
