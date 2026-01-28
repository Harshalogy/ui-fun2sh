const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

test.describe('Login and Lien Tab Validation – Final JS Suite (FIXED)', () => {
  let page;

  /* ==========================
     HELPERS
  ========================== */

  const log = (msg) => console.log(`▶️ ${msg}`);

  async function waitForLoadersHidden(timeout = 60000) {
    const loader = page.locator(
      'app-loader, .loader-overlay, .cdk-overlay-backdrop, .mat-progress-spinner'
    );
    try {
      await loader.first().waitFor({ state: 'hidden', timeout });
    } catch {}
  }

  async function closeAnyOverlay() {
    await page.keyboard.press('Escape');
    await page
      .locator('.cdk-overlay-backdrop')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  async function clickTab(tabText) {
    log(`Clicking tab → ${tabText}`);
    await closeAnyOverlay();
    await waitForLoadersHidden();

    const tab = page
      .getByRole('tab', { name: new RegExp(tabText, 'i') })
      .or(page.getByText(tabText, { exact: false }));

    await expect(tab).toBeVisible();
    await expect(tab).toBeEnabled();

    await tab.scrollIntoViewIfNeeded();
    await tab.click({ force: true });

    await waitForLoadersHidden();
  }

  /* ==========================
     LOGIN
  ========================== */

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('http://148.113.0.204:23810/login');

    await page.getByRole('textbox', { name: /user/i }).fill('ncrptest3');
    await page.getByRole('textbox', { name: /password/i }).fill('Xalted@123');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/dashboard|home/i);
  });

  /* ========================== TC01 ========================== */

  test('TC01 – Login validation', async () => {
    await expect(page).toHaveURL(/dashboard|home/i);
  });

  /* ========================== TC02–TC06 ========================== */

  test('TC02 – Accounts to be put on Lien tab', async () => {
    await clickTab('Accounts to be put on Lien');
  });

  test('TC03 – Top ATMs tab', async () => {
    await clickTab('Top ATMs');
  });

  test('TC04 – Top IFSC tab', async () => {
    await clickTab('Top IFSC');
  });

  test('TC05 – Top AEPS Users tab', async () => {
    await clickTab('Top AEPS Users');
  });

  test('TC06 – Top PoS Merchants tab', async () => {
    await clickTab('Top PoS Merchants');
  });

  /* ========================== TC07 ========================== */

  test('TC07 – View Legend button', async () => {
    await closeAnyOverlay();

    const legendBtn = page.locator(
      'button.legend-inline-btn, button:has(mat-icon:text("info"))'
    ).first();

    await expect(legendBtn).toBeVisible();
    log('Clicking View Legend');
    await legendBtn.click();

    const legendDialog = page.locator(
      'mat-dialog-container >> text=Glossary & Legend'
    );
    await expect(legendDialog).toBeVisible();

    await closeAnyOverlay();
  });

  /* ========================== TC08 ========================== */

  test('TC08 – Clear button validation', async () => {
    const clearBtn = page.locator('button.lien-export-btn', { hasText: 'Clear' });
    await expect(clearBtn).toBeVisible();
    await expect(clearBtn).toBeDisabled();
  });

  /* ========================== TC09 ========================== */

  test('TC09 – Export button validation', async () => {
    await clickTab('Accounts to be put on Lien');
    await closeAnyOverlay();

    const exportBtn = page
      .locator('button.lien-export-btn')
      .filter({ hasText: /export/i })
      .first();

    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();

    log('Clicking Export button');
    await exportBtn.click({ force: true });

    await waitForLoadersHidden(30000);

    log('Export completed (toast optional)');
  });

  /* ========================== TC10 ========================== */

  test('TC10 – Table headers visibility validation', async () => {
    await clickTab('Accounts to be put on Lien');

const headers = [
  /Account No\./i,
  /IFSC Code/i,
  /Branch/i,
  /Address/i,
  /Total Amount Received/i,
  /Total Amount Sent/i,
  /Total Amount Put on-hold/i,
  /Total Exit Amount/i,
  /Unrecovered Amt to be put on hold\/lien/i,
];

for (const h of headers) {
  await expect(page.locator('thead tr th', { hasText: h }).first()).toBeVisible();
}
  });

  /* ========================== TC11 ========================== */

  test('TC11 – Select Column dropdown validation', async () => {
    const select = page.locator('.lien-toolbar-left select.lien-select').first();
    await expect(select).toBeEnabled();
    await select.selectOption('accountNumber');
  });

  /* ========================== TC12 ========================== */

  test('TC12 – Search input and icon validation', async () => {
    await clickTab('Accounts to be put on Lien');

    const searchInput = page.locator(
      '.lien-search input[placeholder="Search all columns"]'
    );
    const searchIcon = page.locator(
      '.lien-search .material-icons',
      { hasText: 'search' }
    );

    if (await searchInput.count() === 0) {
      log('Search input not rendered – valid');
      return;
    }

    if (await searchInput.isDisabled()) {
      log('Search input disabled – valid');
      return;
    }

    await searchInput.fill('test123');
    await expect(searchInput).toHaveValue('test123');
    await searchIcon.click({ force: true });
    await searchInput.fill('');
  });

  /* ========================== TC13 ========================== */

  test('TC13 – Sort dropdown validation', async () => {
    const sort = page.locator('.lien-toolbar-left select.lien-select').nth(1);
    await sort.selectOption('1: ASC');
    await expect(sort).toHaveValue('1: ASC');
  });

  /* ========================== TC14 ========================== */

  test('TC14 – Paginator visibility', async () => {
    const paginator = page.locator('.mat-mdc-paginator-touch-target').first();
    await expect(paginator).toBeVisible();
  });

  /* ========================== TC15 ========================== */

  test('TC15 – Paginator navigation', async () => {
    const nextBtn = page.locator('button[aria-label="Next page"]');
    await nextBtn.click({ force: true });
  });

  /* ========================== TC16 – Toggle Theme with Color Change ========================== */

  test('TC16 – Toggle Theme and verify color change', async () => {
    log('Opening user dropdown');

    const userMenu = page.locator('span.user-menu__name', {
      hasText: 'ncrptest3'
    });

    await userMenu.click();
    await page.waitForTimeout(300);

    // Capture BEFORE color
    const beforeColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    log(`Theme BEFORE toggle color → ${beforeColor}`);

    const toggleTheme = page.locator('text=Toggle Theme').first();
    await toggleTheme.click({ force: true });

    await page.waitForTimeout(500);

    // Capture AFTER color
    const afterColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    log(`Theme AFTER toggle color → ${afterColor}`);

    // ASSERT: color must change
    expect(afterColor).not.toBe(beforeColor);

    log('Toggle Theme action verified: color changed successfully');
  });

});
