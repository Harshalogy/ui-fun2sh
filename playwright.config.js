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

// Check if auth file exists AND has valid (non-expired) token
function isAuthFileValid() {
  try {
    if (!fs.existsSync(authFile)) return false;
    
    const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
    const sessionStorage = authData.origins?.[0]?.sessionStorage || [];
    const authTokenObj = sessionStorage.find(item => item.name === 'authToken');
    
    if (!authTokenObj) return false;
    
    // Decode JWT and check expiration
    const token = authTokenObj.value;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    let payload = parts[1];
    payload += '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    if (!decoded.exp) return true; // No expiration claim, assume valid
    
    const isExpired = Date.now() > (decoded.exp * 1000);
    if (isExpired) {
      console.log('⚠ Deleting expired auth.json - will create fresh session');
      fs.unlinkSync(authFile);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error validating auth.json:', error.message);
    return false;
  }
}

const hasAuthFile = isAuthFileValid();

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
        headless: true,
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
