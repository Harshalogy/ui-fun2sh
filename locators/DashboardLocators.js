// locators/DashboardLocators.js
class DashboardLocators {
  constructor(page) {
    this.page = page;

    // ========== DASHBOARD PAGE ELEMENT LOCATORS ==========

    // Header elements 
    this.titleBadge = page.locator('app-investigator-dashboard-page .dashboard-badge').first();
    this.pageTitle = page.locator('app-investigator-dashboard-page header .dashboard-badge').first();

    // Breadcrumb elements
    this.breadcrumbActive = page.locator('app-breadcrumb .breadcrumb__item--active').first();
    this.breadcrumbBack = page.locator('app-breadcrumb .breadcrumb__back').first();
    this.backButtonText = this.breadcrumbBack.locator("span.mdc-button__label");
    this.backButtonIcon = this.breadcrumbBack.locator("mat-icon");

    // Notification elements
    this.notificationsBtn = page.locator('app-header button[aria-label*="unread notifications"]').first();
    this.notificationBadge = this.notificationsBtn.locator('.toolbar__badge').first();

    // User menu elements
    this.userMenuTrigger = page.locator('app-header .user-menu__trigger').first();
    this.userName = this.userMenuTrigger.locator('.user-menu__name').first();

    // Sidebar elements
    this.sidebar = page.locator('app-sidebar.layout__sidebar');
    this.dashboardNav = this.sidebar.locator('.nav-item.active').first();
    this.sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]').first();
    this.investigatorMenu = page.locator('a.nav-item:has-text("Investigator Dashboard")');

    // Balance Pending section
    this.balanceHeading = page.locator(
      'app-investigator-dashboard-page .section-heading--inline h2:has-text("Balance Pending")'
    ).first();
    this.balanceCaption = page.locator('app-investigator-dashboard-page .section-caption').first();
    this.bpCardLabels = page.locator('app-investigator-dashboard-page .card-grid--compact .card-label');
    this.bpCardValues = page.locator('app-investigator-dashboard-page .card-grid--compact .card-value');

    // UI Controls
    this.allButtons = page.locator("button");
    this.allSelects = page.locator("mat-select, select");
    this.allInputs = page.locator("input");

    // Visualization popup
    this.visualizationDialog = page.locator("mat-dialog-container");
    this.visualizationCloseBtn = this.visualizationDialog.locator('button[aria-label="Close visualization"] mat-icon');

    // Grid selectors
    this.mainCardGrid = page.locator('.card-grid:not(.card-grid--compact)').first();
    this.compactCardGrid = page.locator('.card-grid--compact').first();
    this.gridCards = this.mainCardGrid.locator('.highlight-card');

    // Grid container
    this.cardGrid = page.locator('.card-grid');

    // Helper locators
    this.cardLabel = (index) => this.gridCards.nth(index).locator('.card-label');
    this.cardValue = (index) => this.gridCards.nth(index).locator('.card-value');
    this.cardIcon = (index) => this.gridCards.nth(index).locator('.card-icon mat-icon');
    this.bpCardLabel = (index) => this.bpCardLabels.nth(index);
    this.bpCardValue = (index) => this.bpCardValues.nth(index);

    // ========== CASE PAGE ELEMENT LOCATORS ==========

    // NEW CASE BUTTON
    // this.newCaseBtn = page.locator('app-investigator-dashboard-page header button:has-text("New Case")').first();
    this.newCaseBtn = page.locator('button:has-text("New Case")').first();
    this.newCaseIcon = this.newCaseBtn.locator('mat-icon').first();

    // CASE LIST WIDGET HEADER
    this.listHeader = page.locator('article[data-area="cases"] h2:has-text("List of Cases"), app-case-list-widget .viz-card__header h2').first();
    this.captionLocator = page.locator('p.viz-card__caption').first();

    // CASE LIST – SEARCH
    this.searchInput = page.locator('input[placeholder="Search cases or attributes"]').first();

