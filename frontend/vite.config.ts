import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  const devServerPort = Number(env.VITE_DEV_SERVER_PORT ?? 5173);
  const backendProxyTarget = env.VITE_BACKEND_PROXY_TARGET ?? 'http://localhost:8080';

  return {
    plugins: [react()],
    envDir: '..',
    server: {
      port: devServerPort,
      proxy: {
        '/api': {
          target: backendProxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      exclude: ['node_modules', 'dist', 'e2e', 'tests/e2e'],
      globals: true,
      setupFiles: './src/setupTests.ts',
    },
  };
});
