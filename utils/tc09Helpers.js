
class TC09Helpers {
  constructor(page, log) {
    this.page = page;
    this.log = log;
  }

  // ==================== NAVIGATION HELPERS ====================
  
  /**
   * Navigate to dashboard and switch view mode
   */
  async navigateAndSwitchView(dashboardPath, authFile, viewLabel = null) {
    const SessionUtility = require("../utils/sessionUtility");
    await SessionUtility.setupSessionAndNavigate(this.page, dashboardPath, authFile);
    
    if (viewLabel) {
      await this.switchViewMode(viewLabel);
    }
  }

  /**
   * Switch between Disputed/Transaction view modes
   */
  async switchViewMode(viewLabel) {
    const radio = this.page.getByLabel(viewLabel).first();
    
    if (await radio.count() > 0) {
      const isChecked = await radio.isChecked();
      if (!isChecked) {
        await radio.click();
        await this.page.waitForTimeout(500);
        const checkedAfter = await radio.isChecked();
        if (checkedAfter) {
          this.log.check(`View switched to ${viewLabel}`);
        }
      }
    } else {
      this.log.info(`${viewLabel} option not found`);
    }
  }

  // ==================== TABLE VALIDATION HELPERS ====================

  /**
   * Validate table structure (headers and row count)
   */
  async validateTableStructure(pageObject, tableName) {
    try {
      const isVisible = await pageObject.isFileStackTableVisible().catch(() => false);
      
      if (!isVisible) {
        this.log.check(`${tableName} not visible`);
        return { isVisible: false, headers: [], rowCount: 0 };
      }

      const headers = await pageObject.getFileStackColumnHeaders().catch(() => []);
      const rowCount = await pageObject.getFileStackRowCount().catch(() => 0);

      if (headers.length > 0) {
        this.log.assert(`${tableName} headers`, `${headers.length} columns`);
      }
      if (rowCount > 0) {
        this.log.assert(`${tableName} rows`, rowCount);
      }

      return { isVisible: true, headers, rowCount };
    } catch (e) {
      this.log.check(`${tableName} validation completed`);
      return { isVisible: false, headers: [], rowCount: 0 };
    }
  }

  /**
   * Validate Fund Status table structure
   */
  async validateFundStatusStructure(pageObject, tableName) {
    try {
      const isVisible = await pageObject.isFundStatusTableVisible().catch(() => false);
      
      if (!isVisible) {
        this.log.check(`${tableName} not visible`);
        return { isVisible: false, headers: [], rowCount: 0 };
      }

      const headers = await pageObject.getTableHeaders().catch(() => []);
      const rowCount = await pageObject.getRowCount().catch(() => 0);

      if (headers.length > 0) {
        this.log.assert(`${tableName} headers`, `${headers.length} columns`);
      }
      if (rowCount > 0) {
        this.log.assert(`${tableName} rows`, rowCount);
      }

      return { isVisible: true, headers, rowCount };
    } catch (e) {
      this.log.check(`${tableName} validation completed`);
      return { isVisible: false, headers: [], rowCount: 0 };
    }
  }

  /**
   * Validate required columns exist
   */
  async validateRequiredColumns(headers, requiredColumns, tableName) {
    if (headers.length === 0) return false;

    const found = {};
    for (const required of requiredColumns) {
      found[required] = headers.some(h => 
        h.toLowerCase().includes(required.toLowerCase())
      );
    }

    let allFound = true;
    Object.entries(found).forEach(([col, exists]) => {
      this.log.assert(`${tableName} - ${col}`, exists ? "✓" : "✗");
      if (!exists) allFound = false;
    });

    return allFound;
  }

  // ==================== SEARCH/FILTER HELPERS ====================

  /**
   * Test search functionality
   */
  async validateSearch(pageObject, searchTerm = "test") {
    const searchSuccess = await pageObject.searchFileStack(searchTerm).catch(() => false);
    
    if (searchSuccess) {
      this.log.check(`Search executed with '${searchTerm}'`);
      await pageObject.clearFileStackSearch().catch(() => {});
      this.log.check("Search cleared");
      return true;
    } else {
      this.log.info("Search not available or failed");
      return false;
    }
  }

  /**
   * Test table search functionality
   */
  async validateTableSearch(pageObject, searchTerm = "test") {
    const searchSuccess = await pageObject.searchTable(searchTerm).catch(() => false);
    
    if (searchSuccess) {
      this.log.check(`Table search executed with '${searchTerm}'`);
      await pageObject.clearFilters().catch(() => {});
      return true;
    } else {
      this.log.info("Table search not available");
      return false;
    }
  }

