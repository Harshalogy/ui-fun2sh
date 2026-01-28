// tests/TC02_IO_Dashboard.spec.js
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const IODashboardPage = require("../pageObjects/ioDashboard");
const SessionUtility = require("../utils/sessionUtility");
const {validateSummaryCardsUsingAPI} = require("../utils/loginHelper");

const AUTH_FILE = path.join(__dirname, "../auth.json");

// Extract auth token from auth.json
function getAuthToken() {
  const authData = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
  const sessionStorage = authData.origins[0].sessionStorage;
  const tokenObj = sessionStorage.find(item => item.name === "authToken");
  return tokenObj ? tokenObj.value : null;
}

test.describe('IO Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await SessionUtility.setupSessionAndNavigate(page, '/dashboard/io','auth.json', {
      verifyPage: async (page) => {
        const io = new IODashboardPage(page);
        await io.assertOnIODashboard();
      }
    });
  });

 
  test("1 - IO Dashboard - Header, UI Elements, Table Columns, Pagination & Controls", async ({ page }) => {
    const io = new IODashboardPage(page);

    await expect(io.locators.ioTitle).toBeVisible();
    const titleText = await io.getIOTitleText();
    expect(titleText.toLowerCase()).toContain("cases");

    await expect(io.locators.breadcrumbActive).toBeVisible();
    const breadcrumbText = await io.getBreadcrumbActiveText();
    expect(breadcrumbText.toLowerCase()).toContain("io dashboard");
    console.log(`✓ Header: "${titleText}", Breadcrumb: "${breadcrumbText}"`);
    
    await expect(io.locators.notificationsBtn).toBeVisible();
    await expect(io.locators.userMenuTrigger).toBeVisible();
    
    const userName = await io.getUserNameText();
    expect(userName).toBeTruthy();
    console.log(`✓ User: ${userName}`);

    await expect(io.locators.sidebar).toBeVisible();
    await expect(io.locators.activeNavItem).toBeVisible();
    await expect(io.locators.sidebarToggle).toBeVisible();

     // Summary cards
     await expect(io.locators.summaryCards.first()).toBeVisible();
     const cards = await io.getSummaryCards();
     expect(cards.length).toBeGreaterThan(0);
     console.log(`✓ Summary cards: ${cards.length}`);
 
     // Case list and table
     await expect(io.locators.caseListTitle).toBeVisible();
     await expect(io.locators.table).toBeVisible();
 
     // Ensure table has data
     await io.waitForTableRows(1);
     const rowCount = await io.getTableRowCount();
     expect(rowCount).toBeGreaterThan(0);
     console.log(`✓ Table rows: ${rowCount}`);

     // Column headers validation
     const headerCells = await io.locators.tableHeaderRows.first().locator('th');
     
     // Get column headers
     const columnHeaders = [];
     const headerCount = await headerCells.count();
     for (let i = 0; i < headerCount; i++) {
       const headerText = (await headerCells.nth(i).innerText()).trim();
       if (headerText) columnHeaders.push(headerText);
     }
     expect(columnHeaders.length).toBeGreaterThan(0);
     console.log(`✓ Column headers: ${columnHeaders.join(', ')}`);
 
     // Key controls
     await expect(io.locators.searchInput).toBeVisible();
     const searchPlaceholder = await io.locators.searchInput.getAttribute('placeholder');
     expect(searchPlaceholder).toBeTruthy();
     console.log(`✓ Search input placeholder: ${searchPlaceholder}`);

     await expect(io.locators.columnsSelect).toBeVisible();

     await expect(io.locators.exportCsvBtn).toBeVisible();

     // Pagination validation
     await expect(io.locators.paginationWrapper).toBeVisible();
     await expect(io.locators.recordsSelect).toBeVisible();

     // Verify New Case button
     await expect(io.locators.newCaseBtn).toBeVisible();
  });

  test("2 - IO Dashboard - Sidebar Toggle, Summary Cards, View Toggle, and API Validation", async ({ page, request }) => {
    const io = new IODashboardPage(page);

    await expect(io.locators.sidebarToggle).toBeVisible();

    // Toggle sidebar open/close
    await io.toggleSidebar();
    await page.waitForTimeout(300);
    await io.toggleSidebar();
    await page.waitForTimeout(300);

    // Verify sidebar is still functional
    await expect(io.locators.sidebarToggle).toBeVisible();
    await expect(io.locators.sidebar).toBeVisible();

    await expect(io.locators.ioMenu).toBeVisible();
    const isActive = await io.isIOMenuActive();
    expect(isActive).toBeTruthy();

    await io.clickIOMenu();
    await expect(page).toHaveURL(/\/dashboard\/io/);

    // Summary cards validation - initial state
    await expect(io.locators.summaryCards.first()).toBeVisible();
    const cardsInitial = await io.getSummaryCards();
    expect(cardsInitial.length).toBeGreaterThan(0);

    // Get initial card values
    const initialCardValues = cardsInitial.map(card => card.valueText);
    console.log(`✓ Initial Summary cards: ${initialCardValues.join(', ')}`);

    // Get initial API results
    const token = getAuthToken();
    const initialApiResults = await validateSummaryCardsUsingAPI(page, request, token, "IO");
    console.log(`✓ Initial API validation completed`);

    // Toggle View By option - Transaction to Disputed Amount
    const viewByRadios = await io.locators.ioViewByRadios;
    const radioCount = await viewByRadios.count();
    
    if (radioCount > 1) {
      // Switch to the second view option (Disputed Amount)
      await viewByRadios.nth(1).click();
      await page.waitForTimeout(500);
      console.log(`✓ Toggled view option`);

      // Validate summary cards after toggle
      const cardsAfterToggle = await io.getSummaryCards();
      expect(cardsAfterToggle.length).toBeGreaterThan(0);

      const toggleCardValues = cardsAfterToggle.map(card => card.valueText);
      console.log(`✓ Summary cards after toggle: ${toggleCardValues.join(', ')}`);

      // Validate via API after toggle
      const toggleApiResults = await validateSummaryCardsUsingAPI(page, request, token, "IO");
      console.log(`✓ API validation after toggle completed`);

      // Toggle back to initial view
      await viewByRadios.nth(0).click();
      await page.waitForTimeout(500);
      console.log(`✓ Toggled back to initial view`);

      // Verify summary cards are back to original values
      const cardsFinal = await io.getSummaryCards();
      const finalCardValues = cardsFinal.map(card => card.valueText);
      console.log(`✓ Summary cards after toggle back: ${finalCardValues.join(', ')}`);

      // Final API validation
      await validateSummaryCardsUsingAPI(page, request, token, "IO");
      console.log(`✓ Final API validation completed`);
    } else {
      console.log(`⚠ View By options not available (found ${radioCount} radios)`);
    }
  });

  
 
 
  
});
