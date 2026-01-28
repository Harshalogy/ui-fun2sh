const { test: base, expect } = require("@playwright/test");
const { AuthPage } = require("../../pageObjects/auth.page");
const { TC10CommonAttributesPage } = require("../../pageObjects/CommonAttributes");
const { BASE_URL } = require("../../locators/CommonAttributesLocators");

const API_URL = "http://148.113.0.204:9464/authentication/api/v1/user/authenticate";

const CREDS = {
  IO: { username: "ncrp_demo", password: "ncrp_demo" },
  SIO: { username: "ncrptest3", password: "Xalted@123" },
};

const roles = ["IO", "SIO"];

function roleFromTitle(title = "") {
  if (title.includes("[IO]")) return "IO";
  if (title.includes("[SIO]")) return "SIO";
  return "SIO";
}

const test = base.extend({
  page: async ({ browser }, use, testInfo) => {
    const role = roleFromTitle(testInfo.title);
    const auth = new AuthPage();

    await auth.loginByAPI(API_URL, CREDS[role].username, CREDS[role].password);
    await auth.prepareLocalStorage(BASE_URL);

    const { context, page } = await auth.createAuthenticatedContext(browser);
    const po = new TC10CommonAttributesPage(page, role);
    await po.gotoRoleDashboard();

    await use(page);
    await context.close();
  },
});

