/**
 * ============================================================================
 * REPORTS TAB E2E CONFIGURATION & CONSTANTS
 * ============================================================================
 * 
 * This file defines all configuration constants used in the Reports Tab E2E
 * test suite. Modify these to customize test behavior.
 * 
 * Usage in spec:
 *   const { TIMEOUTS, TEST_USERS, TEST_CONFIG } = require('../config/reports-e2e.config.js');
 *   const timeout = TIMEOUTS.STATUS_POLL;
 */

// ============================================================================
// TEST TIMEOUTS (milliseconds)
// ============================================================================

const TIMEOUTS = {
  // Basic waits
  NAVIGATION: 10000,          // Page navigation (login, Reports tab)
  ELEMENT_VISIBLE: 5000,      // Wait for element to appear
  INTERACTION: 1000,          // Generic click/type wait

  // Report generation & polling
  REPORT_STATUS_POLL: 120000,  // Max 120s to wait for report completion
  POLL_INTERVAL: 2000,         // Check status every 2 seconds
  DOWNLOAD: 30000,             // Max 30s for file download

  // Modal & UI
  MODAL_OPEN: 1000,           // Modal animation
  FILTER_RESPONSE: 500,       // Client-side filter response
  TOAST_DISPLAY: 3000,        // Toast notification duration

  // Utility
  AFTER_ACTION: 500,          // General buffer after action
  AFTER_SELECTION: 300,       // After dropdown selection
};

// ============================================================================
// TEST USERS (SIO & IO)
// ============================================================================

const TEST_USERS = [
  {
    name: 'SIO',
    username: 'ncrptest3',
    password: 'Xalted@123',
    roleName: 'Senior Investigating Officer',
    shortCode: 'sio',
  },
  {
    name: 'IO',
    username: 'ncrp_demo',
    password: 'ncrp_demo',
    roleName: 'Investigating Officer',
    shortCode: 'io',
  },
];

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  // Base URL (can be overridden by environment variable)
  BASE_URL: process.env.BASE_URL || 'http://148.113.0.204:23810',
  
  // Login configuration
  LOGIN: {
    url: '/login',
    usernameSelector: 'input[name="username"]',
    passwordSelector: 'input[name="password"]',
    submitSelector: 'button[type="submit"]',
  },

  // Reports tab configuration
  REPORTS: {
    url: '/reports',
    navItemText: 'Reports',
    requiredFields: [
      'ACK Number(s)',
      'Actionable Report Top Limit',
      'Consolidated Report',
    ],
    requiredButtons: [
      'Submit Request',
      'View Progress',
    ],
  },

  // Report request table configuration
  TABLE: {
    sectionId: 'report-requests-section',
    headers: [
      'Requested By',
      'Request Date',
      'Status',
      'Actions',
    ],
    pollInterval: 2000,         // Check every 2s
    maxWait: 120000,            // Max 120s
  },

  // Report status polling configuration
  REPORT_STATUS: {
    initialDelay: 2000,         // Wait 2s after submit before first poll
    pollInterval: 2000,         // Poll every 2s
    maxAttempts: 60,            // 60 attempts × 2s = 120s max
    expectedStatuses: [
      'Processing',
      'Queued',
      'Completed',
      'Failed',
      'Error',
    ],
    successStatus: 'Completed',
    failureStatuses: [
      'Failed',
      'Error',
    ],
  },

  // File download configuration
  DOWNLOAD: {
    timeout: 30000,             // 30s max
    retries: 2,
    allowedFormats: [
      '.csv',
      '.tsv',
      '.xlsx',
      '.xls',
      '.pdf',
    ],
    minFileSize: 1,             // Minimum 1 byte
    validateContent: true,      // Validate file content
  },

  // CSV/TSV file validation
  CSV: {
    minRows: 2,                 // Header + at least 1 data row
    delimiter: ',',
  },

  // XLSX file validation
  XLSX: {
    minSheets: 1,
    minRows: 2,
  },

  // PDF file validation
  PDF: {
    headerSignature: '%PDF',    // PDF file header
    minLength: 100,             // Minimum file length
  },

  // Modal configuration
  MODAL: {
    animationDelay: 1000,
    closeButton: 'button[aria-label="Close"], button[mat-icon-button]',
  },

  // Filter/Search configuration
  FILTERS: {
    searchDebounce: 500,        // Client-side debounce
    maxSearchResults: 1000,
  },
};

