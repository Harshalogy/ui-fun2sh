// locators/caseDashboardLocators.js
exports.CaseDashboardLocators = class CaseDashboardLocators {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Main container
        this.caseDashboardSection = page.locator('section.case-dashboard');

        // Header elements
        this.breadcrumb = page.locator('nav.case-dashboard__breadcrumb');
        this.breadcrumbLink = page.locator('a.case-dashboard__breadcrumb-link');
        this.breadcrumbSeparator = page.locator('.case-dashboard__breadcrumb-separator');
        this.breadcrumbCurrent = page.locator('.case-dashboard__breadcrumb-current');
        this.pageTitle = page.locator('h1');
        this.caseMeta = page.locator('.case-dashboard__meta');

        // Action buttons - target only the label span
        this.actionButtons = page.locator('.case-dashboard__actions');
        this.linkViewButton = page.locator('button:has-text("Link View")');
        this.linkViewButtonLabel = page.locator('button:has-text("Link View") .mdc-button__label');
        this.editCaseButton = page.locator('button:has-text("Edit Case")');
        this.editCaseButtonLabel = page.locator('button:has-text("Edit Case") .mdc-button__label');
        this.uploadedFileStackButton = page.locator('button:has-text("Uploaded File Stack")');
        this.uploadedFileStackButtonLabel = page.locator('button:has-text("Uploaded File Stack") .mdc-button__label');

        // Main content sections
        this.overviewSection = page.locator('app-case-dashboard-overview');
        this.progressBar = page.locator('app-case-progress-bar');

        // Dashboard cards (Case Overview section)
        this.caseOverviewCards = page.locator('.case-overview-card');
        this.acknowledgeNosCard = page.locator('.case-overview-card:has-text("Acknowledge Nos.")');
        this.victimAcCards = page.locator('.case-overview-card:has-text("Victim A/Cs")');
        this.suspectAcCards = page.locator('.case-overview-card:has-text("Suspect A/Cs")');
        this.banksCard = page.locator('.case-overview-card:has-text("Banks")');

        // Detail panels (existing)
        this.detailPanels = page.locator('.detail-panel');
        this.fundStatusPanel = page.locator('.detail-panel:has-text("Fund Status")');
        this.pendingAmountsPanel = page.locator('.detail-panel:has-text("Pending Amounts")');
        this.exitModesPanel = page.locator('.detail-panel:has-text("Exit Modes")');

        // ============ NEW LOCATORS FOR DETAIL PANELS ============

        // Case Overview Section - FIXED LOCATORS
        this.caseOverviewHeader = page.locator('h2:has-text("Case Overview")'); // Changed from ID to text
        this.caseOverviewSubheading = page.locator('.case-overview__subheading');
        this.totTransactionsCard = page.locator('.case-overview-card:has-text("Tot. Transactions")');
        this.totDisputedAmtCard = page.locator('.case-overview-card:has-text("Tot. Disputed Amt.")');
        this.commonAcCards = page.locator('.case-overview-card:has-text("Common A/Cs")');
        this.uploadedFilesCard = page.locator('.case-overview-card:has-text("Uploaded Files")');

        // 1. Fund Status Panel (detailed)
        this.fundStatusHeader = page.locator('.detail-panel__header:has-text("Fund Status")');
        this.fundStatusTable = page.locator('.fund-status table');
        this.fundStatusRows = page.locator('.fund-status tbody tr');
        this.fundStatusTableHeaders = page.locator('.fund-status thead th');
        this.fundStatusPaginator = page.locator('.fund-status mat-paginator');

        // 2. Pending Amounts Panel (detailed) - UPDATED SELECTORS
        this.pendingAmountsHeader = page.locator('.detail-panel__header:has-text("Pending Amounts")');
        this.pendingAmountsSearch = page.locator('.pending-actions__search input');
        this.pendingAmountsMainTable = page.locator('.pending-table .table-wrapper table'); // Main table only
        this.pendingAmountsFooterTable = page.locator('.pending-table .table-footer table'); // Footer table only
        this.pendingAmountsTableHeaders = page.locator('.pending-table thead th');
        this.pendingAmountsFooter = page.locator('.pending-table .table-footer');
        this.pendingAmountsTotals = page.locator('.pending-totals-summary');
        this.pendingAmountsPaginator = page.locator('.pending-table mat-paginator');

        // 3. End Utilization Mode Panel
        this.endUtilizationPanel = page.locator('.detail-panel:has-text("End Utilization Mode")');
        this.endUtilizationHeader = page.locator('.detail-panel__header:has-text("End Utilization Mode")');
        this.endUtilizationChart = page.locator('.combo-chart svg');
        this.endUtilizationChartTitle = page.locator('#utilizationTitle');
        this.endUtilizationLegend = page.locator('.chart-legend');
        this.endUtilizationViewDetailsBtn = page.locator('.detail-panel:has-text("End Utilization Mode") button:has-text("View Details")');

        // 4. Exit A/C Panel
        this.exitAcPanel = page.locator('.detail-panel:has-text("Exit A/c: Exit Amount and Number of Transactions")');
        this.exitAcHeader = page.locator('.detail-panel__header:has-text("Exit A/c: Exit Amount and Number of Transactions")');
        this.exitAcNoData = page.locator('.detail-panel:has-text("Exit A/c: Exit Amount and Number of Transactions") .no-data:has-text("No exit account data available")');
        this.exitAcViewDetailsBtn = page.locator('.detail-panel:has-text("Exit A/c: Exit Amount and Number of Transactions") button:has-text("View Details")');

        // Loading indicator
        this.loadingSpinner = page.locator('.spinner, .loading');

        // ============ NEW LOCATORS FOR CARD GRID VALIDATION ============

        // Case Overview Card Grid specific locators
        this.caseOverviewGrid = page.locator('.case-overview__grid');
        this.caseOverviewCardWrappers = page.locator('.case-overview-card__wrapper');

        // Card element selectors (CSS classes)
        this.cardTitle = '.case-overview-card__title';
        this.cardValue = '.case-overview-card__value';
        this.cardIcon = '.case-overview-card__icon mat-icon';
        this.cardSecondary = '.case-overview-card__secondary';
        this.cardArrow = '.case-overview-card__arrow';

        // Expected card configuration (static data)
        this.expectedCardConfig = [
            {
                title: 'Acknowledge Nos.',
                icon: 'numbers',
                colorClass: 'case-overview-card--azure',
                hasSecondary: false
            },
            {
                title: 'Victim A/Cs',
                icon: 'person',
                colorClass: 'case-overview-card--amber',
                hasSecondary: false
            },
            {
                title: 'Suspect A/Cs',
                icon: 'masks',
                colorClass: 'case-overview-card--crimson',
                hasSecondary: false
            },
            {
                title: 'Banks',
                icon: 'account_balance',
                colorClass: 'case-overview-card--emerald',
                hasSecondary: false
            },
            {
                title: 'Tot. Transactions',
                icon: 'monitoring',
                colorClass: 'case-overview-card--cobalt',
                hasSecondary: true,
                secondaryLabel: 'Amount:'
            },
            {
                title: 'Tot. Disputed Amt.',
                icon: 'error_outline',
                colorClass: 'case-overview-card--saffron',
                hasSecondary: true,
                secondaryLabel: 'Count:'
            },
            {
                title: 'Common A/Cs',
                icon: 'hub',
                colorClass: 'case-overview-card--magenta',
                hasSecondary: true,
                secondaryLabel: '(linked with 2+ Ack. no.)'
            },
            {
                title: 'Uploaded Files',
                icon: 'cloud_upload',
                colorClass: 'case-overview-card--midnight',
                hasSecondary: false
            }
        ];

        // Color classes for validation
        this.colorClasses = ['azure', 'amber', 'crimson', 'emerald', 'cobalt', 'saffron', 'magenta', 'midnight'];

        // ============ NEW LOCATORS FOR EXIT MODES PANEL ============

        // Exit Modes panel detailed locators
        this.exitModesHeader = page.locator('.detail-panel__header:has-text("Exit Modes")');
        this.exitModesTable = page.locator('.exit-modes-table table');
        this.exitModesRows = page.locator('.exit-modes-table tbody tr');
        this.exitModesTableHeaders = page.locator('.exit-modes-table thead th');
        this.exitModesViewDetailsBtn = page.locator('.detail-panel:has-text("Exit Modes") button:has-text("View Details")');
        // this.exitModesPaginator = page.locator('.exit-modes-table mat-paginator');
        // this.exitModesPaginatorInfo = page.locator('.mat-mdc-paginator-range-label');
        // this.exitModesPageSizeSelect = page.locator('.exit-modes-table mat-select');
        // this.exitModesSelectTrigger = page.locator('.exit-modes-table .mat-mdc-select-trigger');

        // Exit Modes panel root
        this.exitModesPanel = page.locator('.detail-panel:has-text("Exit Modes")');

        // SCOPED pagination locators
        this.exitModesPaginator = this.exitModesPanel.locator('mat-paginator');
        this.exitModesPaginatorInfo = this.exitModesPanel.locator('.mat-mdc-paginator-range-label');
        this.exitModesPageSizeSelect = this.exitModesPanel.locator('mat-select');
        this.exitModesSelectTrigger = this.exitModesPanel.locator('.mat-mdc-select-trigger');
        this.exitModesSelectOptionsPanel = page.locator('.mat-mdc-select-panel'); // global is fine

        // Priority Exit Modes Section (from snapshot)
        this.priorityExitModes = page.locator('article:has(h2:has-text("Priority exit modes"))');
        this.exitModeCards = page.locator('article > generic > generic:has(> h3)');
        this.exitModeCardH3 = page.locator('article > generic > generic > h3');

        // Modal/Dialog selectors
        this.modalDialog = page.locator('[role="dialog"], .mat-mdc-dialog-container, .modal');
        this.modalTitle = page.locator('h1, h2, h3, .dialog-title, .modal-title');
        this.modalCloseButton = page.locator('button[aria-label="Close"], .close-dialog, .mat-mdc-dialog-close');

        // Detailed views
        this.detailedView = page.locator('app-exit-modes-detail-page');
        this.expandedContent = page.locator('.expanded-row, .row-details, [class*="expand"]');

        // Feeder accounts elements
        this.feederAccounts = page.locator('.feeder-account, [class*="feeder"], .account-row');
        this.feederTables = page.locator('table:has(:text("Feeder")), table:has(:text("Account"))');
        this.feederLists = page.locator('.account-list, .feeder-list, .list-item');
        this.feederElements = page.locator('.feeder-info, .account-details, [class*="account"]');
        this.feederCount = page.locator('.feeder-count, .account-count, .count, .metric__value');

        // Panel minimize/maximize controls
        this.minimizeButton = page.locator('button[aria-label="Minimize panel"]');
        this.maximizeButton = page.locator('button[aria-label*="Maximize Exit Modes view"]');
        this.restoreButton = page.locator('button[aria-label*="Expand"], button[aria-label*="Maximize"]');
        this.panelBody = page.locator('.detail-panel__body');

        // Select dropdown elements
        this.selectOptionsPanel = page.locator('.mat-mdc-select-panel');
        this.selectOptions = page.locator('mat-option');

        // Error messages
        this.errorMessages = page.locator('.error-message, .alert-error, .mat-error, [role="alert"]');

        // Add to the constructor:
        this.exitModesMinimizeButton = this.exitModesPanel.locator('button:has(mat-icon:has-text("remove"))');
        this.exitModesRestoreButton = this.exitModesPanel.locator('button:has(mat-icon:has-text("open_in_full"))');
        this.exitModesMaximizeButton = this.exitModesPanel.locator('button[aria-label*="Maximize Exit Modes view"]');
        this.exitModesModalCloseButton = page.getByRole('button', { name: /close/i });

        // TOP BANK BRANCHES PANEL
        this.topBranchesPanel = page.locator('article.detail-panel:has(h3:has-text("Top Bank Branches"))');
        this.topBranchesHeader = this.topBranchesPanel.locator('h3');
        this.topBranchesSelect = this.topBranchesPanel.locator('mat-select');
        this.topBranchesBars = this.topBranchesPanel.locator('rect.chart-bar');
        this.topBranchesLabels = this.topBranchesPanel.locator('text.branch-label');
        this.topBranchesLegend = this.topBranchesPanel.locator('.branch-legend .legend-item');
        this.topBranchesInfoText = this.topBranchesPanel.locator('.chart-info small');
        this.topBranchesYAxisLeftTicks = this.topBranchesPanel.locator('.tick-label--left');
        // this.topBranchesViewDetailsBtn = page.locator('article.detail-panel:has(h3:has-text("Top Bank Branches")) button:has-text("View Details")');
        this.topBranchesViewDetailsBtn = page.locator('.detail-panel:has-text("Top Bank Branches") button:has-text("View Details")');



        // TOP SUSPECT ACCOUNT NAMES
        // Dashboard panel
        this.topSuspectsPanel = page.locator('article:has(h3:text("Top Suspect Account Names"))');

        // Pagination
        this.topSuspectsPaginator = this.topSuspectsPanel.locator('mat-paginator');
        this.topSuspectsPageSize = this.topSuspectsPaginator.locator('.mat-mdc-select-value-text');

        this.topSuspectsNextBtn = this.topSuspectsPaginator.locator('.mat-mdc-paginator-navigation-next');
        this.topSuspectsPrevBtn = this.topSuspectsPaginator.locator('.mat-mdc-paginator-navigation-previous');
        this.topSuspectsFirstBtn = this.topSuspectsPaginator.locator('.mat-mdc-paginator-navigation-first');
        this.topSuspectsLastBtn = this.topSuspectsPaginator.locator('.mat-mdc-paginator-navigation-last');

        // View details
        this.topSuspectsViewDetailsBtn = this.topSuspectsPanel.locator('button:has-text("View Details")');

        //TOP SUSPECT DETAIL PAGE

        // Layout
        this.topSuspectsLayout = page.locator('.layout__content');
        this.topSuspectsToolbar = page.locator('mat-toolbar[role="banner"]');

        // Page title
        this.topSuspectsTitleheading = page.getByRole('heading', {
            name: 'Top Suspect Account Names',
            level: 1
        });

        // Sections
        this.topSuspectsSection = page.locator('section.top-suspects');
        this.topSuspectsBreadcrumb = this.topSuspectsSection.locator('nav[aria-label="Breadcrumb"]');

        this.topSuspectsSummary = page.locator('section[aria-label="Key suspect insights"]');
        this.topSuspectsSpotlight = page.locator('section[aria-label="Suspect spotlight"]');
        this.topSuspectsFilters = page.locator('section[aria-label="Filters and tools"]');
        this.topSuspectsTableSection = page.locator('section[aria-label="Suspect table"]');

        // Table
        this.topSuspectsTable = this.topSuspectsTableSection.locator('table');
        this.topSuspectsTableRows = this.topSuspectsTableSection.locator('tbody tr');
        this.topSuspectsNameCell = this.topSuspectsTableSection.locator('.top-suspects__name');

        // Search
        this.topSuspectsSearchInput = page.locator('input[placeholder="Search name, account, bank or city"]');

        // Risk band filter
        this.topSuspectsRiskBandSelect = this.topSuspectsFilters.locator('mat-form-field:has(mat-label:text("Risk band")) mat-select');
        this.topSuspectsRiskPills = this.topSuspectsTableSection.locator('.risk-pill');

         //TOP SUSPECT LIST
        this.topSuspectsListPanel = page.locator('article:has(h3:text("Top Suspect Account Names"))');
        this.topSuspectRows = this.topSuspectsListPanel.locator('.suspect-list__item');

        // Row-level selectors (used as strings in page object)
        this.topSuspectRank = '.suspect-list__rank';
        this.topSuspectName = '.suspect-list__name';
        this.topSuspectAmount = '.suspect-list__amount';
        this.topSuspectBankPill = '.suspect-pill';
        this.topSuspectTags = '.suspect-tag';
        this.topSuspectTxCount = '.suspect-list__count';
        this.topSuspectNet = '.suspect-list__net';
        this.topSuspectShare = '.suspect-list__share';
        this.topSuspectMeter = '.suspect-list__meter-fill';


         // TOP SUSPECT PANEL (TC24)

        this.topSuspectsPanel = page.locator('article:has(h3:text("Top Suspect Account Names"))');
        // Header & title
        this.topSuspectsHeader = this.topSuspectsPanel.locator('.detail-panel__header');
        this.topSuspectsTitle = this.topSuspectsHeader.locator('h3');
        // Header controls
        this.topSuspectsMinimizeBtn = this.topSuspectsPanel.locator('button[aria-label="Minimize panel"]');
        this.topSuspectsMaximizeBtn = this.topSuspectsPanel.locator('button[aria-label="Maximize Top Suspect Account Names view"]');
        this.topSuspectsViewDetailsBtn = this.topSuspectsPanel.locator('button:has-text("View Details")');
        // Panel body
        this.topSuspectsPanelBody = this.topSuspectsPanel.locator('.detail-panel__body');
        // Maximize modal
        this.topSuspectsMaximizeModal = page.locator('[role="dialog"]:has-text("Top Suspect Account Names")');
        this.topSuspectsModalTitle = this.topSuspectsMaximizeModal.locator('h2');


    }
}