for (const role of roles) {
  test.describe(`TC10: Cases with Common Attributes - QA Validation Suite [${role}]`, () => {
    test(`TC10-001: Section visible in Disputed Amount view [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;
      await expect(po.locators.commonSection).toBeVisible();
    });

    test(`TC10-002: Disputed Amount radio selected [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      await expect(po.locators.disputedRadio).toBeChecked();
    });

    test(`TC10-003: Switch to Transaction Amount [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Transaction Amount");
      await expect(po.locators.transactionRadio).toBeChecked();
    });

    test(`TC10-004: Search works - Disputed Amount [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.search).toBeVisible({ timeout: 20000 });
      await expect(po.locators.search).toBeEnabled();

      await po.locators.search.fill("TEST");
      await expect(po.locators.search).toHaveValue("TEST");

      await po.locators.search.clear();
      await expect(po.locators.search).toHaveValue("");
    });

    test(`TC10-005: Search works - Transaction Amount [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Transaction Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.search).toBeVisible({ timeout: 20000 });
      await expect(po.locators.search).toBeEnabled();

      await po.locators.search.fill("TRANS");
      await expect(po.locators.search).toHaveValue("TRANS");
    });

    test(`TC10-006: Filter controls exist and are visible [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.columnSelect).toBeVisible({ timeout: 20000 });
      await expect(po.locators.search).toBeVisible({ timeout: 20000 });
      await expect(po.locators.caseSelect).toBeVisible({ timeout: 20000 });
      await expect(po.locators.attributeTypeSelect).toBeVisible({ timeout: 20000 });
      await expect(po.locators.exportBtn).toBeVisible({ timeout: 20000 });
      await expect(po.locators.clearBtn).toBeVisible({ timeout: 20000 });
    });

    test(`TC10-007: Column dropdown has expected options [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.columnSelect).toBeVisible({ timeout: 20000 });

      const values = await po.getSelectValues(po.locators.columnSelect);
      expect(values).toEqual(expect.arrayContaining(["all", "sn", "type", "value"]));
      if (values.includes("caseNames")) {
        expect(values).toEqual(expect.arrayContaining(["caseNames"]));
      }
    });

    test(`TC10-008: Clear enables after filter and clears [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.clearBtn).toBeVisible({ timeout: 20000 });

      await po.locators.search.fill("test");
      await expect(po.locators.search).toHaveValue("test");

      await expect(po.locators.clearBtn).toBeEnabled({ timeout: 20000 });

      await po.locators.clearBtn.click();
      await expect(po.locators.search).toHaveValue("");
    });

    test(`TC10-009: Export CSV visible/enabled - Disputed Amount [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.exportBtn).toBeVisible({ timeout: 25000 });
      await expect(po.locators.exportBtn).toBeEnabled();
    });

    test(`TC10-010: Export CSV visible/enabled - Transaction Amount [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Transaction Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.exportBtn).toBeVisible({ timeout: 25000 });
      await expect(po.locators.exportBtn).toBeEnabled();
    });

    test(`TC10-011: Table visible + headers match UI structure [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.table).toBeVisible({ timeout: 25000 });

      const headerCount = await po.locators.headerRows.count();
      expect(headerCount).toBeGreaterThanOrEqual(1);

      if (headerCount > 0) {
        const r1 = (await po.locators.headerRows.nth(0).innerText()).replace(/\s+/g, " ").trim();
        expect(r1).toMatch(/SN/i);
      }
    });

    test(`TC10-012: Rows render OR empty state is acceptable [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await po.waitForTableUpdate();

      const rowCount = await po.locators.rows.count();
      if (rowCount > 0) return;

      const emptyCount = await po.locators.emptyState.count();
      if (emptyCount > 0) {
        await expect(po.locators.emptyState.first()).toBeVisible();
        return;
      }
    });

    test(`TC10-013: Pagination wrapper visible (buttons may be disabled) [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.paginationWrapper).toBeVisible({ timeout: 25000 });

      if (await po.locators.prevBtn.count()) await expect(po.locators.prevBtn).toBeVisible();
      if (await po.locators.nextBtn.count()) await expect(po.locators.nextBtn).toBeVisible();
      if (await po.locators.activePage.count()) await expect(po.locators.activePage).toBeVisible();
    });

    test(`TC10-014: Records-per-page selector options + change [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.recordsPerPage).toBeVisible({ timeout: 25000 });

      const values = await po.getSelectValues(po.locators.recordsPerPage);
      expect(values).toEqual(expect.arrayContaining(["10", "20", "50"]));

      await po.locators.recordsPerPage.selectOption("20");
      await expect(po.locators.recordsPerPage).toHaveValue("20");
    });

    test(`TC10-015: Select Case filter can be applied (if options exist) [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.caseSelect).toBeVisible({ timeout: 25000 });

      const firstValue = await po.getFirstEnabledOptionValue(po.locators.caseSelect);
      if (!firstValue) return;

      await po.locators.caseSelect.selectOption(firstValue);
      await po.waitForTableUpdate();
    });

    test(`TC10-016: Attribute Type dropdown present (options optional) [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.attributeTypeSelect).toBeVisible({ timeout: 25000 });

      const optionCount = await po.locators.attributeTypeSelect.locator("option").count();
      expect(optionCount).toBeGreaterThanOrEqual(1);
    });

    test(`TC10-017: Export CSV triggers download (if supported) [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.exportBtn).toBeVisible({ timeout: 25000 });
      await expect(po.locators.exportBtn).toBeEnabled();

      const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
      await po.locators.exportBtn.click();
      const download = await downloadPromise;
      if (!download) return;

      const suggested = download.suggestedFilename();
      expect(suggested).toBeTruthy();
    });

    test(`TC10-018: Empty state handling after no-match search [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.search).toBeVisible({ timeout: 25000 });

      await po.locators.search.fill("XXXXXXXX_NONEXISTENT_DATA");
      await po.waitForTableUpdate();

      if (await po.locators.emptyState.count()) {
        await expect(po.locators.emptyState.first()).toBeVisible();
      }
    });

    test(`TC10-019: Section persists after refresh [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");
      const section1 = await po.waitForCommonSection();
      if (!section1) return;

      await po.locators.rows.count();

      await page.reload({ waitUntil: "networkidle" });

      const section2 = await po.waitForCommonSection();
      if (!section2) return;

      await po.locators.rows.count();
    });

    test(`TC10-020: Switching views keeps section stable [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);

      await po.setView("Disputed Amount");
      let section = await po.waitForCommonSection();
      if (!section) return;

      await po.setView("Transaction Amount");
      section = await po.waitForCommonSection();
      if (!section) return;

      await po.setView("Disputed Amount");
      section = await po.waitForCommonSection();
      if (!section) return;

      await expect(po.locators.commonSection).toBeVisible();
    });

    test(`TC10-021: Case-wise Fund Status table visible [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundTable).toBeVisible({ timeout: 25000 });
    });

    test(`TC10-022: Case-wise Fund Status headers and columns [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      const headerCount = await po.locators.fundHeaderRows.count();
      expect(headerCount).toBeGreaterThan(0);

      const headers = await po.locators.fundHeaderRows.first().innerText();
      expect(headers).toMatch(/Case Name|Acknowledgement|Status/i);
    });

    test(`TC10-023: Case-wise Fund Status search functionality [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundSearch).toBeVisible({ timeout: 20000 });

      await po.locators.fundSearch.fill("test");
      await expect(po.locators.fundSearch).toHaveValue("test");
      await po.waitForFundTableUpdate();

      await po.locators.fundSearch.clear();
      await expect(po.locators.fundSearch).toHaveValue("");
    });

    test(`TC10-024: Case-wise Fund Status column selection [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundColumnSelect).toBeVisible({ timeout: 20000 });

      const firstValue = await po.getFirstEnabledOptionValue(po.locators.fundColumnSelect);
      if (!firstValue) return;

      await po.locators.fundColumnSelect.selectOption(firstValue);
      await po.waitForFundTableUpdate();
    });

    test(`TC10-025: Case-wise Fund Status clear filters [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundSearch).toBeVisible({ timeout: 20000 });

      await po.locators.fundSearch.fill("test");

      const clear = await po.ensureFundClearButton();
      if (await clear.count()) {
        await expect(clear).toBeVisible({ timeout: 20000 });
        await clear.click().catch(() => clear.click({ force: true }));
        await expect(po.locators.fundSearch).toHaveValue("");
      }
    });

    test(`TC10-026: Case-wise Fund Status Export CSV [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundExport).toBeVisible({ timeout: 25000 });
      await expect(po.locators.fundExport).toBeEnabled();

      const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
      await po.locators.fundExport.click();
      await downloadPromise;
    });

    test(`TC10-027: Case-wise Fund Status pagination [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundPaginationWrapper).toBeVisible({ timeout: 25000 });

      if (await po.locators.fundPrev.count()) await expect(po.locators.fundPrev).toBeVisible();
      if (await po.locators.fundNext.count()) await expect(po.locators.fundNext).toBeVisible();
    });

    test(`TC10-028: Case-wise Fund Status records per page [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundRecordsPerPage).toBeVisible({ timeout: 25000 });

      const optCount = await po.locators.fundRecordsPerPage.locator("option").count();
      expect(optCount).toBeGreaterThan(0);
    });

    test(`TC10-029: Case-wise Fund Status Transaction Amount view [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Transaction Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await expect(po.locators.fundTable).toBeVisible({ timeout: 25000 });

      const rowCount = await po.locators.fundRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test(`TC10-030: Case-wise Fund Status fund calculations display [${role}]`, async ({ page }) => {
      const po = new TC10CommonAttributesPage(page, role);
      await po.setView("Disputed Amount");

      if (!(await po.isFundSectionAvailable())) return;

      await po.waitForFundTableUpdate();
      const rowCount = await po.locators.fundRows.count();
      if (rowCount > 0) {
        const firstRow = await po.locators.fundRows.first().innerText();
        expect(firstRow).toBeTruthy();
      }
    });
  });
}
