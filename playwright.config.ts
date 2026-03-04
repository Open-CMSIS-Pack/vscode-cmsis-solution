import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './src/e2e-tests',
    timeout: 480 * 1000, // 8 minutes - longer than vcpkg polling timeout of 7 minutes
    expect: {
        timeout: 5000,
    },

    /* Run tests in files in parallel */
    fullyParallel: false,
    workers: 1,
    retries: 0,

    reporter: [
        ['list'],
        ['html', { outputFolder: 'e2e-report' }],
        ['junit', { outputFile: 'e2e-report/results.xml' }],
    ],

    use: {
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'vscode-extension',
            testMatch: /.*\.test\.ts/,
        },
    ],

    // Output directory for test artifacts
    outputDir: 'test-results/',
});
