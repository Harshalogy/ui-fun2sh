const { test, expect } = require('@playwright/test');

const baseUrl = process.env.BASE_URL || 'http://148.113.0.204:23810';

const users = [
  { name: 'SIO', username: 'ncrptest3', password: 'Xalted@123' },
  { name: 'IO', username: 'ncrp_demo', password: 'ncrp_demo' },
];

const caseIndexes = [
  { index: 0, name: 'First' },
  { index: 1, name: 'Second' },
];

users.forEach(user => {
  caseIndexes.forEach(caseInfo => {
    test(`${user.name} - ${caseInfo.name} case loads`, async ({ page }) => {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
      await page.fill('input[type="text"]', user.username);
      await page.fill('input[type="password"]', user.password);
      await page.keyboard.press('Enter');
      await page.waitForURL(/dashboard/);

      const rows = page.locator('table tbody tr');
      await rows.nth(caseInfo.index).click();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('main')).toBeVisible();
    });
  });
});

users.forEach(user => {
  test(`${user.name} - Fund Status section`, async ({ page }) => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', user.username);
    await page.fill('input[type="password"]', user.password);
    await page.keyboard.press('Enter');
    await page.waitForURL(/dashboard/);

    const rows = page.locator('table tbody tr');
    await rows.nth(0).click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h3', { timeout: 5000 });

    expect(await page.locator('h3').filter({ hasText: 'Fund Status' }).count()).toBeGreaterThan(0);
  });
});

users.forEach(user => {
  test(`${user.name} - Exit Modes section`, async ({ page }) => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', user.username);
    await page.fill('input[type="password"]', user.password);
    await page.keyboard.press('Enter');
    await page.waitForURL(/dashboard/);

    const rows = page.locator('table tbody tr');
    await rows.nth(0).click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h3', { timeout: 5000 });

    expect(await page.locator('h3').filter({ hasText: 'Exit Modes' }).count()).toBeGreaterThan(0);
  });
});

users.forEach(user => {
  test(`${user.name} - Tables present`, async ({ page }) => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', user.username);
    await page.fill('input[type="password"]', user.password);
    await page.keyboard.press('Enter');
    await page.waitForURL(/dashboard/);

    const rows = page.locator('table tbody tr');
    await rows.nth(0).click();
    await page.waitForLoadState('networkidle');

    expect(await page.locator('table').count()).toBeGreaterThan(0);
  });
});

users.forEach(user => {
  test(`${user.name} - Edit Case button`, async ({ page }) => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', user.username);
    await page.fill('input[type="password"]', user.password);
    await page.keyboard.press('Enter');
    await page.waitForURL(/dashboard/);

    const rows = page.locator('table tbody tr');
    await rows.nth(0).click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button', { timeout: 5000 });

    expect(await page.locator('button').filter({ hasText: 'Edit Case' }).count()).toBeGreaterThan(0);
  });
});
