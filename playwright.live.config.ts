import { defineConfig, devices } from '@playwright/test';

// Visits the deployed site the way a person would. LIVE_URL defaults to the GitHub Pages project site.
const liveUrl = new URL(process.env.LIVE_URL || 'https://xiaobing318.github.io/QCopilots-Website/');
if (!['https:', 'http:'].includes(liveUrl.protocol)) throw new Error('LIVE_URL must be http(s).');
if (!liveUrl.pathname.endsWith('/')) liveUrl.pathname += '/';

export default defineConfig({
  testDir: './tests/live',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 2,
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/live', open: 'never' }],
    ['junit', { outputFile: 'test-results/live.xml' }],
    ...(process.env.GITHUB_ACTIONS ? [['github'] as const] : []),
  ],
  outputDir: 'test-results/live',
  use: {
    baseURL: liveUrl.href,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'deployed-build', testMatch: /deployed\.setup\.ts/ },
    {
      name: 'desktop',
      testMatch: /live\.spec\.ts/,
      dependencies: ['deployed-build'],
      use: { ...devices['Desktop Chrome'], locale: 'en-US' },
    },
    {
      name: 'mobile',
      testMatch: /live\.spec\.ts/,
      dependencies: ['deployed-build'],
      use: { ...devices['Pixel 7'], locale: 'zh-CN' },
    },
  ],
});
