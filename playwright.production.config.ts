import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig(base, {
  use: {
    baseURL: 'http://127.0.0.1:3123',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 -p 3123',
    url: 'http://127.0.0.1:3123',
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
