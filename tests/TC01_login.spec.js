// /tests/loginTest.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pageObjects/login_page');
const SessionUtility = require('../utils/sessionUtility');

test.describe('Login Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await SessionUtility.injectSessionStorage(page,'auth.json');
  });

  // Test 1: Login with valid credentials
  // You can pass username and password as parameters, or leave empty to use environment variables
  test('Login with valid credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    
    // Option 1: Use environment variables (default - no parameters needed)
    // await loginPage.login();
    
    // Option 2: Pass credentials as parameters
    const username = 'ncrp_demo';
    const password = 'ncrp_demo';
    await loginPage.login(username, password);

    // Verify redirected to dashboard using URL pattern (more flexible)
    await expect(page).toHaveURL(/\/dashboard\/io$/);
    
    // Save session state for subsequent tests to reuse
    await loginPage.saveSessionState('auth.json');
  });

  // Test 2: Validate logout functionality (uses stored session from test 2)
  test('Validate logout functionality @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    // Navigate to dashboard (sessionStorage injected via beforeEach)
    const baseUrl = loginPage.getBaseUrl().replace(/\/login\/?$/, '');
    await page.goto(`${baseUrl}/dashboard/io`, { waitUntil: 'load', timeout: 60000 });
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      return page.waitForLoadState('load', { timeout: 30000 });
    });

    // Check if redirected to login (fallback to fresh login if session failed)
    if (page.url().includes('/login')) {
      await loginPage.login();
      await expect(page).toHaveURL(/\/dashboard\/io$/);
    } else {
      await expect(page).toHaveURL(/\/dashboard\/io$/);
    }

    // Open user menu and verify items
    await loginPage.openUserMenu();
    await loginPage.verifyUserMenuItems();

    // Logout
    await loginPage.logout();
    await loginPage.verifyLoginPage();
  });

 // Test 3: Invalid login scenarios (merged - invalid username, invalid password, empty credentials)
 test('Invalid login scenarios - invalid username, invalid password, and empty credentials @regression', async ({ page }) => {
  const loginPage = new LoginPage(page);
  // Navigate to login page once for all scenarios
  await loginPage.navigateToLogin();

  // Scenario 1: Invalid username
  const invalidUsername = 'krtest62invalid';
  const wrongPassword = 'wrongPassword123';
  const response1 = await loginPage.attemptInvalidLoginWithApiCheck(invalidUsername, wrongPassword);
  expect(response1.status()).toBe(401);
  await loginPage.verifyInvalidCredentialsErrorMessage();
  
  // Clear form and wait a moment
  await loginPage.clearCredentials();
  await page.waitForTimeout(500);

  // Scenario 2: Invalid password (valid username, wrong password)
  const validUsername = process.env.USERNAME_QA || process.env.USERNAME || 'krtest62';
  const response2 = await loginPage.attemptInvalidLoginWithApiCheck(validUsername, wrongPassword);
  expect(response2.status()).toBe(401);
  await loginPage.verifyInvalidCredentialsErrorMessage();
  
  // Clear form and wait a moment
  await loginPage.clearCredentials();
  await page.waitForTimeout(500);

  // Scenario 3: Empty credentials
  await loginPage.attemptLoginWithEmptyCredentials();
  await loginPage.verifyEmptyCredentialsValidationMessage();
});

});