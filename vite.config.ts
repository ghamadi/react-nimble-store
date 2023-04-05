import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },

  resolve: {
    alias: [
      {
        find: '~',
        replacement: path.resolve(__dirname, './src')
      }
    ]
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      name: 'ViteButton',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  },

  plugins: [react(), dts()]
});
