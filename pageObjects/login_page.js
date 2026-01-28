// /pageObjects/loginPage.js
const LoginUtility = require('../utils/loginUtility');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginUtility = new LoginUtility(page);
    
    // Locators
    this.locators = {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      loginButton: 'button[type="submit"]',
      emptyCredentialsError: 'p.error-text:has-text("Please enter both username and password")',
      invalidCredentialsError: '.error-message, [data-testid="error-message"], .error-text',
      userMenuButton: 'button:has-text("ncrp_demo")'
    };
  }

  // ===== NAVIGATION METHODS =====
  async navigateToLogin() {
    await this.loginUtility.navigateToLogin();
  }

  async login(username = null, password = null) {
    await this.loginUtility.login(username, password);
  }

  // ===== USER MENU METHODS =====
  async openUserMenu() {
    await this.page.click(this.locators.userMenuButton);
    
    // Wait for menu to appear (using a short timeout)
    await this.page.waitForTimeout(1000);
  }

  async verifyUserMenuItems() {
    // Using getByRole for reliable selection
    await this.page.getByRole('menuitem', { name: 'Profile' }).waitFor({ state: 'visible' });
    await this.page.getByRole('menuitem', { name: 'Theme', exact: true }).waitFor({ state: 'visible' });
    await this.page.getByRole('menuitem', { name: 'Toggle Theme' }).waitFor({ state: 'visible' });
    await this.page.getByRole('menuitem', { name: 'Logout' }).waitFor({ state: 'visible' });
  }

  async logout() {
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    await this.page.waitForURL('**/login');
  }

  // ===== INVALID LOGIN METHODS =====
  async invalidLogin(username, password) {
    await this.loginUtility.invalidLogin(username, password);
  }

  async attemptInvalidLoginWithApiCheck(username, password) {
    const [response] = await Promise.all([
      this.page.waitForResponse(resp =>
        resp.url().includes('/authentication/api/v1/user/authenticate')
      ),
      this.invalidLogin(username, password)
    ]);
    return response;
  }

  // ===== VALIDATION METHODS =====
  async verifyLoginPage() {
    // Get base URL and ensure it ends with /login (handle case where it already includes /login)
    let baseUrl = this.getBaseUrl();
    // Remove trailing /login if present, then add it back
    baseUrl = baseUrl.replace(/\/login\/?$/, '');
    baseUrl = baseUrl.replace(/\/$/, '');
    
    await this.page.waitForURL(baseUrl + "/login");
    await this.page.locator(this.locators.loginButton).waitFor({ state: 'visible' });
  }

  async verifyEmptyCredentialsValidationMessage() {
    const errorElement = this.page.locator(this.locators.emptyCredentialsError);
    await errorElement.waitFor({ state: 'visible', timeout: 5000 });
    
    const errorText = await errorElement.textContent();
    if (!errorText.includes('Please enter both username and password')) {
      throw new Error(`Expected error message about empty credentials, but got: "${errorText}"`);
    }
  }

  async verifyInvalidCredentialsErrorMessage() {
    await this.page.locator(this.locators.invalidCredentialsError).waitFor({ 
      state: 'visible', 
      timeout: 5000 
    });
  }

  async attemptLoginWithEmptyCredentials() {
    // Click login without filling any fields
    await this.page.click(this.locators.loginButton);
    
    // Wait a moment for validation to trigger
    await this.page.waitForTimeout(500);
  }

  // ===== UTILITY METHODS =====
  getBaseUrl() {
    return this.loginUtility.baseURL;
  }

  // Save session state after successful login
  async saveSessionState(filePath ) {
    return await this.loginUtility.saveSessionState(filePath);
  }

  // Helper method to clear credentials
  async clearCredentials() {
    const usernameSelectors = [
      this.loginUtility.usernameField,
      this.locators.usernameInput
    ];
    
    const passwordSelectors = [
      this.loginUtility.passwordField,
      this.locators.passwordInput
    ];

    // Clear username field
    for (const selector of usernameSelectors) {
      try {
        const field = this.page.locator(selector);
        await field.waitFor({ state: 'visible', timeout: 5000 });
        await field.clear();
        break;
      } catch (e) {
        continue;
      }
    }

    // Clear password field
    for (const selector of passwordSelectors) {
      try {
        const field = this.page.locator(selector);
        await field.waitFor({ state: 'visible', timeout: 5000 });
        await field.clear();
        break;
      } catch (e) {
        continue;
      }
    }

    await this.page.waitForTimeout(200);
  }
}

module.exports = LoginPage;