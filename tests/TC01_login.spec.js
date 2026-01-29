// /tests/loginTest.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pageObjects/login_page');
const SessionUtility = require('../utils/sessionUtility');

test.describe('Login Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    const fs = require('fs');
    const path = require('path');
    const authFile = path.join(process.cwd(), 'auth.json');
    
    if (SessionUtility.isAuthFileValid(authFile)) {
      console.log('✓ Injecting valid session from auth.json');
      await SessionUtility.injectSessionStorage(page, 'auth.json');
    } else {
      console.log('⚠ Skipping session injection - auth.json is invalid or token expired');
    }
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
    
    console.log(`📝 Entering credentials - Username: ${username}`);
    await loginPage.login(username, password);

    // Verify redirected to dashboard using URL pattern (more flexible)
    await expect(page).toHaveURL(/\/dashboard\/io$/);
    console.log('✓ Successfully navigated to dashboard');
    
    // Save session state for subsequent tests to reuse
    await loginPage.saveSessionState('auth.json');
    console.log('✓ Session saved to auth.json');
  });

  // Test 2: Validate logout functionality (uses stored session from test 2)
  test('Validate logout functionality @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    // Navigate to dashboard (sessionStorage injected via beforeEach)
    const baseUrl = loginPage.getBaseUrl().replace(/\/login\/?$/, '');
    
    console.log('📝 Testing logout functionality');
    
    await page.goto(`${baseUrl}/dashboard/io`, { waitUntil: 'load', timeout: 60000 });
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      return page.waitForLoadState('load', { timeout: 30000 });
    });

    // Check if redirected to login (fallback to fresh login if session failed)
    if (page.url().includes('/login')) {
      console.log('⚠ Not logged in, performing fresh login');
      await loginPage.login();
      await expect(page).toHaveURL(/\/dashboard\/io$/);
    } else {
      await expect(page).toHaveURL(/\/dashboard\/io$/);
      console.log('✓ Successfully logged in with saved session');
    }

    // Open user menu and verify items
    await loginPage.openUserMenu();
    console.log('✓ User menu opened - user is authenticated');
    
    await loginPage.verifyUserMenuItems();
    console.log('✓ User menu items verified');

    // Logout
    await loginPage.logout();
    console.log('✓ Logout clicked');
    
    await loginPage.verifyLoginPage();
    console.log('✓ Successfully logged out - redirected to login page');
  });

 // Test 3: Invalid login scenarios (merged - invalid username, invalid password, empty credentials)
 test('Invalid login scenarios - invalid username, invalid password, and empty credentials @regression', async ({ page }) => {
  const loginPage = new LoginPage(page);
  // Navigate to login page once for all scenarios
  await loginPage.navigateToLogin();
  
  console.log('📝 Testing invalid login scenarios');

  // Scenario 1: Invalid username
  const invalidUsername = 'krtest62invalid';
  const wrongPassword = 'wrongPassword123';
  
  console.log(`Testing invalid username: ${invalidUsername}`);
  const response1 = await loginPage.attemptInvalidLoginWithApiCheck(invalidUsername, wrongPassword);
  expect(response1.status()).toBe(401);
  console.log('✓ Invalid username rejected with 401');
  
  await loginPage.verifyInvalidCredentialsErrorMessage();
  console.log('✓ Error message displayed');
  
  // Clear form and wait a moment
  await loginPage.clearCredentials();
  await page.waitForTimeout(500);

  // Clear form and wait a moment
  await loginPage.clearCredentials();
  await page.waitForTimeout(500);

  // Scenario 2: Invalid password (valid username, wrong password)
  const validUsername = process.env.USERNAME_QA || process.env.USERNAME || 'krtest62';
  
  console.log(`Testing invalid password with username: ${validUsername}`);
  const response2 = await loginPage.attemptInvalidLoginWithApiCheck(validUsername, wrongPassword);
  expect(response2.status()).toBe(401);
  console.log('✓ Invalid password rejected with 401');
  
  await loginPage.verifyInvalidCredentialsErrorMessage();
  console.log('✓ Error message displayed');
  
  // Clear form and wait a moment
  await loginPage.clearCredentials();
  await page.waitForTimeout(500);

  // Scenario 3: Empty credentials
  console.log('Testing empty credentials');
  await loginPage.attemptLoginWithEmptyCredentials();
  await loginPage.verifyEmptyCredentialsValidationMessage();
  console.log('✓ Empty credentials validation message displayed');
});

});