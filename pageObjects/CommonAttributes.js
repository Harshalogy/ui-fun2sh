const { expect } = require("@playwright/test");
const { ROLE_ROUTE, TC10CommonAttributesLocators } = require("../locators/CommonAttributesLocators");

class TC10CommonAttributesPage {
  constructor(page, role) {
    this.page = page;
    this.role = role;
    this.locators = new TC10CommonAttributesLocators(page);
  }

  async gotoRoleDashboard() {
    await this.page.goto(ROLE_ROUTE[this.role], { waitUntil: "networkidle" });
  }

  async setView(label) {
    if (await this.locators.viewByText.count()) {
      await expect(this.locators.viewByText).toBeVisible({ timeout: 20000 });
    }
    const target = this.page.getByLabel(label).first();
    await expect(target).toBeVisible({ timeout: 20000 });
    await target.click();
    await expect(target).toBeChecked({ timeout: 20000 });
  }

  async waitForCommonSection() {
    const count = await this.locators.commonSection.count();
    if (count === 0) {
      if (this.role === "IO") return null;
      throw new Error("Cases with Common Attributes section not found");
    }
    await expect(this.locators.commonSection).toBeVisible({ timeout: 25000 });
    if (await this.locators.sectionHeader.count()) {
      await expect(this.locators.sectionHeader).toBeVisible({ timeout: 25000 });
    }
    return this.locators.commonSection;
  }

  async waitForTableUpdate() {
    await Promise.race([
      this.locators.rows.first().waitFor({ state: "visible", timeout: 7000 }).catch(() => null),
      this.locators.emptyState.first().waitFor({ state: "visible", timeout: 7000 }).catch(() => null),
      new Promise((r) => setTimeout(r, 700)),
    ]);
  }

  async waitForFundTableUpdate() {
    await Promise.race([
      this.locators.fundRows.first().waitFor({ state: "visible", timeout: 7000 }).catch(() => null),
      new Promise((r) => setTimeout(r, 500)),
    ]);
  }

  async getFirstEnabledOptionValue(selectLocator) {
    const options = selectLocator.locator("option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      const disabled = await opt.getAttribute("disabled");
      const value = await opt.getAttribute("value");
      if (!disabled && value !== null && value !== "") return value;
    }
    return null;
  }

  async getSelectValues(selectLocator) {
    const values = [];
    const opts = selectLocator.locator("option");
    const count = await opts.count();
    for (let i = 0; i < count; i++) values.push(await opts.nth(i).getAttribute("value"));
    return values;
  }

  async isFundSectionAvailable() {
    return (await this.locators.fundSection.count()) > 0;
  }

  async ensureFundClearButton() {
    const c = await this.locators.fundClear.count();
    if (c > 0) return this.locators.fundClear;
    const alt = this.locators.fundSection.locator("button", { hasText: /Clear/i }).first();
    if (await alt.count()) return alt;
    return this.locators.fundSection.locator("button").filter({ hasText: /Clear/i }).first();
  }
}

module.exports = { TC10CommonAttributesPage };
