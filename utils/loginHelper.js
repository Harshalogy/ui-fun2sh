// utils/loginHelper.js
const { expect } = require("@playwright/test");
const { AuthPage } = require("../pageObjects/auth.page");

const users = require("../config/users");
const { loginByUIAndSaveToken } = require("./uiLoginAndToken.helper");

const BASE_URL = "http://148.113.0.204:23810";
const API_URL = "http://148.113.0.204:9464/authentication/api/v1/user/authenticate";

const selectors = {
  title: ".io-title",

  viewByLabel: ".io-viewby-label",
  viewByDisputed: 'label.io-radio:has-text("Disputed Amount") input',
  viewByTransaction: 'label.io-radio:has-text("Transaction Amount") input',

  caseListTitle: ".io-case-list-title",

  activeValue: ".io-summary-card.active .io-summary-value",
  closedValue: ".io-summary-card.closed .io-summary-value",
  totalValue: ".io-summary-card.total .io-summary-value",

  summaryLabels: ".io-summary-label",
  summaryIcons: ".io-summary-icon i.material-icons",
  newCaseButton: ".io-newcase-btn",

  tableRows: "tbody tr",
  statusOpen: ".io-status.open",
  statusClosed: ".io-status.closed",

  clearButton: 'button.io-export-btn:has-text("Clear")',
  exportCsvButton: 'button.io-export-btn:has-text("Export CSV")',

  paginationWrapper: ".io-pagination-wrapper",
  previousBtn: 'button.io-pagination-btn:has-text("Previous")',
  nextBtn: 'button.io-pagination-btn:has-text("Next")',
  activePageBtn: "button.io-pagination-btn.active",

  // SIO-specific selectors
  sioCaseWiseTable: "app-sio-dashboard app-cases table.io-table-custom",
  sioCommonAttributesTable: "table.common-attributes-table",
  sioCaseListTitle: ".io-case-list-title", // text differs
  sioNewCaseButton: 'button:has-text("New Case")',
};

/**
 * =========================
 * LOGIN + NAVIGATION (UI)
 * =========================
 * Keeps your current UI-login flow unchanged.
 */
async function loginAndExecuteScenario(browser, userType) {
  const user = users[userType];
  if (!user) throw new Error(`Invalid user type: ${userType}`);

  const { context, page, token } = await loginByUIAndSaveToken(
    browser,
    userType,
    user
  );

  const dashboardUrl =
    userType === "IO" ? `${BASE_URL}/dashboard/io` : `${BASE_URL}/dashboard/sio`;

  await page.goto(dashboardUrl, { waitUntil: "networkidle" });

  return { context, page, token };
}

/**
 * =========================
 * INTERNAL: AUTHENTICATE VIA API
 * =========================
 */
async function authenticateAndGetToken(request, { username, password }) {
  const urlWithQuery =
    `${API_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const response = await request.post(urlWithQuery, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Origin: BASE_URL,
      Referer: `${BASE_URL}/`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    },
    data: { username, password },
  });

  if (!response.ok()) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Auth API failed: ${response.status()} ${response.statusText()}\n${text}`
    );
  }

  const body = await response.json();

  const token =
    body?.data?.token ||
    body?.token ||
    body?.data?.jwt ||
    body?.data?.accessToken;

  if (!token) {
    throw new Error(
      `Auth API response did not include token. Received keys: ${Object.keys(body || {})}`
    );
  }

  return { token, body };
}

/**
 * =========================
 * INTERNAL: INJECT AUTH STORAGE
 * =========================
 * Inject token + userData into session/local storage before app loads.
 */
