// pageObjects/TC11EditCase.page.js
const { expect } = require("@playwright/test");
const { TC11 } = require("../locators/editCaseLocators");

class TC11EditCasePage {
  constructor(page, role = "SIO") {
    this.page = page;
    this.role = role;

    this.locators = {
      dashboard: {
        breadcrumbActive: page.locator(TC11.dashboard.breadcrumbActive),
        pageTitle: page.locator(TC11.dashboard.pageTitle),
        caseListSectionTitle: page.locator(TC11.dashboard.caseListSectionTitle),
        columnsSelect: page.locator(TC11.dashboard.columnsSelect),
        searchInput: page.locator(TC11.dashboard.searchInput),
        clearBtn: page.locator(TC11.dashboard.clearBtn),
        exportBtn: page.locator(TC11.dashboard.exportBtn),
        table: page.locator(TC11.dashboard.table),
        rows: page.locator(TC11.dashboard.tbodyRows),
        firstCaseLink: page.locator(TC11.dashboard.firstCaseLink).first(),
      },

      caseDetails: {
        breadcrumbActive: page.locator(TC11.caseDetails.breadcrumbActive),
        editCaseBtn: page.locator(TC11.caseDetails.editCaseBtn).first(),
        uploadedFileStackBtn: page.locator(TC11.caseDetails.uploadedFileStackBtn).first(),
        headerAckSpan: page.locator(TC11.caseDetails.headerAckSpan).first(),
      },

      editCase: {
        header: page.locator(TC11.editCase.header).first(),
        breadcrumb: page.locator(TC11.editCase.breadcrumb).first(),
        title: page.locator(TC11.editCase.title).first(),
        form: page.locator(TC11.editCase.form).first(),
        description: page.locator(TC11.editCase.description).first(),
        backBtn: page.locator(TC11.editCase.backBtn).first(),
        cancelBtn: page.locator(TC11.editCase.cancelBtn).first(),
        saveBtn: page.locator(TC11.editCase.saveBtn).first(),
        charCounter: page.locator(TC11.editCase.charCounter).first(),
        fileStack: page.locator(TC11.editCase.fileStack).first(),
        fileUploadInput: page.locator(TC11.editCase.fileUploadInput).first(),
      },
    };
  }

  async gotoRoleDashboard() {
    await this.page.goto(TC11.routes.dashboard, { waitUntil: "networkidle" });
    // title "Cases" exists on both dashboards (IO and SIO) in your DOM 
    await expect(this.locators.dashboard.pageTitle).toBeVisible({ timeout: 25000 });
    await expect(this.locators.dashboard.caseListSectionTitle).toBeVisible({ timeout: 25000 });
  }

  async openFirstAvailableCaseFromTable() {
    await expect(this.locators.dashboard.table).toBeVisible({ timeout: 30000 });

    // Ensure at least one row renders (if empty, we skip the test gracefully)
    const rowCount = await this.locators.dashboard.rows.count();
    if (rowCount === 0) return null;

    // Click first case link (does NOT depend on Case Name and is per-role) 
    await expect(this.locators.dashboard.firstCaseLink).toBeVisible({ timeout: 20000 });
    await this.locators.dashboard.firstCaseLink.click();

    await this.page.waitForLoadState("networkidle");
    await expect(this.locators.caseDetails.editCaseBtn).toBeVisible({ timeout: 25000 });

    return true;
  }

  async clickEditCase() {
    await expect(this.locators.caseDetails.editCaseBtn).toBeVisible({ timeout: 25000 });
    await this.locators.caseDetails.editCaseBtn.click();
    await this.page.waitForLoadState("networkidle");
    await this.waitForEditPage();
  }

  async waitForEditPage() {
    await expect(this.locators.editCase.header).toBeVisible({ timeout: 30000 });
    await expect(this.locators.editCase.form).toBeVisible({ timeout: 30000 });
  }

  async getEditTitleText() {
    const t = await this.locators.editCase.title.textContent().catch(() => "");
    return (t || "").trim();
  }

  async setDescription(value) {
    await expect(this.locators.editCase.description).toBeVisible({ timeout: 25000 });
    await this.locators.editCase.description.fill(value);
  }

  async getDescription() {
    if (!(await this.locators.editCase.description.count())) return "";
    // For textarea elements, use inputValue() to get the actual input value
    return await this.locators.editCase.description.inputValue({ timeout: 5000 }).catch(() => "");
  }

  async save() {
    await expect(this.locators.editCase.saveBtn).toBeVisible({ timeout: 25000 });
    await this.locators.editCase.saveBtn.click();
    await this.page.waitForLoadState("networkidle");
  }

  async cancel() {
    if (!(await this.locators.editCase.cancelBtn.count())) return false;
    if (!(await this.locators.editCase.cancelBtn.isVisible().catch(() => false))) return false;
    await this.locators.editCase.cancelBtn.click();
    await this.page.waitForLoadState("networkidle");
    return true;
  }

  async back() {
    if (!(await this.locators.editCase.backBtn.count())) return false;
    if (!(await this.locators.editCase.backBtn.isVisible().catch(() => false))) return false;
    await this.locators.editCase.backBtn.click();
    await this.page.waitForLoadState("networkidle");
    return true;
  }

  async charCounterVisible() {
    const n = await this.locators.editCase.charCounter.count();
    if (!n) return false;
    return await this.locators.editCase.charCounter.isVisible().catch(() => false);
  }

  async fileUploadPresent() {
    const n = await this.locators.editCase.fileUploadInput.count();
    if (!n) return false;
    return await this.locators.editCase.fileUploadInput.isVisible().catch(() => false);
  }
}

module.exports = { TC11EditCasePage };
