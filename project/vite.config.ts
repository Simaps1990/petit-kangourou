import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      exclude: [/src\/pages\/AdminPage\.tsx$/],
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
