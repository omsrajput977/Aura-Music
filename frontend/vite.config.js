import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login': 'http://localhost:5001',
      '/callback': 'http://localhost:5001',
      '/refresh_token': 'http://localhost:5001',
      '/api': 'http://localhost:5001',
      '/health': 'http://localhost:5001'
    }
  }
});
