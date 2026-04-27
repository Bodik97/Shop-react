import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router')) return 'router';
          if (id.includes('@sanity') || id.includes('sanity')) return 'sanity';
          if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('@heroicons')) return 'icons';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('embla-carousel') || id.includes('keen-slider') || id.includes('swiper')) return 'carousel';
          if (id.includes('react-helmet')) return 'helmet';
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('/react/') || id.endsWith('/react')) return 'react';
          return 'vendor';
        },
      },
    },
  },
})