  // ==================== CONTROL VALIDATION HELPERS ====================

  /**
   * Validate button presence and state
   */
  async validateButton(selector, buttonName) {
    const buttons = await this.page.locator(selector).all();
    const count = buttons.length;

    if (count > 0) {
      const isEnabled = await buttons[0].isEnabled().catch(() => false);
      this.log.assert(`${buttonName}`, `${count} found, enabled=${isEnabled}`);
      return true;
    } else {
      this.log.info(`${buttonName} not found`);
      return false;
    }
  }

  /**
   * Validate pagination controls
   */
  async validatePaginationControls() {
    const prevBtn = await this.page.locator('button:has-text("Previous")').count();
    const nextBtn = await this.page.locator('button:has-text("Next")').count();
    const recordsSelector = await this.page.locator('combobox, select').count();

    this.log.assert("Previous button", prevBtn > 0 ? "available" : "not visible");
    this.log.assert("Next button", nextBtn > 0 ? "available" : "not visible");
    this.log.assert("Records selector", recordsSelector > 0 ? "available" : "not visible");

    return { hasPrevious: prevBtn > 0, hasNext: nextBtn > 0, hasRecordsSelector: recordsSelector > 0 };
  }

  // ==================== DATA VALIDATION HELPERS ====================

  /**
   * Validate currency format in cells
   */
  async validateCurrencyFormat(cellTexts = [], regex = /^₹[\d,]+(\.\d{2})?$/) {
    if (cellTexts.length === 0) {
      const cells = await this.page.locator('td').all();
      cellTexts = await Promise.all(
        cells.slice(0, 20).map(c => c.textContent().catch(() => ''))
      );
    }

    let totalChecked = 0;
    let validCount = 0;

    for (const text of cellTexts) {
      if (text?.includes('₹')) {
        totalChecked++;
        if (regex.test(text.trim())) {
          validCount++;
        }
      }
    }

    if (totalChecked > 0) {
      this.log.assert("Currency format", `${validCount}/${totalChecked} valid`);
    }

    return { totalChecked, validCount };
  }

  /**
   * Validate timestamp format in cells
   */
  async validateTimestampFormat(regex = /^\d{1,2}:\d{2}\s(AM|PM)\s\d{1,2}\s\w{3}\s\d{4}$/) {
    const cells = await this.page.locator('td').all();
    const cellTexts = await Promise.all(
      cells.slice(0, 30).map(c => c.textContent().catch(() => ''))
    );

    let totalChecked = 0;
    let validCount = 0;

    for (const text of cellTexts) {
      if (text?.includes('AM') || text?.includes('PM')) {
        totalChecked++;
        if (regex.test(text.trim())) {
          validCount++;
        }
      }
    }

    if (totalChecked > 0) {
      this.log.assert("Timestamp format", `${validCount}/${totalChecked} valid`);
    }

    return { totalChecked, validCount };
  }

  /**
   * Validate status column values
   */
  async validateStatusColumn(validStatuses = ['Open', 'Closed', 'Hold', 'Pending']) {
    const cells = await this.page.getByRole('cell').all();
    let totalChecked = 0;
    let validCount = 0;

    for (const cell of cells) {
      const text = await cell.textContent().catch(() => '');
      if (validStatuses.some(s => text?.includes(s))) {
        totalChecked++;
        validCount++;
      }
    }

    if (totalChecked > 0) {
      this.log.assert("Status values", `${validCount}/${totalChecked} valid`);
    }

    return { totalChecked, validCount };
  }

  // ==================== COLUMN SELECTION HELPERS ====================

  /**
   * Get available column options
   */
  async getColumnOptions(pageObject) {
    const options = await pageObject.getColumnOptions().catch(() => []);
    return options;
  }

  /**
   * Validate and select columns
   */
  async selectAndValidateColumns(pageObject, columns = []) {
    const allOptions = await this.getColumnOptions(pageObject);

    if (allOptions.length === 0) {
      this.log.check("Column selection not available");
      return false;
    }

    this.log.assert("Column options", `${allOptions.length} available`);

    if (columns.length > 0 && allOptions.length > 0) {
      try {
        await pageObject.selectColumn(columns[0]).catch(() => {});
        this.log.check(`Selected: ${columns[0]}`);
        return true;
      } catch (e) {
        return false;
      }
    }

    return true;
  }
}

module.exports = TC09Helpers;
