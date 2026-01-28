
require('dotenv').config();

class LoginUtility {
  constructor(page) {
    this.page = page;

    let environment = process.env.ENVIRONMENT || 'qa'; // Use `let` to allow reassignment

    // Fallback for environment variables if not set
    if (!process.env[`BASE_URL_${environment.toUpperCase()}`]) {
      console.error(`Environment variables for ${environment} are not set. Falling back to 'dev'.`);
      environment = 'dev'; // Reassign to 'dev' if the environment variables are not set
    }

    // Set environment-specific values
    this.baseURL = process.env[`BASE_URL_${environment.toUpperCase()}`];
    this.username = process.env[`USERNAME_${environment.toUpperCase()}`];
    this.password = process.env[`PASSWORD_${environment.toUpperCase()}`];

    // Ensure credentials are available
    if (!this.username || !this.password) {
      throw new Error('Username and/or Password not set in environment variables.');
    }

    // Define selectors for login form
    this.usernameField = 'input[placeholder="Username"]';
    this.passwordField = 'input[placeholder="Password"]';
    this.submitButton = 'button[type="submit"]';
  }

  // Helper method to navigate to the login page
  async navigateToLogin() {
    try {
      // Use 'load' instead of 'domcontentloaded' for more reliable page loading
      // Increase timeout to 60 seconds to handle slow-loading pages
      await this.page.goto(this.baseURL, { 
        waitUntil: 'load', 
        timeout: 60000 
      });
      
      // Wait for the login form to be visible to ensure page is loaded
      // Increased timeout to 30 seconds for slow websites
      await this.page.waitForSelector(this.usernameField, { state: 'visible', timeout: 30000 });
    } catch (error) {
      // Try with a more lenient wait strategy as fallback
      try {
        await this.page.goto(this.baseURL, { 
          waitUntil: 'commit', 
          timeout: 60000 
        });
        await this.page.waitForSelector(this.usernameField, { state: 'visible', timeout: 30000 });
      } catch (retryError) {
        console.error('Navigation failed:', retryError.message);
        throw retryError;
      }
    }
  }

  // Helper method to perform login
  async login(username = null, password = null) {
    try {
      // Use provided credentials or fall back to environment variables
      const loginUsername = username || this.username;
      const loginPassword = password || this.password;

      if (!loginUsername || !loginPassword) {
        throw new Error('Username and/or Password must be provided either as parameters or in environment variables.');
      }

      // Ensure page is loaded and wait for login form to be ready
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
      
      // Wait for the username field to appear with increased timeout
      await this.page.waitForSelector(this.usernameField, { state: 'visible', timeout: 30000 });
      
      // Clear any existing values before filling
      await this.page.fill(this.usernameField, '');
      await this.page.fill(this.usernameField, loginUsername);

      // Wait for the password field to appear with increased timeout
      await this.page.waitForSelector(this.passwordField, { state: 'visible', timeout: 30000 });
      await this.page.fill(this.passwordField, loginPassword);

      // Wait for authentication API response before clicking submit
      const authResponsePromise = this.page.waitForResponse(response =>
        response.url().includes('/authentication/api/v1/user/authenticate') &&
        response.status() === 200,
        { timeout: 30000 }
      );

      // Click the submit button
      await this.page.click(this.submitButton);
      
      // Wait for authentication response
      const authResponse = await authResponsePromise;
      const authJson = await authResponse.json();
      
      // Extract token and user data from response
      const token = authJson?.data?.token || authJson?.token;
      if (!token) {
        throw new Error('Token not found in authentication response');
      }

      // Wait for navigation to dashboard - increased timeout for slow websites
      await this.page.waitForURL(/\/dashboard/, { timeout: 30000 });
      
      // Additional wait for page to be fully loaded - increased timeout
      await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
        // If networkidle times out, wait for load state as fallback
        return this.page.waitForLoadState('load', { timeout: 30000 });
      });

      // Wait for the application to store all localStorage and sessionStorage values
      await this.page.waitForTimeout(3000);
      
      // Check if authToken and userData are already stored in sessionStorage
      const existingAuthToken = await this.page.evaluate(() => sessionStorage.getItem('authToken'));
      const existingUserData = await this.page.evaluate(() => sessionStorage.getItem('userData'));
      
      // If not present, store them manually in sessionStorage
      if (!existingAuthToken || !existingUserData) {
        await this.page.evaluate(({ token, authJson, username }) => {
          if (!sessionStorage.getItem('authToken')) {
            sessionStorage.setItem('authToken', token);
          }
          
          const userData = {
            userName: username,
            token: token,
            twoWayAuthEnabled: authJson?.data?.twoWayAuthEnabled || false,
            status: authJson?.data?.status || authJson?.status || 'success',
            roles: authJson?.data?.roles || authJson?.data?.authorities || [],
            parentModules: authJson?.data?.parentModules || [],
            childModules: authJson?.data?.childModules || {}
          };
          
          if (!sessionStorage.getItem('userData')) {
            sessionStorage.setItem('userData', JSON.stringify(userData));
          }
        }, { token, authJson, username: loginUsername });
      }
      
      // Wait for app to set localStorage values (ncrp.theme, ncrp-auth-user-records, etc.)
      await this.page.waitForTimeout(2000);
      
      // Verify essential values are stored
      const finalAuthToken = await this.page.evaluate(() => sessionStorage.getItem('authToken'));
      const finalUserData = await this.page.evaluate(() => sessionStorage.getItem('userData'));
      
      if (!finalAuthToken || !finalUserData) {
        throw new Error('authToken or userData not found in sessionStorage after login');
      }

    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }

  // Helper method to save session state after successful login
  async saveSessionState(filePath = 'auth.json') {
    try {
      const fs = require('fs');
      const path = require('path');
      
      await this.page.waitForTimeout(1000);
      
      // Get storage state (localStorage and cookies)
      const context = this.page.context();
      const storageState = await context.storageState();
      
      // Capture sessionStorage values (Playwright doesn't capture them automatically)
      const sessionStorageData = await this.page.evaluate(() => {
        const sessionData = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          sessionData[key] = sessionStorage.getItem(key);
        }
        return sessionData;
      });
      
      if (!storageState.origins || storageState.origins.length === 0) {
        throw new Error('No origins found in storage state');
      }
      
      // Add sessionStorage to storage state
      storageState.origins[0].sessionStorage = Object.keys(sessionStorageData).map(key => ({
        name: key,
        value: sessionStorageData[key]
      }));
      
      // Save to file
      const fullPath = path.resolve(process.cwd(), filePath);
      fs.writeFileSync(fullPath, JSON.stringify(storageState, null, 2));
      return fullPath;
    } catch (error) {
      console.error('Failed to save session state:', error);
      throw error;
    }
  }



  // Helper method for invalid login attempts
  async invalidLogin(username, password) {
    await this.page.waitForSelector(this.usernameField);
    await this.page.fill(this.usernameField, username);
    await this.page.waitForSelector(this.passwordField);
    await this.page.fill(this.passwordField, password);
    await this.page.click(this.submitButton);
  } 
}

module.exports = LoginUtility;
