import { defineConfig, devices } from '@playwright/test';

const basePath = normalizeBasePath(process.env.BASE_PATH);
const port = Number(process.env.E2E_PORT ?? '4322');
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('E2E_PORT must be an integer between 1024 and 65535.');
}

const browserNames = ['chromium', 'firefox', 'webkit'] as const;
const requestedBrowsers = (process.env.E2E_BROWSERS ?? 'chromium')
  .split(',')
  .map((browser) => browser.trim());
const selectedBrowsers = requestedBrowsers.includes('all') ? [...browserNames] : requestedBrowsers;
if (
  selectedBrowsers.length === 0 ||
  selectedBrowsers.some(
    (browser) => !browserNames.includes(browser as (typeof browserNames)[number]),
  )
) {
  throw new Error(
    'E2E_BROWSERS must be chromium, firefox, webkit, a comma-separated list, or all.',
  );
}

const browserDevices = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/e2e.xml' }],
    // On GitHub Actions each failure also appears as a public annotation on the run summary.
    ...(process.env.GITHUB_ACTIONS ? [['github'] as const] : []),
  ],
  outputDir: 'test-results/browser',
  use: {
    baseURL: `http://127.0.0.1:${port}${basePath}/`,
    viewport: { width: 1440, height: 1000 },
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: selectedBrowsers.map((name) => ({
    name,
    use: { ...browserDevices[name as keyof typeof browserDevices] },
  })),
  webServer: {
    command: `node scripts/serve.mjs --port ${port}`,
    url: `http://127.0.0.1:${port}${basePath}/zh/`,
    timeout: 30_000,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 1_000 },
    env: { BASE_PATH: basePath || '/' },
  },
});

function normalizeBasePath(value = '/') {
  if (value === '/') return '';
  if (!/^\/[a-zA-Z0-9_/-]*$/.test(value) || value.includes('//') || value.includes('..')) {
    throw new Error('BASE_PATH must be an absolute URL path, such as /QCopilots-Website/.');
  }
  return value.replace(/\/+$/, '');
}
