import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE permite publicar en una subcarpeta (ej. GitHub Pages: /ShareG/app/)
export default defineConfig({
  base: process.env.BASE || '/',
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Librerías en archivos aparte: cambian poco, así el navegador las reutiliza de su caché.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
