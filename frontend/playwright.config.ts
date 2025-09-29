import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testMatch: ['**/tests/**/*.test.{ts,js}'],
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5174',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['html'], ['list']],
});