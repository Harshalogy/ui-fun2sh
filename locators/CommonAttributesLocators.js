const BASE_URL = "http://148.113.0.204:23810";

const ROLE_ROUTE = {
  IO: `${BASE_URL}/dashboard/io`,
  SIO: `${BASE_URL}/dashboard/sio`,
};

class TC10CommonAttributesLocators {
  constructor(page) {
    this.page = page;

    this.commonSection = page.locator(".common-attributes-section-container").first();

    this.viewByText = page.getByText("View by:").first();
    this.disputedRadio = page.getByLabel("Disputed Amount").first();
    this.transactionRadio = page.getByLabel("Transaction Amount").first();

    this.sectionHeader = this.commonSection.locator(".common-attributes-header").first();
    this.sectionFilters = this.commonSection.locator(".common-attributes-filters").first();

    this.columnSelect = this.sectionFilters.locator("select").first();
    this.search = this.sectionFilters.locator('input[placeholder="Search all columns"]').first();
    this.caseSelect = this.sectionFilters.locator("mat-form-field").first();
    this.attributeTypeSelect = this.sectionFilters.locator("select").last();

    this.clearBtn = this.sectionFilters.locator("button", { hasText: /^Clear$/ }).first();
    this.exportBtn = this.commonSection.locator("button", { hasText: /Export CSV/i }).first();

    this.table = this.commonSection.locator("table").first();
    this.headerRows = this.table.locator("thead tr");
    this.rows = this.table.locator("tbody tr");

    this.emptyState = this.commonSection.locator("text=/No records|No data|No results|No data found/i");

    this.paginationWrapper = this.commonSection.locator(".io-pagination-wrapper").first();
    this.recordsPerPage = this.paginationWrapper.locator("select").first();
    this.prevBtn = this.paginationWrapper.locator("button", { hasText: /^Previous$/ }).first();
    this.nextBtn = this.paginationWrapper.locator("button", { hasText: /^Next$/ }).first();
    this.activePage = this.paginationWrapper.locator("button.active").first();

    this.fundSection = page.locator(".io-case-list-section").first();
    this.fundTable = this.fundSection.locator("table").first();
    this.fundHeaderRows = this.fundTable.locator("thead tr");
    this.fundRows = this.fundTable.locator("tbody tr");

    this.fundColumnSelect = this.fundSection.locator("select").first();
    this.fundSearch = this.fundSection.locator('input[placeholder="Search all columns"]').first();
    this.fundClear = this.fundSection.locator("button", { hasText: /^Clear$/ }).first();
    this.fundExport = this.fundSection.locator("button", { hasText: /Export CSV/i }).first();

    this.fundPaginationWrapper = this.fundSection.locator(".io-pagination-wrapper").first();
    this.fundRecordsPerPage = this.fundPaginationWrapper.locator("select").first();
    this.fundPrev = this.fundPaginationWrapper.locator("button", { hasText: /^Previous$/ }).first();
    this.fundNext = this.fundPaginationWrapper.locator("button", { hasText: /^Next$/ }).first();
  }
}

module.exports = {
  BASE_URL,
  ROLE_ROUTE,
  TC10CommonAttributesLocators,
};
