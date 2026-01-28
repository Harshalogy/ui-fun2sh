// locators/IODashboardLocators.js
class IODashboardLocators {
  constructor(page) {
    this.page = page;

    // Root / page identification
    this.ioRoot = page.locator("app-io-dashboard").first();

    // Sidebar / navigation
    this.sidebar = page.locator("app-sidebar.layout__sidebar");
    this.sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]').first();
    this.ioMenu = page.locator('a.nav-item:has-text("IO Dashboard")').first();
    this.activeNavItem = this.sidebar.locator(".nav-item.active").first();

    // Header / top tools (same as investigator flow)
    this.notificationsBtn = page.locator('app-header button[aria-label*="unread notifications"]').first();
    this.notificationBadge = this.notificationsBtn.locator(".toolbar__badge").first();

    this.userMenuTrigger = page.locator("app-header .user-menu__trigger").first();
    this.userName = this.userMenuTrigger.locator(".user-menu__name").first();

    // Breadcrumb (layout-level, same as investigator)
    this.breadcrumbActive = page.locator("app-breadcrumb .breadcrumb__item--active").first();
    this.breadcrumbBack = page.locator("app-breadcrumb .breadcrumb__back").first();
    this.backButtonText = this.breadcrumbBack.locator("span.mdc-button__label").first();
    this.backButtonIcon = this.breadcrumbBack.locator("mat-icon").first();

    // IO Topbar elements
    this.ioTitle = page.locator("app-io-dashboard h2.io-title").first(); // "Cases"
    this.ioBreadcrumbPill = page.locator("app-io-dashboard .io-breadcrumb-pill").first();
    this.ioViewBy = page.locator("app-io-dashboard .io-viewby").first();
    this.ioViewByRadios = page.locator('app-io-dashboard input[type="radio"][name="viewBy"]');

    // Summary cards (Active / Closed / Total)
    this.summaryCards = page.locator("app-io-dashboard .io-summary-cards .io-summary-card");
    this.summaryCardLabel = (idx) => this.summaryCards.nth(idx).locator(".io-summary-label");
    this.summaryCardValue = (idx) => this.summaryCards.nth(idx).locator(".io-summary-value");

    // Subbar actions
    this.subbar = page.locator("app-io-dashboard .io-subbar").first();
    this.newCaseBtn = page.locator("app-io-dashboard button.io-newcase-btn").first();

    // Case List section
    this.caseListSection = page.locator("app-io-dashboard .io-case-list-section").first();
    this.caseListTitle = page.locator("app-io-dashboard .io-case-list-title").first(); // "Case List"

    // Controls inside app-cases
    this.columnsSelect = page.locator("app-io-dashboard app-cases select.io-columns-select").first();
    this.searchInput = page.locator("app-io-dashboard app-cases input.io-search-input").first(); // placeholder "Search all columns"
    this.clearBtn = page.locator("app-io-dashboard app-cases button.io-export-btn:has-text('Clear')").first();
    this.exportCsvBtn = page.locator("app-io-dashboard app-cases button.io-export-btn:has-text('Export CSV')").first();

    // Table
    this.table = page.locator("app-io-dashboard app-cases table.io-table").first();
    this.tableHeaderRows = page.locator("app-io-dashboard app-cases thead tr.io-table-header-row");
    this.tableBodyRows = page.locator("app-io-dashboard app-cases tbody tr");

    // Pagination
    this.paginationWrapper = page.locator("app-io-dashboard app-cases .io-pagination-wrapper").first();
    this.recordsSelect = page.locator("app-io-dashboard app-cases .io-pagination-records select.io-pagination-select").first();
    this.paginationBtns = page.locator("app-io-dashboard app-cases .io-pagination-btns .io-pagination-btn");
    this.prevBtn = page.locator("app-io-dashboard app-cases .io-pagination-btn:has-text('Previous')").first();
    this.nextBtn = page.locator("app-io-dashboard app-cases .io-pagination-btn:has-text('Next')").first();

    // Generic UI controls (for inventory test)
    this.allButtons = page.locator("button");
    this.allSelects = page.locator("select, mat-select");
    this.allInputs = page.locator("input");
  }
}

module.exports = IODashboardLocators;
