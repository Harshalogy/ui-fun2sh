class IOCasesLocators {
  constructor(page) {
    this.page = page;

    this.newCaseBtn = page.locator("button.io-newcase-btn").first();
    this.caseListTitle = page.locator("div.io-case-list-title").first();

    this.controls = page.locator(".io-case-list-controls").first();
    this.columnsSelect = page.locator("select.io-columns-select").first();
    this.searchInput = page.locator("input.io-search-input").first();

    this.table = page.locator("table.io-table.io-table-custom").first();
    this.tableHeaders = this.table.locator("thead th");
    this.tableRows = this.table.locator("tbody tr");
    this.caseLinks = this.table.locator("tbody tr td:nth-child(2) a.io-case-link");

    this.paginationWrapper = page.locator(".io-pagination-wrapper").first();
    this.prevBtn = page.locator(".io-pagination-wrapper button:has-text('Prev'), .io-pagination-wrapper button:has-text('Previous')").first();
    this.nextBtn = page.locator(".io-pagination-wrapper button:has-text('Next')").first();
    this.rangeLabel = page.locator(".io-pagination-wrapper .io-page-range, .io-pagination-wrapper .range-label").first();
    this.recordsPerPageSelect = page.locator(".io-pagination-wrapper select, select.io-page-size, select.io-records-select").first();

    this.ioMenuActive = page.locator("a.nav-item:has-text('IO Dashboard').active, .nav-item.active:has-text('IO Dashboard')").first();

    this.newCaseModal = page.locator("mat-dialog-container, .cdk-overlay-container mat-dialog-container").first();
    this.modalNextBtn = page.getByRole("button", { name: /^next$/i }).first();
    this.modalCancelBtn = page.getByRole("button", { name: /^cancel$/i }).first();
    this.modalCloseIcon = page.locator("mat-dialog-container button[aria-label*='close' i], mat-dialog-container button[aria-label*='Close' i]").first();
    this.modalCaseNameInput = page.getByLabel(/case name/i).first();

    this.stepLabel = (text) => page.locator(".wizard__step-label", { hasText: text }).first();
  }
}

module.exports = IOCasesLocators;