    // CASE LIST – TABLE LOCATORS
    this.caseTableRows = page.locator("app-case-list-widget .mdc-data-table__content tr");
    this.totalCountLocator = page.locator('app-case-list-widget .total-count, app-case-list-widget .table-footer .total-count').first();

    // PAGINATOR COMPONENTS
    this.paginators = page.locator("mat-paginator");
    this.statusSelects = page.locator('mat-select[formcontrolname="status"]');

    // FULLSCREEN WIDGET
    this.fullscreenOpenBtn = page.locator('button mat-icon:has-text("fullscreen")').first();
    this.fullscreenCloseBtn = page.locator('button[aria-label="Close visualization"]').first();
    this.fullscreenContainer = page.locator('.viz-dialog');

    // MENU
    this.caseMenu = page.locator('a.nav-item:has-text("Case Dashboard")');
    this.caseMenuContainer = page.locator('.nav-item-container:has-text("Case Dashboard")');

    // NEW CASE MODAL
    this.newCaseModalTitle = page.getByRole('heading', { name: /new case/i });
    this.nextBtn = page.getByRole('button', { name: /^next$/i });
    this.cancelBtn = page.getByRole('button', { name: /^cancel$/i });

    // NEW CASE FORM FIELDS
    this.caseNameInput = page.getByLabel('Case Name');
    this.complaintInput = page.getByLabel('Complaint No');
    this.unitInput = page.getByLabel('Unit');
    this.investigatorInput = page.getByLabel('Investigator Officer');
    this.descriptionInput = page.getByLabel('Description');

    // VALIDATION ERRORS
    this.caseNameSpaceError = page.locator('mat-error', { hasText: /Case name cannot contain spaces/i });
    this.caseNameRequiredError = page.locator('mat-error', { hasText: /Case name is required\./i });

    // HELPER LOCATORS
    this.basicDetailsText = page.getByText("Basic Details").first();

    // ---------- COMMON ----------
    this.widgetMoTimeline = page.locator('article.viz-card--mo');
    this.widgetFund = page.locator('article[data-area="fund"]');

    // ---------- MO TIMELINE ----------
    this.moTimelineHeader = page.getByText("MO Timeline", { exact: false }).first();
    this.moTimelineChartContainer = page.locator('app-mo-timeline-widget .chart-container');
    this.moTimelineCard = page.locator('article.viz-card--mo');
    this.moTimelineMaximizeBtn = this.moTimelineCard.getByRole('button', { name: /maximize/i });
    this.moTimelineSvg = page.locator('article.viz-card--mo .chart-container svg');

    // X and Y axes
    this.moTimelineXTicks = page.locator('article.viz-card--mo .chart-container .x.axis .tick text');
    this.moTimelineYTicks = page.locator('article.viz-card--mo .chart-container .y.axis .tick text');

    // Bars
    this.moTimelineVisibleBars = this.moTimelineChartContainer.locator('path.bar:not(.hidden)');
    this.moTimelineHiddenBars = this.moTimelineChartContainer.locator('path.bar.hidden');
    this.moTimelineAllBars = this.moTimelineChartContainer.locator('path.bar');

    // Chart structure
    this.moTimelineSeriesGroups = page.locator('app-mo-timeline-widget g[ngx-charts-series-vertical]');
    this.moTimelineXAxisDates = page.locator('app-mo-timeline-widget .x.axis g.tick text');

    // Legend
    this.moTimelineLegendItems = page.locator('app-mo-timeline-widget .legend-label-text');

    // ---------- EXIT MODE PIE ----------
    this.exitModeHeader = page.getByText("Exit Mode Insights", { exact: false });
    this.exitModeSortBy = page.locator("mat-select[aria-labelledby='mat-mdc-form-field-label-3']");
    this.exitModePieChart = page.locator('ngx-charts-pie-chart').first();

    // Pie components
    this.pieSlices = page.locator('g[ngx-charts-pie-arc] g.arc-group path.arc');
    this.pieTooltip = page.locator('.ngx-charts-tooltip-content');
    this.pieSvg = page.locator('ngx-charts-pie-chart svg.ngx-charts');
    this.pieArcs = this.pieSvg.locator('path.arc');
    this.pieLabels = this.pieSvg.locator('text.pie-label');

