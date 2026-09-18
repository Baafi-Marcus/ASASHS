import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const dbUrl = env.VITE_DATABASE_URL || env.DATABASE_URL || '';
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_DATABASE_URL': JSON.stringify(dbUrl),
      'import.meta.env.DATABASE_URL': JSON.stringify(dbUrl),
      'process.env.VITE_DATABASE_URL': JSON.stringify(dbUrl),
      'process.env.DATABASE_URL': JSON.stringify(dbUrl),
    },
  };
})