async function injectAuthStorage(page, { username, token }) {
  const storageData = {
    session: {
      jwt: token,
      username: username,
    },
    local: {
      isDarkModeOn: "false",
      theme: "keppel",
      userData: JSON.stringify({
        userName: username,
        role: "role_investigator",
        homeCurrency: "INR",
        leaId: 1,
        leaUserId: username,
        leaGroupId: 1,
        // parentModules: [
        //   "MODULE_AUTO_REPORTS",
        //   "MODULE_GLOBAL_CONFIGURE_REFERENCE_DATA",
        //   "MODULE_BANK_RECONCILIATION",
        //   "MODULE_CASE_HUB",
        //   "MODULE_CASE_MANAGEMENT",
        //   "MODULE_CONFIGURE_REFERENCE_DATA",
        //   "MODULE_CUSTOM_REPORTS",
        //   "MODULE_DATA_CLEAN_UP",
        //   "MODULE_ENTITY_PROFILE",
        //   "MODULE_ENTITY_RESOLUTION",
        //   "MODULE_FILE_GENEI",
        //   "MODULE_KIBANA_DASHBOARD",
        //   "MODULE_LINK_VIEW",
        //   "MODULE_LOCATION_MAP",
        //   "MODULE_ML_ENTITY_EXTRACTION",
        //   "MODULE_RELATE_PARTIES",
        //   "MODULE_SUSPECT_PROFILE_ANALYSIS",
        //   "MODULE_TABULAR_VIEW",
        //   "MODULE_TEXT_ANALYSIS",
        //   "MODULE_TRANSACTION_RESOLUTION",
        //   "MODULE_UPLOAD_DATA",
        // ],
        // childModules: {
        //   MODULE_CASE_MANAGEMENT: ["CREATE_CASES", "DELETE_CASES", "UPDATE_CASES"],
        //   MODULE_GLOBAL_CONFIGURE_REFERENCE_DATA: [
        //     "BANK_ACCOUNT_TYPES",
        //     "BANK_MAPPING_HEADERS",
        //     "BANKS",
        //     "CURRENCIES",
        //     "IFSC",
        //     "LOCATIONS",
        //     "TRANSACTION_MODES",
        //   ],
        // },
      }),
    },
  };

  await page.addInitScript((data) => {
    // sessionStorage
    Object.keys(data.session).forEach((key) => {
      sessionStorage.setItem(key, data.session[key]);
    });

    // localStorage
    Object.keys(data.local).forEach((key) => {
      localStorage.setItem(key, data.local[key]);
    });
  }, storageData);
}

/**
 * =========================
 * LOGIN + NAVIGATION (API)
 * =========================
 * NEW: API-login flow. Keeps UI-login flow intact.
 */
async function loginAndExecuteScenarioViaAPI(browser, userType) {
  const user = users[userType];
  if (!user) throw new Error(`Invalid user type: ${userType}`);

  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  const { token } = await authenticateAndGetToken(page.request, {
    username: user.username,
    password: user.password,
  });

  await injectAuthStorage(page, { username: user.username, token });

  const dashboardUrl =
    userType === "IO" ? `${BASE_URL}/dashboard/io` : `${BASE_URL}/dashboard/sio`;

  await page.goto(dashboardUrl, { waitUntil: "networkidle" });

  return { context, page, token };
}

/**
 * =========================
 * UI VALIDATION ONLY (NO LOGIN)
 * =========================
 */
