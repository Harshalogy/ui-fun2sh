const DashboardLocators = require("../locators/DashboardLocators");

class DashboardPage {
  constructor(page) {
    this.page = page;
    this.locators = new DashboardLocators(page);
    
    // ========== CONSTANT ARRAYS ==========
    this.CASE_CARD_LABELS = [
      'ACTIVE CASES',
      'RE-OPENED CASES', 
      'CLOSED CASES',
      'TOTAL CASES'
    ];

    this.API_ENDPOINTS = [
      { apiLabel: 'Active Cases', endpoint: 'active/count' },
      { apiLabel: 'Re-Opened Cases', endpoint: 'reopened/count' },
      { apiLabel: 'Closed Cases', endpoint: 'closed/count' },
      { apiLabel: 'Total Cases', endpoint: 'count' }
    ];

    this.BASE_API_ENDPOINTS = [
      { label: 'Active Cases', endpoint: 'active/count' },
      { label: 'Re-Opened Cases', endpoint: 'reopened/count' },
      { label: 'Closed Cases', endpoint: 'closed/count' },
      { label: 'Total Cases', endpoint: 'count' }
    ];

    this.DASHBOARD_WIDGETS = [
      'Cases',
      'Balance Pending',
      'List of Cases',
      'MO Timeline',
      'Urgent Freezes',
      'Exit Mode Insights',
      'Related Cases Detected'
    ];
  }

  // ========== BASIC NAVIGATION AND UTILITY METHODS ==========
  
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTimeout(ms) {
    await this.page.waitForTimeout(ms);
  }

  // Header methods
  async getTitleBadgeText() {
    return await this.locators.titleBadge.innerText();
  }

  async getPageTitleText() {
    return await this.locators.pageTitle.innerText();
  }

  // Breadcrumb methods
  async getBreadcrumbActiveText() {
    return await this.locators.breadcrumbActive.innerText();
  }

  async getBackButtonInfo() {
    return {
      text: await this.locators.backButtonText.innerText(),
      icon: await this.locators.backButtonIcon.innerText()
    };
  }

  // Notification methods
  async getNotificationBadgeCount() {
    const count = await this.locators.notificationBadge.count();
    if (count > 0) {
      return await this.locators.notificationBadge.innerText();
    }
    return null;
  }

  // User menu methods
  async getUserNameText() {
    return await this.locators.userName.innerText();
  }

  // Sidebar methods
  async toggleSidebar() {
    await this.locators.sidebarToggle.click();
  }

  async clickInvestigatorMenu() {
    await this.locators.investigatorMenu.click();
    await this.page.waitForURL(/\/dashboard\/investigator/);
  }

  async isInvestigatorMenuActive() {
    const classAttr = await this.locators.investigatorMenu.getAttribute('class');
    return classAttr && classAttr.includes('active');
  }

  // Widget methods
  async getWidgetLocator(widgetName) {
    return this.page.getByText(widgetName, { exact: false }).first();
  }

  getDashboardWidgets() {
    return this.DASHBOARD_WIDGETS;
  }

  async getWidgetCount(widgetName) {
    const locator = await this.getWidgetLocator(widgetName);
    return await locator.count();
  }

