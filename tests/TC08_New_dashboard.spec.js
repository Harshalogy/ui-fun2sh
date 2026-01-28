// /tests/loginTest.spec.js
const { test, expect } = require('@playwright/test');
const fs = require("fs");
const path = require("path");
const LoginPage = require('../pageObjects/login_page');
const SessionUtility = require('../utils/sessionUtility');
const {
  validatedashboard,
  validateSummaryCardsUsingAPI
} = require("../utils/loginHelper");
const AUTH_FILE = path.join(__dirname, "../auth2.json");

function getAuthToken() {
  const authData = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
  const sessionStorage = authData.origins[0].sessionStorage;
  const tokenObj = sessionStorage.find(item => item.name === "authToken");
  return tokenObj ? tokenObj.value : null;
}

test.describe('Login Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await SessionUtility.injectSessionStorage(page,'auth2.json');
  });

  // Test 1: Login with valid credentials
  test('Login with SIO credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    
    // Option 1: Use environment variables (default - no parameters needed)
    // await loginPage.login();
    
    // Option 2: Pass credentials as parameters
    const username = 'ncrptest3';
    const password = 'Xalted@123';
    await loginPage.login(username, password);

    // Verify redirected to dashboard using URL pattern (more flexible)
    await expect(page).toHaveURL(/\/dashboard\/sio$/);
    
    // Save session state for subsequent tests to reuse
    await loginPage.saveSessionState('auth2.json');
  });

    test("Execute dashboard scenario for SIO user", async ({ page, request }) => {
      await SessionUtility.setupSessionAndNavigate(page, '/dashboard/sio','auth2.json');
  
      await validatedashboard(page, "SIO");
      const token = getAuthToken();
      await validateSummaryCardsUsingAPI(page, request, token, "SIO");
    });


});