async function validatedashboard(page, userType) {
  const user = users[userType];
  if (!user) throw new Error(`Invalid user type: ${userType}`);

  if (userType === "IO") {
    console.log(`-> Validating '${userType}' Dashboard scenario`);

    // ---------- HEADER & SUMMARY ----------
    await expect(page.locator(selectors.title)).toHaveText("Cases");
    await expect(page.locator(selectors.summaryLabels)).toHaveCount(3);
    await expect(page.locator(selectors.summaryIcons)).toHaveCount(3);

    // ---------- NEW CASE ----------
    const newCaseBtn = page.locator(selectors.newCaseButton);
    await expect(newCaseBtn).toBeVisible();
    await expect(newCaseBtn).toContainText("New Case");

    // ---------- VIEW BY ----------
    await expect(page.locator(selectors.viewByLabel)).toBeVisible();
    await expect(page.locator(selectors.viewByLabel)).toHaveText("View by:");

    // ---------- CASE LIST ----------
    await expect(page.locator(selectors.caseListTitle)).toBeVisible();
    await expect(page.locator(selectors.caseListTitle)).toHaveText("Case List");

    // ---------- ACTION BUTTONS ----------
    await expect(page.locator(selectors.clearButton)).toBeVisible();
    await expect(page.locator(selectors.exportCsvButton)).toBeVisible();

    // ---------- PAGINATION ----------
    await expect(page.locator(selectors.paginationWrapper)).toBeVisible();
    await expect(page.locator(selectors.previousBtn)).toBeDisabled();
    await expect(page.locator(selectors.activePageBtn)).toBeVisible();
    await expect(page.locator(selectors.nextBtn)).toBeEnabled();

    // ---------- VIEW BY TOGGLE SHOULD NOT CHANGE DASHBOARD BUTTONS ----------
    const disputedRadio = page.getByLabel("Disputed Amount");
    const transactionRadio = page.getByLabel("Transaction Amount");

    const ioNewCaseVisibleBefore = await page.locator(selectors.newCaseButton).isVisible();
    const ioClearVisibleBefore = await page.locator(selectors.clearButton).isVisible();
    const ioExportVisibleBefore = await page.locator(selectors.exportCsvButton).isVisible();

    await transactionRadio.click();
    await page.waitForTimeout(3000);

    await disputedRadio.click();
    await page.waitForTimeout(3000);

    await expect(page.locator(selectors.newCaseButton)).toBeVisible({
      visible: ioNewCaseVisibleBefore,
    });

    await expect(page.locator(selectors.clearButton)).toBeVisible({
      visible: ioClearVisibleBefore,
    });

    await expect(page.locator(selectors.exportCsvButton)).toBeVisible({
      visible: ioExportVisibleBefore,
    });

    console.log("✓ Dashboard UI validated successfully");
  }

  if (userType === "SIO") {
    console.log(`-> Validating '${userType}' Dashboard scenario`);

    // ---------- HEADER & SUMMARY ----------
    await expect(page.locator(selectors.title)).toHaveText("Cases");
    await expect(page.locator(selectors.summaryLabels)).toHaveCount(3);
    await expect(page.locator(selectors.summaryIcons)).toHaveCount(3);

    // ---------- NEW CASE ----------
    const newCaseBtn = page.locator(selectors.sioNewCaseButton);
    await expect(newCaseBtn).toBeVisible();
    await expect(newCaseBtn).toContainText("New Case");

    // ---------- VIEW BY ----------
    await expect(page.locator(selectors.viewByLabel)).toBeVisible();
    await expect(page.locator(selectors.viewByLabel)).toHaveText("View by:");

    // ---------- CASE LIST TITLE (DIFFERENT TEXT) ----------
    await expect(page.locator(selectors.sioCaseListTitle)).toHaveText(
      "Case-wise Fund Status"
    );

    // ---------- FIRST TABLE : CASE-WISE FUND STATUS ----------
    const caseWiseTable = page.locator(
      "app-sio-dashboard app-cases table.io-table-custom:has(tbody tr)"
    );

    await expect(caseWiseTable).toHaveCount(1);
    await expect(caseWiseTable).toBeVisible();

    // ---------- SECOND TABLE : COMMON ATTRIBUTES ----------
    const commonAttrTable = page.locator(selectors.sioCommonAttributesTable);
    await expect(commonAttrTable).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Cases with Common Attributes" })
    ).toBeVisible();

    // ---------- PAGINATION ----------
    await expect(page.locator(selectors.paginationWrapper).first()).toBeVisible();

    // ---------- VIEW BY TOGGLE SHOULD NOT CHANGE DASHBOARD BUTTONS ----------
    const disputedRadio = page.getByLabel("Disputed Amount");
    const transactionRadio = page.getByLabel("Transaction Amount");

    const sioNewCaseVisibleBefore = await page.locator(selectors.sioNewCaseButton).isVisible();
    const sioExportVisibleBefore = await page.locator(selectors.exportCsvButton).isVisible();

    await transactionRadio.click();
    await page.waitForTimeout(3000);

    await disputedRadio.click();
    await page.waitForTimeout(3000);

    await expect(page.locator(selectors.sioNewCaseButton)).toBeVisible({
      visible: sioNewCaseVisibleBefore,
    });

    await expect(page.locator(selectors.exportCsvButton)).toBeVisible({
      visible: sioExportVisibleBefore,
    });

    console.log("✓ SIO Dashboard UI + dual tables validated successfully");
  }
}

async function fetchDashboardSummary(request, token) {
  if (!token) {
    throw new Error("API token is missing");
  }

  const response = await request.get(
    "http://148.113.0.204:9464/ncrp-casemanagement/api/v1/io/dashboard/summary",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  return body.data;
}

/**
 * API ↔ UI VALIDATION
 */
async function validateSummaryCardsUsingAPI(page, request, token, userType) {
  console.log("-> Validating dashboard summary cards using API");

  const apiData = await fetchDashboardSummary(request, token, userType);

  const uiActive = Number(await page.locator(selectors.activeValue).innerText());
  const uiClosed = Number(await page.locator(selectors.closedValue).innerText());
  const uiTotal = Number(await page.locator(selectors.totalValue).innerText());

  expect(uiActive).toBe(apiData.activeCases);
  expect(uiClosed).toBe(apiData.closedCases);
  expect(uiTotal).toBe(apiData.totalCases);
  expect(uiActive + uiClosed).toBe(uiTotal);
}

module.exports = {
  // UI login (existing)
  loginAndExecuteScenario,

  // API login (new)
  loginAndExecuteScenarioViaAPI,

  // validations
  validatedashboard,
  validateSummaryCardsUsingAPI,
};