// ============================================================================
// TEST DATA DEFAULTS
// ============================================================================

const TEST_DATA = {
  // Consolidated report setting
  CONSOLIDATED_DEFAULT: true,    // Default checkbox state

  // Report submit defaults
  USE_FIRST_ACK_OPTION: true,    // Always use first ACK option
  USE_FIRST_TOP_LIMIT_OPTION: true,

  // Mock/Test cases (if needed)
  MOCK_CASES: [
    {
      name: 'Test Case 1',
      id: 'TC001',
      ackNumbers: ['ACK-001', 'ACK-002'],
      status: 'Active',
    },
  ],
};

// ============================================================================
// RETRY & ERROR HANDLING CONFIGURATION
// ============================================================================

const RETRY_CONFIG = {
  // Navigation retry
  NAVIGATION_RETRIES: 3,
  NAVIGATION_DELAY: 1000,

  // Report status poll retry
  STATUS_POLL_RETRIES: 60,       // 60 × 2s = 120s max
  STATUS_POLL_DELAY: 2000,

  // Download retry
  DOWNLOAD_RETRIES: 2,
  DOWNLOAD_DELAY: 2000,

  // Element detection retry
  ELEMENT_DETECTION_RETRIES: 5,
  ELEMENT_DETECTION_DELAY: 500,
};

// ============================================================================
// LOGGING & DEBUG CONFIGURATION
// ============================================================================

const LOG_CONFIG = {
  // Console logging levels
  LOG_LEVEL: process.env.LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
  
  // Screenshots on failure
  SCREENSHOT_ON_FAILURE: true,
  SCREENSHOT_FULL_PAGE: true,    // Full page vs viewport only
  
  // Trace recording
  ENABLE_TRACE: false,             // Enable Playwright trace (slows tests)
  TRACE_ON_FAILURE_ONLY: true,
  TRACE_PATH: 'traces/',
  
  // Network monitoring
  CAPTURE_NETWORK: false,
  NETWORK_LOG_PATH: 'network-logs/',
  
  // Console error capture
  CAPTURE_CONSOLE_ERRORS: true,
  
  // Test result retention
  KEEP_DOWNLOADS: true,
  KEEP_SCREENSHOTS: true,
  KEEP_REPORTS: true,
};

// ============================================================================
// SELECTOR STRATEGIES (FALLBACK ORDER)
// ============================================================================

const SELECTOR_STRATEGY = {
  // Priority order for finding elements
  PRIORITY: [
    'test-id',                  // Highest priority (most stable)
    'role',                     // Accessible role-based
    'label',                    // Associated label
    'placeholder',              // Input placeholder
    'aria-label',              // Aria label
    'css-class',               // CSS class
    'xpath',                   // XPath (lowest priority, least resilient)
  ],

  // Element locator patterns
  PATTERNS: {
    button: 'button:has-text("{text}"), [role="button"]:has-text("{text}")',
    input: 'input[placeholder="{placeholder}"], input[aria-label="{label}"]',
    checkbox: 'input[type="checkbox"][aria-label="{label}"]',
    dropdown: 'mat-select[formcontrolname="{name}"], select[aria-label="{label}"]',
    table: 'table, [role="table"]',
    row: 'tr, [role="row"]',
    cell: 'td, [role="cell"]',
    modal: 'mat-dialog-container, [role="dialog"]',
  },
};

// ============================================================================
// ASSERTION MESSAGES (FOR CLARITY)
// ============================================================================

