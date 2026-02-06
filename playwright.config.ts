import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Timeout per test (AI tests need more time)
  timeout: 120 * 1000,

  // Expect timeout
  expect: {
    timeout: 15000,
  },

  // Run tests sequentially (saves RAM on 2-core VPS)
  fullyParallel: false,
  workers: 1,

  // Retry failed tests once
  retries: 1,

  // Reporters: Allure for dashboard + console output
  reporter: [
    ['list'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
    }],
    // Midscene report (generates HTML report)
    ['@midscene/web/playwright-reporter', { type: 'merged' }],
  ],

  // Global settings
  use: {
    // Base URL for your app under test
    baseURL: process.env.TEST_BASE_URL || 'https://your-app.com',

    // Browser settings optimized for Docker
    headless: true,
    viewport: { width: 1280, height: 720 },

    // Collect traces & screenshots on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    // Extra HTTP headers (if needed)
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Docker-optimized Chrome flags
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
        },
      },
    },
  ],
});
