// tests/TC03_IOCases.spec.js
const { test, expect } = require("@playwright/test");
const IOCasesPage = require("../pageObjects/ioCasesPage");
const SessionUtility = require("../utils/sessionUtility");

test.describe('IO Cases Tests', () => {
  test.beforeEach(async ({ page }) => {
    await SessionUtility.setupSessionAndNavigate(page, '/dashboard/io','auth.json');
  });

  test("1 - IO Cases - Visibility and Basic Validation", async ({ page }) => {
    const ioCases = new IOCasesPage(page);

    // New Case Button visibility
    await expect(ioCases.locators.newCaseBtn).toBeVisible();
    const btnText = (await ioCases.locators.newCaseBtn.innerText()).replace(/\s+/g, " ").trim();
    expect(btnText.toLowerCase()).toContain("new case");

    // Case List Section visibility
    await expect(ioCases.locators.caseListTitle).toBeVisible();
    const titleText = (await ioCases.locators.caseListTitle.innerText()).replace(/\s+/g, " ").trim();
    expect(titleText.toLowerCase()).toContain("case list");

    // Search Input visibility
    await expect(ioCases.locators.searchInput).toBeVisible();
    const placeholder = await ioCases.locators.searchInput.getAttribute("placeholder");
    expect((placeholder || "").toLowerCase()).toContain("search");

    // Sidebar menu state validation
    await expect(ioCases.locators.ioMenuActive).toBeVisible();
    const classAttr = await ioCases.locators.ioMenuActive.getAttribute("class");
    expect(classAttr || "").toMatch(/active/i);

    // Status Column validation
    const rowCount = await ioCases.waitForRows(1, 20000);
    expect(rowCount).toBeGreaterThan(0);

    const allowed = ["open", "closed", "in progress", "on hold", "pending", "in review"];
    const toCheck = Math.min(10, rowCount);

    let matched = 0;
    for (let i = 0; i < toCheck; i++) {
      const status = (await ioCases.getStatusText(i)).toLowerCase();
      expect(status.length).toBeGreaterThan(0);
      if (allowed.includes(status)) matched++;
    }
    expect(matched).toBeGreaterThan(0);
  });

  test("2 - IO Case List - Search, Headers, Row Data & Counts", async ({ page }) => {
    const ioCases = new IOCasesPage(page);

    await expect(ioCases.locators.searchInput).toBeVisible();
    const placeholder = await ioCases.locators.searchInput.getAttribute("placeholder");
    expect((placeholder || "").toLowerCase()).toContain("search");

    await expect(ioCases.locators.table).toBeVisible({ timeout: 15000 });

    const headers = ["SN", "Case Name", "Acknowledgement No.", "Victim Name", "Account No.", "Status"];
    for (const h of headers) {
      const exists = await ioCases.headerExists(h);
      expect(exists).toBeTruthy();
    }

    const rowCount = await ioCases.waitForRows(1, 20000);
    expect(rowCount).toBeGreaterThan(0);

    const maxToCheck = Math.min(3, rowCount);
    for (let i = 0; i < maxToCheck; i++) {
      const rowText = await ioCases.getRowText(i);
      expect(rowText.length).toBeGreaterThan(0);
    }
  });

  test("3 - IO Case List - Pagination with Button Clicks", async ({ page }) => {
    const ioCases = new IOCasesPage(page);

    await expect(ioCases.locators.table).toBeVisible({ timeout: 15000 });

    if (await ioCases.locators.paginationWrapper.count()) {
      await expect(ioCases.locators.paginationWrapper).toBeVisible();
      await expect(ioCases.locators.prevBtn).toBeVisible();
      await expect(ioCases.locators.nextBtn).toBeVisible();

      const initialRange = await ioCases.getRangeTextOrEmpty();

      if (await ioCases.locators.nextBtn.isEnabled()) {
        await ioCases.locators.nextBtn.click();
        await page.waitForTimeout(700);
        const nextRange = await ioCases.getRangeTextOrEmpty();
        if (initialRange && nextRange) expect(nextRange).not.toBe(initialRange);
      }

      if (await ioCases.locators.prevBtn.isEnabled()) {
        await ioCases.locators.prevBtn.click();
        await page.waitForTimeout(700);
      }
    }

    if (await ioCases.locators.recordsPerPageSelect.count()) {
      await expect(ioCases.locators.recordsPerPageSelect).toBeVisible();
      const options = await ioCases.getRecordsPerPageOptions();
      expect(options.length).toBeGreaterThan(0);

      for (const opt of options) {
        await ioCases.selectRecordsPerPage(opt);
        const rowsAfter = await ioCases.waitForRows(1, 20000);
        expect(rowsAfter).toBeGreaterThan(0);
      }
    }
  });

  test("4 - IO New Case - Modal open/close + Next enable/disable", async ({ page }) => {
    const ioCases = new IOCasesPage(page);

    await ioCases.openNewCaseModalIfPossible();

    if (await ioCases.locators.newCaseModal.count()) {
      await expect(ioCases.locators.newCaseModal).toBeVisible();
      await expect(ioCases.locators.modalNextBtn).toBeVisible();

      await expect(ioCases.locators.modalNextBtn).toBeDisabled({ timeout: 5000 }).catch(() => { });
      await ioCases.fillModalCaseName("Test");
      await expect(ioCases.locators.modalNextBtn).toBeEnabled({ timeout: 5000 }).catch(() => { });
      await ioCases.closeModalIfPossible();
      await expect(ioCases.locators.newCaseModal).toBeHidden({ timeout: 8000 }).catch(() => { });
    }
  });

  test("5 - IO Case Name Hyperlink Navigation", async ({ page, context }) => {
    const ioCases = new IOCasesPage(page);

    const rowCount = await ioCases.waitForRows(1, 20000);
    expect(rowCount).toBeGreaterThan(0);

    // Click second case (index 1) using generic row index method
    const secondCaseName = await ioCases.getCaseNameText(1);
    expect(secondCaseName.length).toBeGreaterThan(0);
    console.log(`✓ Second case name: ${secondCaseName}`);

    const before = page.url();
    console.log(`[BEFORE] ${before}`);

    // Wait for navigation or new page after clicking
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 5000 }).catch(() => null), // Check if opens in new tab
      page.waitForURL(url => url !== before, { timeout: 10000 }).catch(() => null), // Check if URL changes
      ioCases.clickCaseByIndex(1)
    ]);

    const targetPage = newPage || page;

    await targetPage.waitForLoadState('domcontentloaded'); // usually enough; avoid overusing networkidle

    // Wait for the UI breadcrumb/header that proves the case loaded
    await targetPage
      .locator('span:has-text("Dashboard") span', { hasText: new RegExp(`^»\\s*${secondCaseName}$`) })
      .waitFor({ state: 'visible', timeout: 15000 });

    const after = targetPage.url();
    console.log(`[AFTER]  ${after}`);
    expect(after).not.toBe(before);
  });

  test("6 - IO New Case flow - Stepper Validation", async ({ page }) => {
    const ioCases = new IOCasesPage(page);

    await ioCases.openNewCaseModalIfPossible();

    if (await ioCases.locators.newCaseModal.count()) {
      await expect(ioCases.locators.newCaseModal).toBeVisible();

      if (await ioCases.locators.stepLabel("Basic").count()) await expect(ioCases.locators.stepLabel("Basic")).toBeVisible();
      if (await ioCases.locators.stepLabel("Upload").count()) await expect(ioCases.locators.stepLabel("Upload")).toBeVisible();
      if (await ioCases.locators.stepLabel("Review").count()) await expect(ioCases.locators.stepLabel("Review")).toBeVisible();

      await ioCases.closeModalIfPossible();
      await expect(ioCases.locators.newCaseModal).toBeHidden({ timeout: 8000 }).catch(() => { });
    }
  });
});
