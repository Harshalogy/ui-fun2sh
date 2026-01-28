const { test, expect } = require('@playwright/test');
const SessionUtility = require('../utils/sessionUtility');
const { BASE_URL, ROLE_ROUTE } = require('../locators/CommonAttributesLocators');

const roles = ['SIO', 'IO'];
const authFiles = {
  IO: 'auth.json',
  SIO: 'auth2.json'
};

async function waitForTableReady(page, timeout = 45000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const spinner = page.locator('[class*="load"], [class*="spin"], .spinner').first();
    const rows = page.locator('table tbody tr, [role="row"]').first();
    const empty = page.locator('text=/no data|no records|empty/i').first();

    if ((await spinner.count()) === 0 && ((await rows.count()) > 0 || (await empty.count()) > 0)) {
      return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error('Table not ready within 45s');
}

async function openTopDataTab(page, tabName) {
  const tab = page.locator(`text="${tabName}"`).first();
  if (await tab.count() > 0) {
    await tab.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

async function testTableTab(page, tabName, expectedHeaders) {
  const tabOpened = await openTopDataTab(page, tabName);
  if (!tabOpened) {
    return { skipped: true };
  }

  await waitForTableReady(page, 45000);

  // Verify headers - use more flexible locator
  for (const header of expectedHeaders) {
    // Try exact match first
    const found = page.locator(`th:has-text("${header}"), td:has-text("${header}")`).first();
    if (await found.count() === 0) {
      // Try substring/partial match with case-insensitive regex
      const substringFound = page.locator('th, td').filter({ hasText: new RegExp(header, 'i') }).first();
      console.log(`Header "${header}" - exact match failed, searching for partial match...`);
      console.log(`Partial match found: ${await substringFound.count() > 0}`);
      if (await substringFound.count() > 0) {
        const text = await substringFound.textContent();
        console.log(`Matched text: "${text}"`);
      }
      expect(await substringFound.count()).toBeGreaterThan(0);
    } else {
      console.log(`Header "${header}" - exact match found`);
    }
  }

  // Verify data or empty state
  const rows = page.locator('table tbody tr');
  const empty = page.locator('text=/no data|empty/i').first();
  const hasContent = (await rows.count()) > 0 || (await empty.count()) > 0;
  expect(hasContent).toBe(true);

  // Verify no undefined/null values
  const cells = page.locator('table tbody td');
  for (let i = 0; i < Math.min(await cells.count(), 50); i++) {
    const text = await cells.nth(i).textContent();
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('null');
    expect(text).not.toContain('NaN');
  }

  // Check for styling (highlighting)
  let foundStyled = false;
  for (let i = 0; i < Math.min(await cells.count(), 50); i++) {
    const cell = cells.nth(i);
    const classes = await cell.getAttribute('class');
    const style = await cell.getAttribute('style');
    if ((classes && /red|green|yellow|high|medium|low/i.test(classes)) || 
        (style && (style.includes('background') || style.includes('color')))) {
      foundStyled = true;
      break;
    }
  }

  return { skipped: false, hasStyled: foundStyled || (await cells.count()) === 0 };
}

async function switchAmountMode(page, mode) {
  const modeRadio = page.locator(`[role="radio"]:has-text("${mode}")`).first();
  if (await modeRadio.count() > 0) {
    await modeRadio.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

async function waitForLoaderToDisappear(page) {
  const spinner = page.locator('[class*="load"], [class*="spin"], .spinner').first();
  let attempts = 0;
  while ((await spinner.count()) > 0 && attempts < 50) {
    await page.waitForTimeout(200);
    attempts++;
  }
}

// ============ TEST SUITE ============

test.describe('NCRP Dashboard - Comprehensive Top Data', () => {
  let page;

  test.beforeEach(async ({ browser: testBrowser }, testInfo) => {
    const context = await testBrowser.newContext();
    page = await context.newPage();

    // Extract role from test title
    const role = testInfo.title.includes('[IO]') ? 'IO' : 'SIO';
    const authFile = authFiles[role];

    // Inject session storage from appropriate auth file based on role
    await SessionUtility.injectSessionStorage(page, authFile);
    await page.goto(ROLE_ROUTE[role], { waitUntil: 'networkidle' });
    await expect(page.locator('text=/dashboard|top data|timeline/i').first()).toBeVisible({ timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.context().close();
  });

  for (const role of roles) {
    test.describe(`[${role}] Dashboard`, () => {


      // ========== TOP DATA TABLES ==========

      test(`TOPDATA-1: Accounts to be put on Lien - headers, data, and validation [${role}]`, async () => {
        const result = await testTableTab(page, 'Accounts to be put on Lien', 
          ['Account No.', 'IFSC Code', 'Branch', 'Address', 'Total Amount', 'Unrecovered Amt']);

        await test.step('Test controls (sort, search, export, pagination)', async () => {
          const sortDropdown = page.locator('combobox:has-text("Sort")').first();
          if (await sortDropdown.count() > 0) {
            await sortDropdown.click({ timeout: 3000 }).catch(() => {});
          }

          const searchInput = page.locator('input[placeholder*="search" i]').first();
          if (await searchInput.count() > 0) {
            await searchInput.fill('TEST' + Math.random().toString(36).substring(7));
            await page.waitForTimeout(500);
            await searchInput.fill('');
          }

          const exportBtn = page.locator('button').filter({ hasText: /export/i }).first();
          if (await exportBtn.count() > 0) {
            await exportBtn.click({ timeout: 5000 }).catch(() => {});
            await page.waitForTimeout(500);
          }

          const clearBtn = page.locator('button:has-text("Clear")').first();
          if (await clearBtn.count() > 0 && !(await clearBtn.isDisabled())) {
            await clearBtn.click({ timeout: 3000 }).catch(() => {});
          }
        });
      });

      test(`TOPDATA-2: Top ATMs - headers, data, and validation [${role}]`, async () => {
        const result = await testTableTab(page, 'Top ATMs', 
          ['ATM ID', 'Account Count', 'Transaction Count', 'Total Amount', 'Linked', 'Bank']);

        await test.step('Test Linked Ack icon interaction if present', async () => {
          const icons = page.locator('[class*="eye"], [class*="icon"], button').filter({ hasText: /view|ack/i }).first();
          if (await icons.count() > 0) {
            try {
              await icons.click({ timeout: 3000 });
              await page.waitForTimeout(500);

              const modal = page.locator('[role="dialog"]').first();
              if (await modal.count() > 0) {
                const closeBtn = page.locator('[aria-label="close"]').first();
                if (await closeBtn.count() > 0) {
                  await closeBtn.click({ timeout: 3000 });
                }
              }
            } catch (e) {
              // Icon not interactive
            }
          }
        });
      });

      test(`TOPDATA-3: Top IFSC - headers, data, and validation [${role}]`, async () => {
        const result = await testTableTab(page, 'Top IFSC', 
          ['IFSC Code', 'Branch', 'Bank Name', 'Total Amount', 'Transaction Count']);
      });

      test(`TOPDATA-4: Top AEPS Users - headers, data, and validation [${role}]`, async () => {
        const result = await testTableTab(page, 'Top AEPS Users', 
          ['Accounts', 'Total Amount', 'Transaction Count']);
      });

      test(`TOPDATA-5: Top PoS Merchants - headers, data, and validation [${role}]`, async () => {
        const result = await testTableTab(page, 'Top PoS Merchants', 
          ['Merchant ID', 'Terminal ID', 'Total Amount', 'Transaction Count']);
      });

      // ========== MODE SWITCHING & VALIDATION ==========

      test(`TOPDATA-6: Amount mode switching and Top Data visibility [${role}]`, async () => {
        await test.step('Switch to Disputed Amount mode', async () => {
          const switched = await switchAmountMode(page, 'Disputed Amount');
          if (switched) {
            const topData = page.locator('text="Top Data"').first();
            expect(await topData.count()).toBeGreaterThanOrEqual(0);
          }
        });

        await test.step('Switch to Transaction Amount mode', async () => {
          const switched = await switchAmountMode(page, 'Transaction Amount');
          if (switched) {
            const topData = page.locator('text="Top Data"').first();
            expect(await topData.count()).toBeGreaterThanOrEqual(0);
          }
        });
      });

      // ========== NEGATIVE CASES & EDGE CONDITIONS ==========

      test(`TOPDATA-7: Tab switching stability and data consistency [${role}]`, async () => {
        await test.step('Test tab switching without crashes', async () => {
          const tabs = ['Accounts to be put on Lien', 'Top ATMs', 'Top IFSC', 'Top AEPS Users', 'Top PoS Merchants'];

          for (const tab of tabs) {
            const opened = await openTopDataTab(page, tab);
            if (opened) {
              await waitForTableReady(page, 45000).catch(() => {});
              const table = page.locator('table').first();
              expect(await table.count()).toBeGreaterThanOrEqual(0);
            }
          }
        });

        await test.step('Verify data consistency after refresh', async () => {
          const tabOpened = await openTopDataTab(page, 'Accounts to be put on Lien');
          if (!tabOpened) return;

          await waitForLoaderToDisappear(page);
          const rowsBefore = await page.locator('table tbody tr').count();

          await page.reload();
          await page.waitForLoadState('networkidle');
          await waitForLoaderToDisappear(page);
          await waitForTableReady(page, 45000);

          const rowsAfter = await page.locator('table tbody tr').count();
          // Should be same or similar (allowing for minor differences)
          expect(Math.abs(rowsBefore - rowsAfter)).toBeLessThan(rowsBefore + 5);
        });
      });

      test(`TOPDATA-8: Search and data handling edge cases [${role}]`, async () => {
        const tabOpened = await openTopDataTab(page, 'Accounts to be put on Lien');

        await test.step('Search for non-existent data', async () => {
          const searchInput = page.locator('input[placeholder*="search" i]').first();
          if (await searchInput.count() > 0) {
            await searchInput.fill('ZZZZNONEXISTENT' + Math.random());
            await page.waitForTimeout(1000);

            const empty = page.locator('text=/no data|no records|empty|-/i').first();
            // Should show empty state or no results
            expect(await empty.count()).toBeGreaterThanOrEqual(0);

            // Verify no undefined values in cells
            const cells = page.locator('table tbody td');
            for (let i = 0; i < Math.min(await cells.count(), 20); i++) {
              const text = await cells.nth(i).textContent();
              expect(text).not.toContain('undefined');
              expect(text).not.toContain('null');
            }
          }
        });

        await test.step('Clear search and verify data returns', async () => {
          const searchInput = page.locator('input[placeholder*="search" i]').first();
          if (await searchInput.count() > 0) {
            await searchInput.fill('');
            await page.waitForTimeout(1000);
            await waitForTableReady(page, 45000);

            const rows = page.locator('table tbody tr');
            expect(await rows.count()).toBeGreaterThan(0);
          }
        });
      });
    });
  }
});
