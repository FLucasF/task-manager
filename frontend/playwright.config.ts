import { defineConfig, devices } from '@playwright/test';

const devServerPort = Number(process.env.VITE_DEV_SERVER_PORT ?? 5173);
const devServerHost = process.env.VITE_DEV_SERVER_HOST ?? '127.0.0.1';
const localBaseUrl = `http://${devServerHost}:${devServerPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --host ${devServerHost} --port ${devServerPort}`,
    url: localBaseUrl,
    reuseExistingServer: !process.env.CI,
  },
});
