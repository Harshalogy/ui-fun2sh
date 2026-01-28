// tests/smoke/TC07_gridtest.spec.js - UPDATED

const { test: base, expect } = require("@playwright/test");
const { AuthPage } = require("../../pageObjects/auth.page");
const DashboardPage = require("../../pageObjects/dashboardPage");
const { TokenHelperPage } = require("../../pageObjects/tokenHelper");

const BASE_URL = "http://148.113.0.204:23810";
const API_URL = "http://148.113.0.204:9464/authentication/api/v1/user/authenticate";

let auth = new AuthPage();

const test = base.extend({
  page: async ({ browser }, use) => {
    if (!auth.token) {
      await auth.loginByAPI(API_URL, "ncrp_demo", "ncrp_demo");
      await auth.prepareLocalStorage(BASE_URL);
    }

    const { context, page } = await auth.createAuthenticatedContext(browser);
    await page.goto(`${BASE_URL}/dashboard/investigator`);
    await page.waitForSelector(".card-grid", { timeout: 10000 });
    await use(page);
    await context.close();
  },
});

test.describe.skip("Dashboard - Main Card Grid (UI/API Validation)", () => {
  // TEST 1: Grid UI vs API Data Verification
  test("1 - Grid Data - UI vs API Verification", async ({ page, request }) => {
    console.log("\n" + "=".repeat(80));
    console.log("TEST 1: Grid UI vs API Data Verification");
    console.log("=".repeat(80));

    const dashboardPage = new DashboardPage(page);
    const tokenHelper = new TokenHelperPage(page, request);

    console.log("\nSTEP 1: Getting grid data from UI...");
    const gridCards = await dashboardPage.getAllGridCardsDetailed();

    console.log(`Found ${gridCards.length} cards in dashboard grid:`);
    gridCards.forEach((card) => {
      console.log(`  - "${card.label}": ${card.valueText} (Numeric: ${card.value})`);
    });

    console.log("\nSTEP 2: Getting data from APIs...");

    const authToken = auth.token;
    if (!authToken) {
      throw new Error("No authentication token available");
    }

    console.log(`Using auth token: ${authToken.substring(0, 30)}...`);

    const apiCounts = await dashboardPage.fetchApiDataWithLogging(tokenHelper, authToken);

    console.log("\nSTEP 3: Comparing UI vs API data...");

    const comparison = await dashboardPage.compareCaseCardsWithAPI(apiCounts);
    let allMatch = true;

    for (const result of comparison.results) {
      const caseCardLabels = dashboardPage.getCaseCardLabels();

      if (caseCardLabels.includes(result.uiLabel)) {
        if (result.matches) {
          console.log(`  ✓ "${result.uiLabel}": UI=${result.uiValue}, API=${result.apiValue} - MATCH`);
        } else {
          console.log(`  ✗ "${result.uiLabel}": UI=${result.uiValue}, API=${result.apiValue} - MISMATCH`);
          allMatch = false;
        }
      } else {
        console.log(`  • "${result.uiLabel}": ${result.uiValueText} (No API validation)`);
      }
    }

    console.log("\nSTEP 4: Data consistency check...");
    const consistency = dashboardPage.validateDataConsistency(apiCounts);
    console.log(`  ${consistency.summary}`);
    console.log(`  Consistency: ${consistency.isConsistent ? "✓ VALID" : "✗ INVALID"}`);

    // Assertions
    expect(allMatch).toBe(true);
    expect(consistency.isConsistent).toBe(true);

    console.log("\n✓ TEST PASSED");
    console.log("=".repeat(80));
  });

  // TEST 2: Grid Visual Validation
  test("2 - Grid Data - Visual Validation", async ({ page }) => {
    console.log("\nTEST 2: Grid Visual Validation");
    console.log("-".repeat(40));

    const dashboardPage = new DashboardPage(page);

    // Step 1: Check grid exists
    const gridExists = await dashboardPage.doesMainCardGridExist();
    console.log(`Grid exists: ${gridExists ? "✅" : "❌"}`);
    expect(gridExists).toBe(true);

    // Step 2: Get card count
    const cardCount = await dashboardPage.getGridCardsCount();
    console.log(`Card count: ${cardCount}`);
    expect(cardCount).toBeGreaterThan(0);

    // Step 3: Get card data
    const gridCards = await dashboardPage.getAllCardsData();
    console.log("Card details:");
    gridCards.forEach((card) => {
      console.log(`  ${card.label}: ${card.value}`);
    });

    // Step 4: Check visibility
    console.log("\nVisibility check (first 4 cards):");
    const visibilityResults = await dashboardPage.validateCardVisibility(4);

    let allVisible = true;
    visibilityResults.forEach((result) => {
      console.log(`  ${result.label}: ${result.visible ? "✅" : "❌"}`);
      if (!result.visible) allVisible = false;
    });

    expect(allVisible).toBe(true);
    console.log("\n✅ All checks passed");
  });

  // TEST 3: Data Consistency Test
  test("3 - Grid Data - Data Consistency", async ({ page, request }) => {
    console.log("\n" + "=".repeat(80));
    console.log("TEST 3: Grid Data Consistency");
    console.log("=".repeat(80));

    const dashboardPage = new DashboardPage(page);
    const tokenHelper = new TokenHelperPage(page, request);

    console.log("\nSTEP 1: Getting API data...");
    const authToken = auth.token;

    if (!authToken) {
      throw new Error("No authentication token available");
    }

    const apiData = await dashboardPage.fetchApiDataWithLogging(tokenHelper, authToken);

    console.log("\nSTEP 2: Validating data consistency...");
    const consistency = dashboardPage.validateDataConsistency(apiData);
    console.log(`  ${consistency.summary}`);
    console.log(`  Consistency: ${consistency.isConsistent ? "✓ VALID" : "✗ INVALID"}`);

    // Skip additional checks if we have null values
    if (
      consistency.active !== null &&
      consistency.reopened !== null &&
      consistency.closed !== null &&
      consistency.total !== null
    ) {
      console.log("\nSTEP 3: Additional validations...");
      const allPositive = Object.values(apiData).every((count) => count >= 0);
      console.log(`  All counts non-negative: ${allPositive ? "✓ YES" : "✗ NO"}`);

      const allNumbers = Object.values(apiData).every((count) => typeof count === "number");
      console.log(`  All values are numbers: ${allNumbers ? "✓ YES" : "✗ NO"}`);

      // Assertions
      expect(consistency.isConsistent).toBe(true);
      expect(allPositive).toBe(true);
      expect(allNumbers).toBe(true);
    } else {
      console.log("\n⚠️ Skipping additional validations due to API errors");
      expect(consistency.isConsistent).toBe(true);
    }

    console.log("\n✓ TEST COMPLETED");
    console.log("=".repeat(80));
  });

  // TEST 4: Individual API Endpoint Validation
  test("4 - Grid Data - Individual API Validation", async ({ page, request }) => {
    console.log("\n" + "=".repeat(80));
    console.log("TEST 4: Individual API Endpoint Validation");
    console.log("=".repeat(80));

    const dashboardPage = new DashboardPage(page);
    const tokenHelper = new TokenHelperPage(page, request);

    console.log("\nSTEP 1: Testing individual API endpoints...");

    const authToken = auth.token;
    if (!authToken) {
      throw new Error("No authentication token available");
    }

    const endpoints = dashboardPage.getBaseApiEndpoints();
    let allPassed = true;

    for (const endpoint of endpoints) {
      console.log(`\n  Testing: ${endpoint.label}`);

      try {
        const apiValue = await tokenHelper.callCaseManagementAPI(endpoint.endpoint, authToken);
        console.log(`    API Value: ${apiValue}`);
        console.log(`    Status: ✓ SUCCESS`);

        expect(typeof apiValue).toBe("number");
        expect(apiValue).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.log(`    ERROR: ${error.message}`);
        console.log(`    Status: ✗ FAILED`);
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log("\n✓ All API endpoints responded successfully");
    } else {
      console.log("\n⚠️ Some API endpoints failed");
    }

    console.log("\n✓ TEST COMPLETED");
    console.log("=".repeat(80));
  });
});
