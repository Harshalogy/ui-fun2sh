// Import Playwright
const { chromium } = require('playwright');

(async () => {
  // Launch a browser
  const browser = await chromium.launch({ headless: false }); // 'headless: false' makes the browser visible
  const page = await browser.newPage(); // Create a new page/tab

  // Navigate to a website (for example, Google)
  await page.goto('https://www.google.com');

  // Wait for the page to load (optional, but good practice)
  await page.waitForSelector('input[name="q"]'); // Wait for the search input to appear

  // Take a screenshot of the page
  await page.screenshot({ path: 'google-screenshot.png' });

  console.log('Screenshot taken and saved as google-screenshot.png');

  // Close the browser
  await browser.close();
})();
