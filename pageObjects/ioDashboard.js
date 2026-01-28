// pageObjects/ioDashboardPage.js
const IODashboardLocators = require("../locators/ioDashboardLocator");

class IODashboardPage {
  constructor(page) {
    this.page = page;
    this.locators = new IODashboardLocators(page);

    this.IO_WIDGETS = [
      "Cases",          // title
      "Case List",      // section title
      "New Case",       // button
      "Export CSV"      // button
    ];
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForTimeout(ms) {
    await this.page.waitForTimeout(ms);
  }

  setupConsoleErrorCapture() {
    const errors = [];
    this.page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    return errors;
  }

  // Header / breadcrumb getters
  async getIOTitleText() {
    return (await this.locators.ioTitle.innerText()).trim();
  }

  async getBreadcrumbActiveText() {
    return (await this.locators.breadcrumbActive.innerText()).trim();
  }

  async getBackButtonInfo() {
    return {
      text: (await this.locators.backButtonText.innerText()).trim(),
      icon: (await this.locators.backButtonIcon.innerText()).trim()
    };
  }

  async getNotificationBadgeCount() {
    if (await this.locators.notificationBadge.count()) {
      return (await this.locators.notificationBadge.innerText()).trim();
    }
    return null;
  }

  async getUserNameText() {
    return (await this.locators.userName.innerText()).trim();
  }

  async toggleSidebar() {
    await this.locators.sidebarToggle.click();
  }

  // IO specific
  async assertOnIODashboard() {
    await this.page.waitForURL(/\/dashboard\/io/);
    // Ensure correct root exists
    await this.locators.ioRoot.waitFor({ state: "visible", timeout: 15000 });
  }

  async isIOMenuActive() {
    const classAttr = await this.locators.ioMenu.getAttribute("class");
    return classAttr && classAttr.includes("active");
  }

  async clickIOMenu() {
    await this.locators.ioMenu.click();
    await this.page.waitForURL(/\/dashboard\/io/);
  }

  // Summary cards
  async getSummaryCards() {
    const cards = [];
    const count = await this.locators.summaryCards.count();

    for (let i = 0; i < count; i++) {
      cards.push({
        index: i,
        label: (await this.locators.summaryCardLabel(i).innerText()).trim(),
        valueText: (await this.locators.summaryCardValue(i).innerText()).trim()
      });
    }
    return cards;
  }

  // Case list / table
  async waitForTableRows(minRows = 1, timeout = 20000) {
    await this.page.waitForFunction(
      ({ selector, minRows }) => {
        const rows = document.querySelectorAll(selector);
        return rows.length >= minRows;
      },
      { selector: "app-io-dashboard app-cases tbody tr", minRows },
      { timeout }
    );
  }

  async getTableRowCount() {
    return await this.locators.tableBodyRows.count();
  }

  async searchCases(text) {
    await this.locators.searchInput.fill("");
    await this.locators.searchInput.fill(text);
  }

  async clearSearchIfEnabled() {
    if (await this.locators.clearBtn.count()) {
      const disabled = await this.locators.clearBtn.isDisabled();
      if (!disabled) await this.locators.clearBtn.click();
    }
  }

  // UI inventory helpers
  async getVisibleButtons(limit = 20) {
    const buttons = [];
    const count = await this.locators.allButtons.count();

    for (let i = 0; i < Math.min(count, limit); i++) {
      const button = this.locators.allButtons.nth(i);
      if (await button.isVisible()) {
        let text = (await button.innerText()).trim();
        if (!text) text = (await button.getAttribute("aria-label")) || "(no label)";
        buttons.push({ index: i, text });
      }
    }
    return buttons;
  }

  async getInputPlaceholders(limit = 20) {
    const inputs = [];
    const count = await this.locators.allInputs.count();

    for (let i = 0; i < Math.min(count, limit); i++) {
      const input = this.locators.allInputs.nth(i);
      if (await input.isVisible()) {
        inputs.push({
          index: i,
          placeholder: await input.getAttribute("placeholder")
        });
      }
    }
    return inputs;
  }
}

module.exports = IODashboardPage;
