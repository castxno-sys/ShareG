import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE permite publicar en una subcarpeta (ej. GitHub Pages: /shareg/)
export default defineConfig({
  base: process.env.BASE || '/',
  plugins: [react()],
  server: { port: 5173, open: true },
});
