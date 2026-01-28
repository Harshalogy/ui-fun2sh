const { expect } = require("@playwright/test");
const IOCasesLocators = require("../locators/ioCasesLocator");

class IOCasesPage {
  constructor(page) {
    this.page = page;
    this.locators = new IOCasesLocators(page);
  }

  async headerExists(headerText) {
    await this.locators.table.waitFor({ state: "visible", timeout: 15000 });
    const count = await this.locators.tableHeaders.count();
    const target = headerText.replace(/\s+/g, " ").trim().toLowerCase();
    for (let i = 0; i < count; i++) {
      const t = (await this.locators.tableHeaders.nth(i).innerText()).replace(/\s+/g, " ").trim().toLowerCase();
      if (t.includes(target)) return true;
    }
    return false;
  }

  async waitForRows(minRows = 1, timeout = 20000) {
    await this.locators.table.waitFor({ state: "visible", timeout: 15000 });
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const count = await this.locators.tableRows.count();
      if (count >= minRows) return count;
      await this.page.waitForTimeout(500);
    }
    return 0;
  }

  async getRowText(index) {
    return (await this.locators.tableRows.nth(index).innerText()).replace(/\s+/g, " ").trim();
  }

  async getStatusText(rowIndex) {
    const row = this.locators.tableRows.nth(rowIndex);
    if (await row.locator("span.io-status").count()) {
      return (await row.locator("span.io-status").first().innerText()).replace(/\s+/g, " ").trim();
    }
    const cells = row.locator("td");
    const c = await cells.count();
    if (c === 0) return "";
    return (await cells.nth(c - 1).innerText()).replace(/\s+/g, " ").trim();
  }

  async getCaseNameText(rowIndex) {
    const link = this.locators.caseLinks.nth(rowIndex);
    await expect(link).toBeVisible({ timeout: 15000 });
    return (await link.innerText()).replace(/\s+/g, " ").trim();
  }

  async clickCaseName(rowIndex) {
    const link = this.locators.caseLinks.nth(rowIndex);
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
  }

  async clickCaseByIndex(rowIndex) {
  // Generic method to click case by row index (0-based)
  const caseLink = this.locators.table.locator(
    `tbody tr:nth-child(${rowIndex + 1}) a.io-case-link`
  );

  await expect(caseLink).toBeVisible({ timeout: 15000 });

  // Wait for the navigation / XHR triggered by dblclick to settle
 await Promise.all([
  this.page.waitForLoadState('networkidle'),
  caseLink.dblclick({ force: true }),
]);
}

  async getRangeTextOrEmpty() {
    if (await this.locators.rangeLabel.count()) {
      return (await this.locators.rangeLabel.first().innerText()).replace(/\s+/g, " ").trim();
    }
    return "";
  }

  async getRecordsPerPageOptions() {
    if (!(await this.locators.recordsPerPageSelect.count())) return [];
    const opts = await this.locators.recordsPerPageSelect.locator("option").allInnerTexts();
    return opts.map(x => x.replace(/\s+/g, " ").trim()).filter(Boolean);
  }

  async selectRecordsPerPage(valueText) {
    if (!(await this.locators.recordsPerPageSelect.count())) return false;
    await this.locators.recordsPerPageSelect.selectOption({ label: valueText }).catch(async () => {
      await this.locators.recordsPerPageSelect.selectOption(valueText);
    });
    await this.page.waitForTimeout(800);
    return true;
  }

  async openNewCaseModalIfPossible() {
    await expect(this.locators.newCaseBtn).toBeVisible({ timeout: 15000 });
    await this.locators.newCaseBtn.click();
    await this.page.waitForTimeout(800);
  }

  async fillModalCaseName(name) {
    if (await this.locators.modalCaseNameInput.count()) {
      await this.locators.modalCaseNameInput.fill(name);
      await this.page.waitForTimeout(300);
    }
  }

  async closeModalIfPossible() {
    if (await this.locators.modalCancelBtn.count()) {
      await this.locators.modalCancelBtn.click().catch(async () => {
        await this.locators.modalCancelBtn.click({ force: true });
      });
      await this.page.waitForTimeout(500);
      return true;
    }
    if (await this.locators.modalCloseIcon.count()) {
      await this.locators.modalCloseIcon.click().catch(async () => {
        await this.locators.modalCloseIcon.click({ force: true });
      });
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }
}

module.exports = IOCasesPage;
