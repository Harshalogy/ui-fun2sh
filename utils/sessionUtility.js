// utils/sessionUtility.js
const fs = require('fs');
const path = require('path');
const LoginPage = require('../pageObjects/login_page');

class SessionUtility {
  /**
   * Check if JWT token is expired
   * @param {string} token - JWT token string
   * @returns {boolean} - true if token is expired, false if valid
   */
  static isTokenExpired(token) {
    try {
      if (!token) return true;
      
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      // Decode payload (add padding if needed)
      let payload = parts[1];
      payload += '='.repeat((4 - payload.length % 4) % 4);
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      
      if (!decoded.exp) return false; // No expiration claim
      
      // Check if expired (convert exp to milliseconds)
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const isExpired = currentTime > expirationTime;
      
      if (isExpired) {
        const expiresIn = Math.round((expirationTime - currentTime) / 1000);
        console.log(`⚠ Token expired ${Math.abs(expiresIn)} seconds ago`);
      }
      
      return isExpired;
    } catch (error) {
      console.warn('Could not parse token:', error.message);
      return true; // Assume expired if we can't parse it
    }
  }

  /**
   * Check if auth.json exists and has valid (non-expired) token
   * @param {string} authFile - Path to auth.json
   * @returns {boolean} - true if auth file exists and token is valid
   */
  static isAuthFileValid(authFile) {
    try {
      if (!fs.existsSync(authFile)) {
        console.log('⚠ auth.json not found');
        return false;
      }
      
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
      const sessionStorage = authData.origins?.[0]?.sessionStorage || [];
      const authTokenObj = sessionStorage.find(item => item.name === 'authToken');
      
      if (!authTokenObj) {
        console.log('⚠ authToken not found in auth.json');
        return false;
      }
      
      const isExpired = this.isTokenExpired(authTokenObj.value);
      if (isExpired) {
        console.log('⚠ Stored token in auth.json is expired');
        return false;
      }
      
      console.log('✓ auth.json exists and token is valid');
      return true;
    } catch (error) {
      console.warn('Error validating auth.json:', error.message);
      return false;
    }
  }

  /**
   * Inject sessionStorage from auth.json (if exists and valid)
   * @param {Page} page - Playwright page object
   * @returns {Promise<void>}
   */
  static async injectSessionStorage(page, auth_File) {
    const fs = require('fs');
    const path = require('path');
    const authFile = path.join(process.cwd(), auth_File);
    
    if (fs.existsSync(authFile)) {
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
      if (authData.origins && authData.origins.length > 0 && authData.origins[0].sessionStorage) {
        await page.addInitScript((sessionStorageItems) => {
          if (sessionStorageItems && sessionStorageItems.length > 0) {
            sessionStorageItems.forEach(item => {
              try {
                sessionStorage.setItem(item.name, item.value);
              } catch (e) {
                // Ignore errors if sessionStorage is not available yet
              }
            });
          }
        }, authData.origins[0].sessionStorage);
      }
    }
  }

  /**
   * Setup session from auth.json and navigate to a specific page
   * @param {Page} page - Playwright page object
   * @param {string} targetUrl - URL to navigate to (e.g., '/dashboard/io')
   * @param {Object} options - Optional configuration
   * @param {Function} options.verifyPage - Optional function to verify page loaded correctly
   * @returns {Promise<Object>} - Returns { loginPage, baseUrl }
   */
  static async setupSessionAndNavigate(page, targetUrl, auth_File,options = {}) {
    const loginPage = new LoginPage(page);
    const baseUrl = loginPage.getBaseUrl().replace(/\/login\/?$/, '');
    const authFile = path.join(process.cwd(), auth_File);
    
    // Check for saved session from TC01
    if (fs.existsSync(authFile)) {
      console.log('✓ Using session from auth.json (created by TC01)');
      
      // Inject sessionStorage values (Playwright doesn't restore them automatically)
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
      if (authData.origins?.[0]?.sessionStorage) {
        await page.addInitScript((sessionStorageItems) => {
          sessionStorageItems?.forEach(item => {
            try {
              sessionStorage.setItem(item.name, item.value);
            } catch (e) {
              // Ignore errors
            }
          });
        }, authData.origins[0].sessionStorage);
      }
    } else {
      console.log('⚠ No auth.json found, will perform fresh login');
    }

    // Navigate to target URL using saved session
    await page.goto(`${baseUrl}${targetUrl}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      return page.waitForLoadState('load', { timeout: 30000 });
    });

    // Fallback to login if session failed (redirected to login page)
    if (page.url().includes('/login')) {
      console.log('⚠ Session expired or invalid, performing fresh login...');
      await loginPage.login();
      await page.goto(`${baseUrl}${targetUrl}`, { waitUntil: 'load', timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
        return page.waitForLoadState('load', { timeout: 30000 });
      });
      console.log('✓ Login successful, continuing with test');
    } else {
      console.log('✓ Successfully using saved session, continuing with test');
    }

    // Verify page if verification function provided
    if (options.verifyPage) {
      await options.verifyPage(page);
    }

    return { loginPage, baseUrl };
  }
}

module.exports = SessionUtility;