  async isWidgetVisible(widgetName, timeout = 8000) {
    try {
      const locator = await this.getWidgetLocator(widgetName);
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // UI Control methods
  async getVisibleButtons(limit = 20) {
    const buttons = [];
    const count = await this.locators.allButtons.count();

    for (let i = 0; i < Math.min(count, limit); i++) {
      const button = this.locators.allButtons.nth(i);
      if (await button.isVisible()) {
        let text = (await button.innerText()).trim();
        if (!text) {
          text = await button.getAttribute("aria-label") || "(no label)";
        }
        buttons.push({ index: i, text });
      }
    }

    return buttons;
  }

  async getInputPlaceholders(limit = 10) {
    const inputs = [];
    const count = await this.locators.allInputs.count();

    for (let i = 0; i < Math.min(count, limit); i++) {
      const input = this.locators.allInputs.nth(i);
      const placeholder = await input.getAttribute("placeholder");
      inputs.push({ index: i, placeholder });
    }

    return inputs;
  }

  // Visualization popup
  async closeVisualizationPopupIfPresent() {
    if (await this.locators.visualizationDialog.count()) {
      if (await this.locators.visualizationCloseBtn.count()) {
        await this.locators.visualizationCloseBtn.click();
        return true;
      }
    }
    return false;
  }

  // Console error capture
  setupConsoleErrorCapture() {
    const errors = [];
    this.page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
        console.log("Console Error Captured:", msg.text());
      }
    });
    return errors;
  }

  // Helper method to take screenshot
  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `test-results/${name}.png`,
      fullPage: true
    });
  }

  // ========== GRID DATA METHODS ==========

  /**
   * Wait for Cases data to load
   */
  async waitForCasesData(timeout = 15000) {
    await this.page.waitForFunction(() => {
      const caseCards = document.querySelectorAll('.card-grid:not(.card-grid--compact) .card-value');
      return caseCards.length > 0 && Array.from(caseCards).every(card => {
        const text = card.textContent.trim();
        return text && text !== '';
      });
    }, { timeout });
  }

  /**
   * Wait for Balance Pending data to load with non-zero values
   */
  async waitForBalancePendingData(timeout = 30000) {
    await this.page.waitForFunction(() => {
      const balanceCards = document.querySelectorAll('.card-grid--compact .card-value');
      if (balanceCards.length === 0) return false;
      return Array.from(balanceCards).every(card => {
        const value = card.textContent.trim();
        return value && value !== "0" && value !== "₹0.00";
      });
    }, { timeout });
  }

  /**
   * Get all grid card data with detailed information
   */
  async getAllGridCardsDetailed() {
    const cards = [];
    const count = await this.locators.gridCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.locators.gridCards.nth(i);
      const label = (await this.locators.cardLabel(i).innerText()).trim();
      const valueText = (await this.locators.cardValue(i).innerText()).trim();
      const icon = (await this.locators.cardIcon(i).innerText()).trim();
      const colorClass = await card.getAttribute('class');

      const cleanValue = valueText.replace(/[^0-9.-]+/g, '');
      const value = parseFloat(cleanValue) || 0;

      cards.push({
        index: i,
        label,
        value: value,
        valueText: valueText,
        icon,
        colorClass: colorClass ? colorClass.split(' ').find(cls => cls.startsWith('card--')) : null,
        element: card
      });
    }

    return cards;
  }

  /**
   * Get count of cards in the main grid
   */
  async getGridCardCount() {
    return await this.locators.gridCards.count();
  }

  /**
   * Get Balance Pending cards
   */
  async getBalancePendingCards() {
    const cards = [];
    const count = await this.locators.bpCardLabels.count();

    for (let i = 0; i < count; i++) {
      cards.push({
        label: (await this.locators.bpCardLabel(i).innerText()).trim(),
        value: (await this.locators.bpCardValue(i).innerText()).trim()
      });
    }

    return cards;
  }

  // ========== DATA VALIDATION AND API COMPARISON METHODS ==========

  /**
   * Get API data with logging
   */
  async fetchApiDataWithLogging(tokenHelper, authToken) {
    const apiCounts = {};

    for (const ep of this.API_ENDPOINTS) {
      try {
        const apiValue = await tokenHelper.callCaseManagementAPI(ep.endpoint, authToken);
        apiCounts[ep.apiLabel] = apiValue;
        console.log(`  "${ep.apiLabel}": ${apiValue}`);
      } catch (error) {
        console.log(`  "${ep.apiLabel}": ERROR - ${error.message}`);
        apiCounts[ep.apiLabel] = null;
      }
    }

    return apiCounts;
  }

  /**
   * Compare only case-related cards with API data
   */
  async compareCaseCardsWithAPI(apiData) {
    const gridCards = await this.getAllGridCardsDetailed();
    const results = [];
    let allMatch = true;

    for (const card of gridCards) {
      if (this.CASE_CARD_LABELS.includes(card.label)) {
        const match = this.findMatchingAPIData(card.label, apiData);

        if (match && match.apiValue !== null) {
          const matches = card.value === match.apiValue;
          results.push({
            uiLabel: card.label,
            uiValue: card.value,
            uiValueText: card.valueText,
            apiLabel: match.apiLabel,
            apiValue: match.apiValue,
            matches: matches
          });

          if (!matches) {
            allMatch = false;
          }
        } else {
          results.push({
            uiLabel: card.label,
            uiValue: card.value,
            uiValueText: card.valueText,
            apiLabel: null,
            apiValue: null,
            matches: false,
            error: 'No matching API endpoint'
          });
          allMatch = false;
        }
      }
    }

    return {
      allMatch,
      results,
      gridCards: gridCards.filter(card => this.CASE_CARD_LABELS.includes(card.label))
    };
  }

  /**
   * Validate data consistency between different case counts
   */
  validateDataConsistency(apiData) {
    const active = apiData['Active Cases'] || 0;
    const reopened = apiData['Re-Opened Cases'] || 0;
    const closed = apiData['Closed Cases'] || 0;
    const total = apiData['Total Cases'] || 0;
    const calculatedTotal = active + reopened + closed;

    return {
      active,
      reopened,
      closed,
      total,
      calculatedTotal,
      isConsistent: calculatedTotal === total,
      summary: `Active (${active}) + Reopened (${reopened}) + Closed (${closed}) = ${calculatedTotal} vs Total: ${total}`
    };
  }

  /**
   * Find matching API data for UI label (case-insensitive)
   */
  findMatchingAPIData(uiLabel, apiCounts) {
    const uiLabelLower = uiLabel.toLowerCase();

    for (const [apiLabel, apiValue] of Object.entries(apiCounts)) {
      if (apiLabel.toLowerCase() === uiLabelLower) {
        return { apiLabel, apiValue };
      }
    }

    return null;
  }

  // ========== ARRAY GETTER METHODS ==========

  getCaseCardLabels() {
    return this.CASE_CARD_LABELS;
  }

  getApiEndpoints() {
    return this.API_ENDPOINTS;
  }

  getBaseApiEndpoints() {
    return this.BASE_API_ENDPOINTS;
  }

  getApiLabels() {
    return this.API_ENDPOINTS.map(ep => ep.apiLabel);
  }

  // ========== VERIFICATION METHODS ==========

    async doesMainCardGridExist() {
    const count = await this.locators.mainCardGrid.count();
    return count > 0;
  }

  async getGridCardsCount() {
    return await this.locators.gridCards.count();
  }

  async getAllCardsData() {
    const cardsData = [];
    const count = await this.getGridCardsCount();
    
    for (let i = 0; i < count; i++) {
      const label = await this.locators.cardLabel(i)?.textContent() || '';
      const value = await this.locators.cardValue(i)?.textContent() || '';
      cardsData.push({
        label: label.trim(),
        value: value.trim(),
        index: i
      });
    }
    return cardsData;
  }

  async validateCardVisibility(limit = 4) {
    const results = [];
    const cardCount = await this.getGridCardsCount();
    const cardsData = await this.getAllCardsData();
    
    for (let i = 0; i < Math.min(cardCount, limit); i++) {
      const card = this.locators.gridCards.nth(i);
      const isVisible = await card.isVisible();
      const label = i < cardsData.length ? cardsData[i].label : `Card ${i}`;
      
      results.push({
        index: i,
        label,
        visible: isVisible
      });
    }
    
    return results;
  }

}

module.exports = DashboardPage;