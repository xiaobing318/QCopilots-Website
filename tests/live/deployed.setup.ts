import { expect, test as setup } from '@playwright/test';

// GitHub Pages can serve the previous build for a few minutes after a deployment.
setup('the expected build is being served', async ({ request }) => {
  setup.setTimeout(12 * 60_000);
  const expected = process.env.EXPECTED_BUILD_ID;
  const served = async () => {
    const response = await request.get(`build-info.json?visit=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok()) return `HTTP ${response.status()}`;
    return String((await response.json()).buildId);
  };
  if (!expected) {
    setup.info().annotations.push({
      type: 'build',
      description: `EXPECTED_BUILD_ID is not set. Testing the build that is live now: ${await served()}`,
    });
    return;
  }
  await expect
    .poll(served, {
      message: `Waiting for build ${expected} on GitHub Pages`,
      timeout: 10 * 60_000,
      intervals: [5_000, 10_000, 15_000],
    })
    .toBe(expected);
});
