import { defineConfig } from '@playwright/test';
const production = process.env.ACCESSONE_PRODUCTION === '1';
const url = production ? 'http://127.0.0.1:5175' : 'http://127.0.0.1:5174';
export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  timeout: 120000,
  workers: 1,
  fullyParallel: false,
  use: {
    actionTimeout: 8000,
    baseURL: url,
    headless: true,
    channel: process.platform === 'win32' ? 'chrome' : undefined,
  },
  webServer: {
    command: production ? 'npm run start -- --port 5175' : 'npm run dev',
    url,
    reuseExistingServer: true,
    timeout: 30000,
  },
  reporter: 'list',
});