const ASSERTION_MESSAGES = {
  // Navigation assertions
  'URL_CONTAINS_REPORTS': 'URL should contain "/reports" route',
  'REPORTS_NAV_HIGHLIGHTED': 'Reports nav item should be highlighted/active',
  'CASE_NAME_VISIBLE': 'Case name heading should be visible',

  // UI element assertions
  'ACK_DROPDOWN_NOT_EMPTY': 'ACK Number dropdown should have options',
  'TOP_LIMIT_NOT_EMPTY': 'Top Limit dropdown should have options',
  'SUBMIT_BUTTON_ENABLED': 'Submit Request button should be enabled',
  'VIEW_PROGRESS_VISIBLE': 'View Progress button should be visible',

  // Table assertions
  'TABLE_SECTION_EXISTS': 'Report Requests table section should exist',
  'TABLE_HEADERS_PRESENT': 'Table should have required headers: Requested By, Request Date, Status, Actions',
  'NEW_ROW_APPEARS': 'New report request row should appear in table',
  'STATUS_COLUMN_NON_EMPTY': 'Status column should not be empty',
  'USERNAME_MATCHES': 'Requested By should match logged-in username',

  // Status polling assertions
  'STATUS_BECOMES_COMPLETED': 'Report status should eventually become Completed',
  'STATUS_POLL_TIMEOUT': 'Report status polling timed out after 120 seconds',
  'STATUS_FAILED': 'Report generation failed',

  // Download assertions
  'FILE_EXISTS': 'Downloaded file should exist',
  'FILE_NOT_EMPTY': 'Downloaded file should not be empty',
  'FILE_VALID_FORMAT': 'Downloaded file should have valid format',
  'CSV_ROWS_VALID': 'CSV file should have at least 2 rows (header + data)',
  'XLSX_VALID': 'XLSX file should have valid structure',
  'PDF_VALID': 'PDF file should have valid header',

  // Modal assertions
  'MODAL_OPENS': 'Modal should open and be visible',
  'MODAL_TITLE_CORRECT': 'Modal title should contain "Report" and "Progress"',
  'PROGRESS_BAR_EXISTS': 'Progress bar should exist',
  'LOG_TABLE_EXISTS': 'Log table should exist with Time, Level, Message columns',
  'LOG_ROWS_PRESENT': 'Log table should have at least 1 row',
  'MODAL_CLOSES': 'Modal should close and be not visible',

  // Filter assertions
  'SEARCH_FILTERS': 'Search should filter log results',
  'LEVEL_FILTER_WORKS': 'Level filter should update displayed results',
  'ONLY_ERRORS_WORKS': 'Only Errors filter should show error rows or empty',

  // Validation assertions
  'REQUIRED_FIELD_PROTECTED': 'Submit should be disabled or show error for missing required fields',
  'NO_EMPTY_SUBMIT': 'Report should not be created with empty required fields',

  // Pagination assertions
  'PAGINATION_CONTROL_WORKS': 'Items per page control should update pagination',
};

// ============================================================================
// TEST MATRIX (WHAT RUNS)
// ============================================================================

const TEST_MATRIX = {
  // Test cases
  CASES: [
    'TC01', 'TC02', 'TC03', 'TC04', 'TC05', 'TC06', 'TC07', 'TC08',
    'TC09', 'TC10', 'TC11', 'TC12', 'TC13',
  ],
  
  // Total: 13 cases × 2 users = 26 tests
  TOTAL_TESTS: 13 * TEST_USERS.length,
  
  // Estimated execution time
  ESTIMATED_DURATION: {
    perUser: '180-240 seconds',  // 3-4 minutes
    totalBoth: '360-480 seconds', // 6-8 minutes
  },
};

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

module.exports = {
  TIMEOUTS,
  TEST_USERS,
  TEST_CONFIG,
  TEST_DATA,
  RETRY_CONFIG,
  LOG_CONFIG,
  SELECTOR_STRATEGY,
  ASSERTION_MESSAGES,
  TEST_MATRIX,

  // Helper function to get config value
  getConfig: (path) => {
    const keys = path.split('.');
    let value = module.exports;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    return value;
  },

  // Helper function to get user by name
  getUser: (name) => {
    return TEST_USERS.find(u => u.name === name || u.shortCode === name);
  },

  // Helper function to get all timeout values
  getTimeouts: () => TIMEOUTS,

  // Helper function to get test matrix info
  getTestMatrix: () => TEST_MATRIX,
};

/**
 * USAGE EXAMPLES
 * 
 * In your test files:
 * 
 *   const config = require('../config/reports-e2e.config.js');
 * 
 *   // Get timeout
 *   const pollTimeout = config.TIMEOUTS.REPORT_STATUS_POLL;
 * 
 *   // Get user
 *   const sioUser = config.getUser('SIO');
 *   console.log(sioUser.username); // 'ncrptest3'
 * 
 *   // Get nested config
 *   const minRows = config.getConfig('CSV.minRows');
 * 
 *   // Get assertion message
 *   const msg = config.ASSERTION_MESSAGES.URL_CONTAINS_REPORTS;
 * 
 *   // Get test stats
 *   const stats = config.getTestMatrix();
 *   console.log(stats.TOTAL_TESTS); // 26
 */
