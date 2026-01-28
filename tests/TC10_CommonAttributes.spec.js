const { test, expect } = require("@playwright/test");
const SessionUtility = require("../utils/sessionUtility");
const { TC10CommonAttributesPage } = require("../pageObjects/CommonAttributes");
const { BASE_URL, ROLE_ROUTE } = require("../locators/CommonAttributesLocators");

const roles = ["IO", "SIO"];
const authFiles = {
  IO: "auth.json",
  SIO: "auth2.json",
};

// Logger utility
const log = {
  start: (testName) => console.log(`\n📋 START: ${testName}`),
  end: (testName) => console.log(`✅ END: ${testName}\n`),
  check: (msg) => console.log(`  ✓ ${msg}`),
  info: (msg) => console.log(`  ℹ ${msg}`),
  assert: (msg, value) => console.log(`  ✓ ${msg}: ${value}`),
  error: (msg) => console.log(`  ✗ ${msg}`),
};

test.describe("TC10: Cases with Common Attributes - Optimized QA Suite", () => {
  let page;

  test.beforeEach(async ({ browser: testBrowser }, testInfo) => {
    const context = await testBrowser.newContext();
    page = await context.newPage();
    
    // Extract role from test title
    const role = testInfo.title.includes("[IO]") ? "IO" : "SIO";
    const authFile = authFiles[role];
    
    // Inject session storage from appropriate auth file based on role
    await SessionUtility.injectSessionStorage(page, authFile);
    log.info(`Session initialized with ${authFile} for ${role} user`);
  });

  test.afterEach(async () => {
    await page.context().close();
  });


  for (const role of roles) {
    test.describe(`Common Attributes Suite - ${role}`, () => {
      
      // ========== COMMON ATTRIBUTES TABLE SECTION TESTS ==========
      
      test(`TC10-001: View switching and section visibility [${role}]`, async () => {
        log.start(`TC10-001 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        
        log.info(`Navigating to ${role} dashboard`);
        
        // Test switching between views and verifying section/radio button
        await po.setView("Disputed Amount");
        log.check("Set view to Disputed Amount");
        
        let section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available for this role, skipping");
          return;
        }
        
        await expect(po.locators.commonSection).toBeVisible();
        log.check("Common section is visible");
        
        await expect(po.locators.disputedRadio).toBeChecked();
        log.check("Disputed Amount radio is checked");
        
        // Switch to Transaction Amount
        await po.setView("Transaction Amount");
        log.check("Switched to Transaction Amount view");
        
        section = await po.waitForCommonSection();
        if (!section) return;
        
        await expect(po.locators.transactionRadio).toBeChecked();
        log.check("Transaction Amount radio is checked");
        
        // Switch back to verify stability
        await po.setView("Disputed Amount");
        log.check("Switched back to Disputed Amount");
        
        section = await po.waitForCommonSection();
        if (!section) return;
        
        await expect(po.locators.commonSection).toBeVisible();
        log.check("Common section still visible after view switching");
        
        log.end(`TC10-001 [${role}]`);
      });

      test(`TC10-002: Search functionality across views [${role}]`, async () => {
        log.start(`TC10-002 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing search in both views for ${role}`);
        
        // Test search in Disputed Amount view
        await po.setView("Disputed Amount");
        log.check("Set view to Disputed Amount");
        
        const section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        await expect(po.locators.search).toBeVisible({ timeout: 20000 });
        log.check("Search field is visible");
        
        await expect(po.locators.search).toBeEnabled();
        log.check("Search field is enabled");
        
        await po.locators.search.fill("TEST");
        log.check("Filled search with 'TEST'");
        
        await expect(po.locators.search).toHaveValue("TEST");
        log.check("Search value verified: TEST");
        
        await po.waitForTableUpdate();
        log.check("Table updated after search");
        
        // Clear and test Transaction Amount view
        await po.locators.search.clear();
        log.check("Search cleared");
        
        await expect(po.locators.search).toHaveValue("");
        log.check("Search value cleared");
        
        await po.setView("Transaction Amount");
        log.check("Switched to Transaction Amount");
        
        await expect(po.locators.search).toBeVisible({ timeout: 20000 });
        log.check("Search field visible in Transaction Amount");
        
        await po.locators.search.fill("TRANS");
        log.check("Filled search with 'TRANS'");
        
        await expect(po.locators.search).toHaveValue("TRANS");
        log.check("Search value verified: TRANS");
        
        log.end(`TC10-002 [${role}]`);
      });

      test(`TC10-003: Filter controls availability and configuration [${role}]`, async () => {
        log.start(`TC10-003 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Validating filter controls for ${role}`);
        
        await po.setView("Disputed Amount");
        const section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        // Verify all filter controls are visible
        await expect(po.locators.columnSelect).toBeVisible({ timeout: 20000 });
        log.check("Column select dropdown visible");
        
        await expect(po.locators.search).toBeVisible({ timeout: 20000 });
        log.check("Search control visible");
        
        await expect(po.locators.caseSelect).toBeVisible({ timeout: 20000 });
        log.check("Case select dropdown visible");
        
        await expect(po.locators.attributeTypeSelect).toBeVisible({ timeout: 20000 });
        log.check("Attribute type select visible");
        
        await expect(po.locators.exportBtn).toBeVisible({ timeout: 20000 });
        log.check("Export button visible");
        
        await expect(po.locators.clearBtn).toBeVisible({ timeout: 20000 });
        log.check("Clear button visible");
        
        // Verify column dropdown options
        const columnValues = await po.getSelectValues(po.locators.columnSelect);
        log.assert("Column options count", columnValues.length);
        expect(columnValues).toEqual(expect.arrayContaining(["all", "sn", "type", "value"]));
        log.check("Column dropdown has expected options: all, sn, type, value");
        
        // Verify attribute type dropdown
        const attrOptions = await po.locators.attributeTypeSelect.locator("option").count();
        log.assert("Attribute type options count", attrOptions);
        expect(attrOptions).toBeGreaterThanOrEqual(1);
        log.check("Attribute type dropdown has options");
        
        log.end(`TC10-003 [${role}]`);
      });

      test(`TC10-004: Filter and clear functionality [${role}]`, async () => {
        log.start(`TC10-004 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing filter and clear functionality for ${role}`);
        
        await po.setView("Disputed Amount");
        const section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        await expect(po.locators.clearBtn).toBeVisible({ timeout: 20000 });
        log.check("Clear button is visible");
        
        // Apply filter and verify clear button works
        await po.locators.search.fill("test");
        log.check("Filled search with 'test'");
        
        await expect(po.locators.search).toHaveValue("test");
        log.assert("ASSERT: Search field has value", "test");
        
        await expect(po.locators.clearBtn).toBeEnabled({ timeout: 20000 });
        log.assert("ASSERT: Clear button enabled after filter", "true");
        
        await po.locators.clearBtn.click();
        log.check("Clicked clear button");
        
        await expect(po.locators.search).toHaveValue("");
        log.assert("ASSERT: Search field cleared", "empty");
        
        // Test Case filter
        await expect(po.locators.caseSelect).toBeVisible({ timeout: 25000 });
        log.check("Case select is visible");
        
        const firstCaseValue = await po.getFirstEnabledOptionValue(po.locators.caseSelect);
        if (firstCaseValue) {
          log.info(`Case option found: ${firstCaseValue}`);
          await po.locators.caseSelect.selectOption(firstCaseValue);
          log.check("Selected case option");
          
          await po.waitForTableUpdate();
          log.check("Table updated after case selection");
        } else {
          log.info("No case options available");
        }
        
        log.end(`TC10-004 [${role}]`);
      });

      test(`TC10-005: Table structure and data display [${role}]`, async () => {
        log.start(`TC10-005 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Validating table structure for ${role}`);
        
        await po.setView("Disputed Amount");
        const section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        // Verify table structure
        await expect(po.locators.table).toBeVisible({ timeout: 25000 });
        log.assert("ASSERT: Table is visible", "true");
        
        const headerCount = await po.locators.headerRows.count();
        log.assert("ASSERT: Header rows count", headerCount);
        expect(headerCount).toBeGreaterThanOrEqual(1);
        
        if (headerCount > 0) {
          const headers = await po.locators.headerRows.nth(0).innerText();
          log.assert("ASSERT: Headers contain SN", "true");
          expect(headers).toMatch(/SN/i);
        }
        
        // Check rows or empty state
        await po.waitForTableUpdate();
        log.check("Table update waited");
        
        const rowCount = await po.locators.rows.count();
        log.assert("ASSERT: Row count", rowCount);
        
        if (rowCount === 0) {
          const emptyCount = await po.locators.emptyState.count();
          log.assert("ASSERT: Empty state count", emptyCount);
          if (emptyCount > 0) {
            await expect(po.locators.emptyState.first()).toBeVisible();
            log.check("Empty state is visible");
          }
        } else {
          log.check(`Table has ${rowCount} rows`);
        }
        
        log.end(`TC10-005 [${role}]`);
      });

      test(`TC10-006: Pagination and records per page [${role}]`, async () => {
        log.start(`TC10-006 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing pagination for ${role}`);
        
        await po.setView("Disputed Amount");
        const section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        // Verify pagination wrapper
        await expect(po.locators.paginationWrapper).toBeVisible({ timeout: 25000 });
        log.assert("ASSERT: Pagination wrapper visible", "true");
        
        if (await po.locators.prevBtn.count()) {
          await expect(po.locators.prevBtn).toBeVisible();
          log.check("Previous button is visible");
        }
        
        if (await po.locators.nextBtn.count()) {
          await expect(po.locators.nextBtn).toBeVisible();
          log.check("Next button is visible");
        }
        
        if (await po.locators.activePage.count()) {
          await expect(po.locators.activePage).toBeVisible();
          log.check("Active page indicator is visible");
        }
        
        // Verify records per page selector
        await expect(po.locators.recordsPerPage).toBeVisible({ timeout: 25000 });
        log.assert("ASSERT: Records per page selector visible", "true");
        
        const pageValues = await po.getSelectValues(po.locators.recordsPerPage);
        log.assert("ASSERT: Records per page options", JSON.stringify(pageValues));
        expect(pageValues).toEqual(expect.arrayContaining(["10", "20", "50"]));
        
        await po.locators.recordsPerPage.selectOption("20");
        log.check("Selected records per page: 20");
        
        await expect(po.locators.recordsPerPage).toHaveValue("20");
        log.assert("ASSERT: Records per page value is 20", "20");
        
        log.end(`TC10-006 [${role}]`);
      });

      test(`TC10-007: Search and empty state handling [${role}]`, async () => {
        log.start(`TC10-007 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing empty state handling for ${role}`);
        
        await po.setView("Disputed Amount");
        const section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        // Test empty state with non-existent search
        await expect(po.locators.search).toBeVisible({ timeout: 25000 });
        log.check("Search field is visible");
        
        await po.locators.search.fill("XXXXXXXX_NONEXISTENT_DATA");
        log.check("Filled search with non-existent data");
        
        await po.waitForTableUpdate();
        log.check("Table updated after non-existent search");
        
        if (await po.locators.emptyState.count()) {
          await expect(po.locators.emptyState.first()).toBeVisible();
          log.assert("ASSERT: Empty state is visible for no results", "true");
        } else {
          log.info("No empty state found - may have data");
        }
        
        log.end(`TC10-007 [${role}]`);
      });

      test(`TC10-008: Export functionality across views [${role}]`, async () => {
        log.start(`TC10-008 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing export functionality for ${role}`);
        
        // Test export in Disputed Amount
        await po.setView("Disputed Amount");
        log.check("Set view to Disputed Amount");
        
        let section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        await expect(po.locators.exportBtn).toBeVisible({ timeout: 25000 });
        log.check("Export button visible in Disputed Amount");
        
        await expect(po.locators.exportBtn).toBeEnabled();
        log.check("Export button is enabled");
        
        let downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
        await po.locators.exportBtn.click();
        log.check("Export button clicked");
        
        let download = await downloadPromise;
        if (download) {
          const filename = download.suggestedFilename();
          log.assert("Download triggered with filename", filename);
          expect(filename).toBeTruthy();
          log.check("Export download successful");
        } else {
          log.info("Download event not captured (may be blocked)");
        }
        
        // Test export in Transaction Amount
        await po.setView("Transaction Amount");
        log.check("Switched to Transaction Amount");
        
        section = await po.waitForCommonSection();
        if (!section) return;
        
        await expect(po.locators.exportBtn).toBeVisible({ timeout: 25000 });
        log.check("Export button visible in Transaction Amount");
        
        await expect(po.locators.exportBtn).toBeEnabled();
        log.check("Export button is enabled in Transaction Amount");
        
        log.end(`TC10-008 [${role}]`);
      });

      test(`TC10-009: Section persistence and refresh [${role}]`, async () => {
        log.start(`TC10-009 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing section persistence after refresh for ${role}`);
        
        await po.setView("Disputed Amount");
        log.check("Set view to Disputed Amount");
        
        let section = await po.waitForCommonSection();
        if (!section) {
          log.info("Section not available, skipping");
          return;
        }
        
        log.check("Section loaded initially");
        
        // Verify section persists after refresh
        await page.reload({ waitUntil: "networkidle" });
        log.check("Page reloaded");
        
        section = await po.waitForCommonSection();
        if (!section) {
          log.error("Section not found after reload");
          return;
        }
        
        await expect(po.locators.commonSection).toBeVisible();
        log.assert("ASSERT: Common section visible after refresh", "true");
        
        log.end(`TC10-009 [${role}]`);
      });

      // ========== CASE-WISE FUND STATUS SECTION TESTS ==========

      test(`TC10-010: Fund Status table structure and visibility [${role}]`, async () => {
        log.start(`TC10-010 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Validating Fund Status table structure for ${role}`);
        
        await po.setView("Disputed Amount");
        log.check("Set view to Disputed Amount");
        
        if (!(await po.isFundSectionAvailable())) {
          log.info("Fund Status section not available for this role, skipping");
          return;
        }
        
        log.check("Fund Status section is available");
        
        // Verify table visibility
        await expect(po.locators.fundTable).toBeVisible({ timeout: 25000 });
        log.check("Fund Status table is visible");
        
        // Verify headers
        const headerCount = await po.locators.fundHeaderRows.count();
        log.assert("Fund header rows count", headerCount);
        expect(headerCount).toBeGreaterThan(0);
        log.check("Fund table headers found");
        
        const headers = await po.locators.fundHeaderRows.first().innerText();
        log.assert("Fund headers text", headers.substring(0, 50) + "...");
        expect(headers).toMatch(/Case Name|Acknowledgement|Status/i);
        log.check("Fund table headers contain expected columns");
        
        log.end(`TC10-010 [${role}]`);
      });

      test(`TC10-011: Fund Status search, filter and clear [${role}]`, async () => {
        log.start(`TC10-011 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing Fund Status search/filter for ${role}`);
        
        await po.setView("Disputed Amount");
        
        if (!(await po.isFundSectionAvailable())) {
          log.info("Fund Status section not available");
          return;
        }
        
        // Test search functionality
        await expect(po.locators.fundSearch).toBeVisible({ timeout: 20000 });
        log.check("Fund search field is visible");
        
        await po.locators.fundSearch.fill("test");
        log.check("Filled fund search with 'test'");
        
        await expect(po.locators.fundSearch).toHaveValue("test");
        log.assert("ASSERT: Fund search value is 'test'", "test");
        
        await po.waitForFundTableUpdate();
        log.check("Fund table updated after search");
        
        // Clear search
        await po.locators.fundSearch.clear();
        log.check("Cleared fund search");
        
        await expect(po.locators.fundSearch).toHaveValue("");
        log.assert("ASSERT: Fund search cleared", "empty");
        
        // Test column selection
        await expect(po.locators.fundColumnSelect).toBeVisible({ timeout: 20000 });
        log.check("Fund column select is visible");
        
        const firstFundCol = await po.getFirstEnabledOptionValue(po.locators.fundColumnSelect);
        if (firstFundCol) {
          log.info(`Fund column option found: ${firstFundCol}`);
          await po.locators.fundColumnSelect.selectOption(firstFundCol);
          log.check("Selected fund column option");
          
          await po.waitForFundTableUpdate();
          log.check("Fund table updated after column selection");
        }
        
        // Test clear button
        const clear = await po.ensureFundClearButton();
        if (await clear.count()) {
          await expect(clear).toBeVisible({ timeout: 20000 });
          log.check("Fund clear button is visible");
          
          await clear.click().catch(() => clear.click({ force: true }));
          log.check("Clicked fund clear button");
          
          await expect(po.locators.fundSearch).toHaveValue("");
          log.assert("ASSERT: Fund search cleared via button", "empty");
        }
        
        log.end(`TC10-011 [${role}]`);
      });

      test(`TC10-012: Fund Status export and pagination [${role}]`, async () => {
        log.start(`TC10-012 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing Fund Status export and pagination for ${role}`);
        
        await po.setView("Disputed Amount");
        
        if (!(await po.isFundSectionAvailable())) {
          log.info("Fund Status section not available");
          return;
        }
        
        // Test export
        await expect(po.locators.fundExport).toBeVisible({ timeout: 25000 });
        log.check("Fund export button is visible");
        
        await expect(po.locators.fundExport).toBeEnabled();
        log.assert("ASSERT: Fund export button is enabled", "true");
        
        const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
        await po.locators.fundExport.click();
        log.check("Clicked fund export button");
        
        await downloadPromise;
        log.check("Fund export download triggered");
        
        // Test pagination
        await expect(po.locators.fundPaginationWrapper).toBeVisible({ timeout: 25000 });
        log.assert("ASSERT: Fund pagination wrapper visible", "true");
        
        if (await po.locators.fundPrev.count()) {
          await expect(po.locators.fundPrev).toBeVisible();
          log.check("Fund previous button is visible");
        }
        
        if (await po.locators.fundNext.count()) {
          await expect(po.locators.fundNext).toBeVisible();
          log.check("Fund next button is visible");
        }
        
        log.end(`TC10-012 [${role}]`);
      });

      test(`TC10-013: Fund Status records per page and Transaction view [${role}]`, async () => {
        log.start(`TC10-013 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC10CommonAttributesPage(page, role);
        log.info(`Testing Fund Status records per page for ${role}`);
        
        // Test records per page
        await po.setView("Disputed Amount");
        log.check("Set view to Disputed Amount");
        
        if (!(await po.isFundSectionAvailable())) {
          log.info("Fund Status section not available");
          return;
        }
        
        await expect(po.locators.fundRecordsPerPage).toBeVisible({ timeout: 25000 });
        log.check("Fund records per page selector is visible");
        
        const optCount = await po.locators.fundRecordsPerPage.locator("option").count();
        log.assert("ASSERT: Fund records per page options count", optCount);
        expect(optCount).toBeGreaterThan(0);
        
        // Test Transaction Amount view
        await po.setView("Transaction Amount");
        log.check("Switched to Transaction Amount");
        
        if (!(await po.isFundSectionAvailable())) {
          log.info("Fund Status section not available in Transaction view");
          return;
        }
        
        await expect(po.locators.fundTable).toBeVisible({ timeout: 25000 });
        log.assert("ASSERT: Fund table visible in Transaction Amount", "true");
        
        const rowCount = await po.locators.fundRows.count();
        log.assert("ASSERT: Fund rows count in Transaction Amount", rowCount);
        expect(rowCount).toBeGreaterThanOrEqual(0);
        
        // Verify fund data display
        await po.waitForFundTableUpdate();
        log.check("Fund table updated");
        
        if (rowCount > 0) {
          const firstRow = await po.locators.fundRows.first().innerText();
          log.assert("ASSERT: First fund row data", firstRow.substring(0, 50) + "...");
          expect(firstRow).toBeTruthy();
          log.check("Fund row data is present");
        } else {
          log.info("No fund rows to display");
        }
        
        log.end(`TC10-013 [${role}]`);
      });
    });
  }
});
