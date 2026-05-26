const { defineConfig, devices } = require('@playwright/test');

const backendPort = 5005;
const frontendPort = 5173;
const frontendOrigin = `http://127.0.0.1:${frontendPort}`;
const backendOrigin = `http://127.0.0.1:${backendPort}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendOrigin,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: [
        `PORT=${backendPort}`,
        'JWT_SECRET=e2e-secret',
        'DATABASE_URL=file:./e2e-test.db',
        `FRONTEND_ORIGINS=${frontendOrigin}`,
        'RATE_LIMIT_MAX=5000',
        'AUTH_RATE_LIMIT_MAX=5000',
        'npm run backend:start',
      ].join(' '),
      url: `${backendOrigin}/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: [
        `VITE_API_BASE_URL=${backendOrigin}`,
        'npm --prefix frontend run dev',
        '--',
        '--host 127.0.0.1',
        `--port ${frontendPort}`,
        '--strictPort',
      ].join(' '),
      url: frontendOrigin,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
