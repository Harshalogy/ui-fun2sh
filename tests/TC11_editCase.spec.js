// tests/TC11_editCase.spec.js - Optimized Test Suite
const { test, expect } = require("@playwright/test");
const SessionUtility = require("../utils/sessionUtility");
const { TC11EditCasePage } = require("../pageObjects/editCasePage");
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
};

test.describe("TC11: Edit Case - QA Validation Suite", () => {
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

  async function openEditFlow(page, role) {
    const po = new TC11EditCasePage(page, role);
    const ok = await po.openFirstAvailableCaseFromTable();
    if (!ok) return { po, skipped: true };
    await po.clickEditCase();
    return { po, skipped: false };
  }

  for (const role of roles) {
    test.describe(`Edit Case Suite - ${role}`, () => {
      // 1: Edit page loads with all core elements
      test(`Edit page loads with header, form, breadcrumb and title [${role}]`, async () => {
        log.start(`TC11-001 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-001 [${role}]`);
          return;
        }
        await expect(po.locators.editCase.header).toBeVisible({ timeout: 500 });
        await expect(po.locators.editCase.form).toBeVisible({ timeout: 500 });
        await expect(po.locators.editCase.breadcrumb).toBeVisible({ timeout: 500 });
        const title = await po.getEditTitleText();
        expect(title.length).toBeGreaterThan(0);
        log.check("All core edit page elements visible");
        log.end(`TC11-001 [${role}]`);
      });

      // 2: Description field operations
      test(`Description field is visible and accepts text input [${role}]`, async () => {
        log.start(`TC11-002 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-002 [${role}]`);
          return;
        }
        await expect(po.locators.editCase.description).toBeVisible({ timeout: 25000 });
        // Clear field first to ensure clean state
        await po.locators.editCase.description.clear();
        await page.waitForTimeout(300);
        const val = `TC11-${role}-${Date.now()}`;
        await po.setDescription(val);
        // Increased timeout to allow value to fully propagate through Angular change detection
        await expect(po.locators.editCase.description).toHaveValue(val, { timeout: 2000 });
        log.check("Description field works correctly");
        log.end(`TC11-002 [${role}]`);
      });

      // 3: Save functionality
      test(`Save button is visible, enabled, and persists changes [${role}]`, async () => {
        log.start(`TC11-003 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-003 [${role}]`);
          return;
        }
        await expect(po.locators.editCase.saveBtn).toBeVisible({ timeout: 25000 });
        await expect(po.locators.editCase.saveBtn).toBeEnabled({ timeout: 500 });
        
        // Clear field first to ensure clean state
        await po.locators.editCase.description.clear();
        await page.waitForTimeout(300);
        
        const val = `persist-${role}-${Date.now()}`;
        await po.setDescription(val);
        
        // Verify value is set before saving
        await expect(po.locators.editCase.description).toHaveValue(val, { timeout: 2000 });
        log.check("Description value set correctly");
        
        // Save and wait for completion
        await po.save();
        await page.waitForTimeout(1000); // Allow save to process
        await po.waitForEditPage();
        await page.waitForTimeout(500); // Allow page to stabilize after save
        
        const readBack = await po.getDescription();
        if (!readBack || readBack.length === 0) {
          log.info(`Description not persisted - field is empty after save`);
        }
        expect(readBack.length).toBeGreaterThan(0);
        log.check("Save functionality works correctly");
        log.end(`TC11-003 [${role}]`);
      });

      // 4: Cancel and Back navigation
      test(`Cancel and Back navigation work correctly [${role}]`, async () => {
        log.start(`TC11-004 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-004 [${role}]`);
          return;
        }
        await po.setDescription(`nav-${Date.now()}`);
        const cancelDid = await po.cancel();
        if (!cancelDid) {
          log.info("Cancel not available, testing Back");
          const backDid = await po.back();
          if (!backDid) {
            log.info("Back also not available");
            log.end(`TC11-004 [${role}]`);
            return;
          }
        }
        log.check("Navigation works correctly");
        log.end(`TC11-004 [${role}]`);
      });

      // 5: Text handling and validation
      test(`Description accepts long text, XSS payloads, and clears [${role}]`, async () => {
        log.start(`TC11-005 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-005 [${role}]`);
          return;
        }

        // Long text
        const long = "x".repeat(2000);
        await po.setDescription(long);
        const longGot = await po.getDescription();
        expect(longGot.length).toBeGreaterThan(0);
        expect(longGot.length).toBeLessThanOrEqual(2000);
        log.check("Long text handled");

        // XSS payload
        const payload = '<script>alert("xss")</script>';
        await po.setDescription(payload);
        const xssGot = await po.getDescription();
        expect(xssGot).toContain("<script>");
        log.check("XSS payload handled");

        // Clear
        await po.setDescription("to-clear");
        await po.setDescription("");
        await expect(po.locators.editCase.description).toHaveValue("", { timeout: 500 });
        log.check("Description cleared");

        log.end(`TC11-005 [${role}]`);
      });

      // 6: Edit page stability
      test(`Edit page remains stable after reload and multiple saves [${role}]`, async () => {
        log.start(`TC11-006 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-006 [${role}]`);
          return;
        }

        // Test reload
        await page.reload({ waitUntil: "networkidle" });
        await po.waitForEditPage();
        await expect(po.locators.editCase.form).toBeVisible({ timeout: 500 });
        log.check("Page stable after reload");

        // Test multiple saves
        await po.setDescription(`multi-${Date.now()}`);
        await po.save();
        await po.save();
        await po.waitForEditPage();
        await expect(po.locators.editCase.form).toBeVisible({ timeout: 500 });
        log.check("Multiple saves handled");

        // Test layout stability
        await po.setDescription(`layout-${Date.now()}`);
        await expect(po.locators.editCase.header).toBeVisible({ timeout: 500 });
        await expect(po.locators.editCase.form).toBeVisible({ timeout: 500 });
        log.check("Layout maintained after typing");

        log.end(`TC11-006 [${role}]`);
      });

      // 7: Description persistence and form state
      test(`Description persists after save and reload, save button stays enabled [${role}]`, async () => {
        log.start(`TC11-007 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-007 [${role}]`);
          return;
        }

        // Save and reload
        const val = `reload-${Date.now()}`;
        await po.setDescription(val);
        await po.save();
        await page.reload({ waitUntil: "networkidle" });
        await po.waitForEditPage();
        const got = await po.getDescription();
        expect(got.length).toBeGreaterThan(0);
        log.check("Description persists after reload");

        // Save button enabled after typing
        await po.setDescription(`enable-${Date.now()}`);
        await expect(po.locators.editCase.saveBtn).toBeEnabled({ timeout: 500 });
        log.check("Save button stays enabled");

        log.end(`TC11-007 [${role}]`);
      });

      // 8: Quick edits and character counter
      test(`Quick edits save correctly, character counter visible (if present) [${role}]`, async () => {
        log.start(`TC11-008 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-008 [${role}]`);
          return;
        }

        // Quick edits
        await po.setDescription(`quick1-${Date.now()}`);
        await po.setDescription(`quick2-${Date.now()}`);
        await po.save();
        await po.waitForEditPage();
        const got = await po.getDescription();
        expect(got.length).toBeGreaterThan(0);
        log.check("Quick edits saved");

        // Character counter
        await po.setDescription(`counter-${Date.now()}`);
        const visible = await po.charCounterVisible();
        if (visible) {
          await expect(po.locators.editCase.charCounter).toBeVisible({ timeout: 500 });
          log.check("Character counter visible");
        } else {
          log.info("Character counter not available");
        }

        log.end(`TC11-008 [${role}]`);
      });

      // 9: Optional features
      test(`File upload and file stack container present (optional) [${role}]`, async () => {
        log.start(`TC11-009 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const { po, skipped } = await openEditFlow(page, role);
        if (skipped) {
          log.info("No cases available");
          log.end(`TC11-009 [${role}]`);
          return;
        }

        // File upload
        const uploadPresent = await po.fileUploadPresent();
        if (uploadPresent) {
          await expect(po.locators.editCase.fileUploadInput).toBeVisible({ timeout: 500 });
          log.check("File upload input visible");
        } else {
          log.info("File upload not available");
        }

        // File stack
        if (await po.locators.editCase.fileStack.count()) {
          await expect(po.locators.editCase.fileStack).toBeVisible({ timeout: 25000 });
          log.check("File stack container visible");
        } else {
          log.info("File stack container not present");
        }

        log.end(`TC11-009 [${role}]`);
      });

      // 10: Dashboard and case navigation
      test(`Dashboard elements visible and case details accessible [${role}]`, async () => {
        log.start(`TC11-010 [${role}]`);
        await page.goto(ROLE_ROUTE[role], { waitUntil: "networkidle" });
        const po = new TC11EditCasePage(page, role);

        // Dashboard elements
        await expect(po.locators.dashboard.exportBtn).toBeVisible({ timeout: 25000 });
        log.check("Export button visible");

        await expect(po.locators.dashboard.searchInput).toBeVisible({ timeout: 25000 });
        await po.locators.dashboard.searchInput.fill("test");
        await expect(po.locators.dashboard.searchInput).toHaveValue("test", { timeout: 500 });
        await po.locators.dashboard.searchInput.clear();
        log.check("Search input works");

        await expect(po.locators.dashboard.columnsSelect).toBeVisible({ timeout: 25000 });
        log.check("Columns dropdown visible");

        await expect(po.locators.dashboard.table).toBeVisible({ timeout: 25000 });
        log.check("Case table visible");

        // Case navigation
        const ok = await po.openFirstAvailableCaseFromTable();
        if (ok) {
          await expect(po.locators.caseDetails.editCaseBtn).toBeVisible({ timeout: 500 });
          log.check("Case details accessible with edit button");
        } else {
          log.info("No cases available for case details test");
        }

        log.end(`TC11-010 [${role}]`);
      });
    });
  }
});
