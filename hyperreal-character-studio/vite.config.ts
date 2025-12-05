import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Defines process.env for the browser environment if necessary,
    // though using import.meta.env is recommended for Vite.
    // This allows the existing code using process.env.API_KEY to work after build
    // if you map a Vercel env var to it.
    'process.env': process.env
  }
});