    // Exit Mode Legend
    this.exitModeLegendItems = this.widgetFund.locator('ngx-charts-legend ul.legend-labels > li.legend-label');

    // Modal locators
    this.modalContainer = page.locator('mat-dialog-container');
    this.modalCloseBtn = page.locator('mat-dialog-container button[aria-label="Close visualization"]');
    this.modalVizDialog = page.locator('.viz-dialog__body');
    this.modalMoTimelineWidget = page.locator('mat-dialog-container app-mo-timeline-widget');
    this.modalPieChart = page.locator('mat-dialog-container ngx-charts-pie-chart');

    // Loader
    this.loaderOverlay = page.locator('.loader-overlay');

    // ========== URGENT FREEZES LOCATORS ==========

    // Urgent Freezes widget header
    this.urgentFreezesHeader = page.locator('article[data-area="urgentFreezes"] h2:has-text("Urgent Freezes")').first();

    // Search input
    this.urgentFreezesSearchInput = page.locator('input[placeholder="Accounts, banks, amounts"]').first();

    // Table components
    this.urgentFreezesTable = page.locator("app-urgent-freezes-panel .panel__table table").first();
    this.urgentFreezesRows = this.urgentFreezesTable.locator("tbody tr");

    // Column headers (can be used dynamically)
    this.urgentFreezesColumnHeaders = page.locator("app-urgent-freezes-panel th.mat-mdc-header-cell");

    // Pagination
    this.urgentFreezesPaginators = page.locator("app-urgent-freezes-panel mat-paginator");

    // Loading indicator
    this.urgentFreezesLoadingIndicator = page.locator('app-urgent-freezes-panel .loading, app-urgent-freezes-panel .mat-progress-spinner');

    // Search suggestions (autocomplete)
    this.urgentFreezesSearchSuggestions = page.locator('.mat-autocomplete-panel .mat-option');

    // Pagination controls (index these for multiple paginators if needed)
    this.urgentFreezesPaginatorRange = (index = 0) => this.urgentFreezesPaginators.nth(index).locator(".mat-mdc-paginator-range-label").first();
    this.urgentFreezesNextBtn = (index = 0) => this.urgentFreezesPaginators.nth(index).locator("button.mat-mdc-paginator-navigation-next");
    this.urgentFreezesPrevBtn = (index = 0) => this.urgentFreezesPaginators.nth(index).locator("button.mat-mdc-paginator-navigation-previous");

    // Items per page dropdown
    this.urgentFreezesItemsPerPageSelect = page.locator('.mat-mdc-paginator-page-size-select mat-select');
    this.urgentFreezesItemsPerPageOptions = page.locator('.mat-mdc-select-panel .mat-mdc-option');
    this.urgentFreezesCurrentItemsPerPage = page.locator('.mat-mdc-select-value-text span');

    // Individual cell locators (if you need specific columns)
    this.urgentFreezesAccountColumn = page.locator("app-urgent-freezes-panel th.mat-mdc-header-cell:has-text('Account')").first();
    this.urgentFreezesBankColumn = page.locator("app-urgent-freezes-panel th.mat-mdc-header-cell:has-text('Bank')").first();
    this.urgentFreezesAmountColumn = page.locator("app-urgent-freezes-panel th.mat-mdc-header-cell:has-text('Amount')").first();

    // Helper methods for dynamic column headers
    this.getUrgentFreezesColumn = (textOrRegex) =>
      page.locator("app-urgent-freezes-panel th.mat-mdc-header-cell", { hasText: textOrRegex }).first();

    // Helper for specific table cells
    this.getUrgentFreezesCell = (rowIndex, columnIndex) =>
      this.urgentFreezesRows.nth(rowIndex).locator(`td:nth-child(${columnIndex})`);

  }
}

module.exports = DashboardLocators;