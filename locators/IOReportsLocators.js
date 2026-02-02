class IOReportsLocators {
  constructor(page) {
    this.page = page;

    // ========== CASE & NAVIGATION ==========
    this.caseNameLabel = page.locator('text=/case name|case id/i').first();
    this.leftNavPanel = page.locator('.left-nav-panel, [class*="nav"], aside').first();
    this.reportsNavItem = page.locator('[role="menuitem"]').filter({ hasText: 'Reports' });

    // ========== FORM FIELDS & LABELS ==========
    this.ackNumberLabel = page.locator('mat-label:has-text("ACK Number(s)")').first();
    this.topLimitLabel = page.locator('label').filter({ hasText: /top limit|limit/i }).first();
    
    // ========== DROPDOWNS ==========
    this.ackNumberDropdown = page.locator('mat-select[formcontrolname="ackNumber"]').first();
    this.topLimitDropdown = page.locator('mat-select[formcontrolname="reportLimit"]').first();

    // ========== CHECKBOXES ==========
    this.consolidatedCheckbox = page.locator('input[type="checkbox"]').first();

    // ========== BUTTONS ==========
    this.submitRequestBtn = page.locator('button').filter({ hasText: /submit|request/i }).first();
    this.viewProgressBtn = page.locator('button').filter({ hasText: /view progress|progress/i }).first();
    this.modalCloseBtn = page.locator('button[aria-label*="close"], button').filter({ hasText: /close|×/i }).first();

    // ========== TABLE - REPORTS ==========
    this.table = page.locator('table').first();
    this.tableRows = this.table.locator('tbody tr, [role="row"]');
    this.tableHeaders = this.table.locator('thead th, [role="columnheader"]');

    // ========== MODAL & PROGRESS ==========
    this.progressModal = page.locator('[role="dialog"], mat-dialog-container').first();
    this.modalTitle = this.progressModal.locator('h1, h2, [class*="title"]').first();

    // ========== LOG TABLE IN MODAL ==========
    this.logTable = this.progressModal.locator('table').first();
    this.logTableRows = this.logTable.locator('tbody tr, [role="row"]');
    this.searchInput = this.progressModal.locator('input[placeholder*="search" i]').first();
  }

  // ========== HELPER METHODS ==========

  /**
   * Get the "Requested By" column text for a specific row
   * @param {number} rowIndex - Index of the row
   * @returns {Locator}
   */
  requestedByColumn(rowIndex) {
    return this.tableRows.nth(rowIndex).locator('td, [role="cell"]').nth(2); // Typically 3rd column
  }

  /**
   * Get the "Status" column text for a specific row
   * @param {number} rowIndex - Index of the row
   * @returns {Locator}
   */
  statusColumn(rowIndex) {
    // Get the 4th column and extract text that is not a button
    return this.tableRows.nth(rowIndex).locator('td:nth-child(4), [role="cell"]:nth-child(4)');
  }

  /**
   * Get the download button for a specific row
   * @param {number} rowIndex - Index of the row
   * @returns {Locator}
   */
  downloadButton(rowIndex) {
    return this.tableRows.nth(rowIndex).locator('button').filter({ hasText: /download|export/i }).first();
  }

  /**
   * Get the delete button for a specific row
   * @param {number} rowIndex - Index of the row
   * @returns {Locator}
   */
  deleteButton(rowIndex) {
    return this.tableRows.nth(rowIndex).locator('button').filter({ hasText: /delete|remove|trash/i }).first();
  }

  /**
   * Get a cell from the log table
   * @param {number} rowIndex - Row index
   * @param {number} colIndex - Column index
   * @returns {Locator}
   */
  getLogTableCell(rowIndex, colIndex) {
    return this.logTableRows.nth(rowIndex).locator('td, [role="cell"]').nth(colIndex);
  }

  /**
   * Get log time column
   * @param {number} rowIndex - Row index
   * @returns {Locator}
   */
  logTimeColumn(rowIndex) {
    return this.logTableRows.nth(rowIndex).locator('td, [role="cell"]').nth(0);
  }

  /**
   * Get log level column
   * @param {number} rowIndex - Row index
   * @returns {Locator}
   */
  logLevelColumn(rowIndex) {
    return this.logTableRows.nth(rowIndex).locator('td, [role="cell"]').nth(1);
  }

  /**
   * Get log message column
   * @param {number} rowIndex - Row index
   * @returns {Locator}
   */
  logMessageColumn(rowIndex) {
    return this.logTableRows.nth(rowIndex).locator('td, [role="cell"]').nth(2);
  }
}

module.exports = IOReportsLocators;
