// playwright.config.js
const { defineConfig } = require('@playwright/test');
const dotenv = require('dotenv');

// Load environment variables from .env file (quiet mode to reduce logs)
dotenv.config({ debug: false });

// ***********************
// MAP ENVIRONMENT
// ***********************
const CURRENT_ENV = (process.env.ENVIRONMENT || 'qa').toUpperCase();

const BASE_URL = process.env[`BASE_URL_${CURRENT_ENV}`];
const USERNAME = process.env[`USERNAME_${CURRENT_ENV}`];
const PASSWORD = process.env[`PASSWORD_${CURRENT_ENV}`];

if (!BASE_URL) {
  throw new Error(`❌ BASE_URL_${CURRENT_ENV} is missing in .env file`);
}

// Environment info (commented out to reduce logs)

const fs = require('fs');
const path = require('path');
const authFile = path.join(__dirname, 'auth.json');
const hasAuthFile = fs.existsSync(authFile);

module.exports = defineConfig({
  testDir: './tests',
  
  globalSetup: require.resolve('./global-setup.js'),

  workers: 1, // Run tests sequentially (one at a time)

  projects: [
    // First test project - runs login test without session (creates session)
    {
      name: 'Chromium - First Login',
      testMatch: '**/TC01_login.spec.js',
      use: {
        browserName: 'chromium',
        headless: true,
        video: 'retain-on-failure',
        baseURL: BASE_URL,
        // No storageState - this test will create and save it
      },
    },
    // Other tests - use saved session if available
    {
      name: 'Chromium',
      testMatch: '**/*.spec.js',
      testIgnore: ['**/TC01_login.spec.js', '**/node_modules/**'], // Exclude login test file
      use: {
        browserName: 'chromium',
        headless: false,
        video: 'retain-on-failure',
        baseURL: BASE_URL,
        // Use saved session state if it exists
        ...(hasAuthFile && { storageState: 'auth.json' }),
      },
      // Only depend on login test if auth.json doesn't exist (will create it)
      ...(!hasAuthFile && { dependencies: ['Chromium - First Login'] }),
    },
  ],

  reporter: 'html',

  timeout: 120000, // Increased to 120 seconds for slow website

  expect: {
    timeout: 30000, // Increased expect timeout
  },

  use: {
    actionTimeout: 30000, // Increased action timeout for slow website
    viewport: { width: 1366, height: 768 },
  },
});
