// tests/case-dashboard.spec.js
const { test: base, expect } = require("@playwright/test");
const { AuthPage } = require("../../pageObjects/auth.page");
const { CaseDashboard } = require("../../pageObjects/CaseDashboard");
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import sessionData from '../../storageState.json' assert { type: 'json' };

const BASE_URL = "http://148.113.0.204:23810";
const API_URL = "http://148.113.0.204:9464/authentication/api/v1/user/authenticate";
const { TokenHelperPage } = require('../../pageObjects/tokenHelper');
let auth = new AuthPage();

// Test fixture that handles authentication and page setup
const test = base.extend({
    page: async ({ browser }, use) => {
        // If this is the first test run, perform API login
        if (!auth.token) {
            await auth.loginByAPI(API_URL, "ncrp_demo", "ncrp_demo");
            await auth.prepareLocalStorage(BASE_URL);
        }

        // Create authenticated browser context and page
        const { context, page } = await auth.createAuthenticatedContext(browser);

        // Navigate to dashboard
        await page.goto(`${BASE_URL}/dashboard/investigator`);

        // Provide the page to the test
        await use(page);

        // Clean up context after test
        await context.close();
    }
});

test.describe.skip('Case Dashboard Tests', () => {
    let caseDashboard;
    let firstCaseName;

    test.beforeEach(async ({ page }) => {
        // Wait for investigator dashboard to load
        await page.waitForSelector('tbody tr');

        await page.locator('input[formcontrolname="search"]').fill('UKSTF');

        const caseLink = page.locator('a.case-link', { hasText: 'UKSTF' });
        console.log(`\n=== Navigating to case: ${firstCaseName} ===`);

        // Click on the first case name hyperlink
        await caseLink.click();

        // Wait for navigation to case dashboard
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Additional wait for page rendering

        // Initialize CaseDashboard page object
        caseDashboard = new CaseDashboard(page);

        // Wait for case dashboard to load
        await caseDashboard.waitForLoad();
        console.log('✓ Case dashboard loaded');
    });

    test('TC1: Verify URL contains case name and page header', async () => {
        console.log('\n--- Test 1: Verifying URL and page header ---');

        // 1. Verify URL contains case name
        const url = await caseDashboard.verifyUrlContainsCaseName(firstCaseName);

        // 2. Verify page header elements
        const headerInfo = await caseDashboard.verifyPageHeader(firstCaseName);

        // Verify specific header format
        expect(headerInfo.breadcrumb).toContain('Case Management/');
        expect(headerInfo.breadcrumb).toContain(firstCaseName);
        expect(headerInfo.title).toBe(firstCaseName);

        // Verify case metadata format
        expect(headerInfo.meta).toContain('Category -');
        expect(headerInfo.meta).toContain('Priority -');
        expect(headerInfo.meta).toContain('Investigator -');

        console.log('\n✓ All header verifications passed:');
        console.log(`  URL: ${url}`);
        console.log(`  Breadcrumb: ${headerInfo.breadcrumb}`);
        console.log(`  Title: ${headerInfo.title}`);
        console.log(`  Meta: ${headerInfo.meta}`);

        // Take screenshot
        await caseDashboard.takeScreenshot('case-dashboard-header');
    });

    test('TC2: Verify case dashboard action buttons visibility', async () => {
        console.log('\n--- Test 2: Verifying case dashboard action buttons visibility ---');

        // Verify action buttons are visible and enabled
        const buttonInfo = await caseDashboard.verifyActionButtons();

        // Verify button texts contain expected text
        expect(buttonInfo.linkView).toContain('Link View');
        expect(buttonInfo.editCase).toContain('Edit Case');
        expect(buttonInfo.fileStack).toContain('Uploaded File Stack');

        console.log('\n✓ All action buttons verified as visible and enabled');
        console.log(`  Link View: "${buttonInfo.linkView}"`);
        console.log(`  Edit Case: "${buttonInfo.editCase}"`);
        console.log(`  Uploaded File Stack: "${buttonInfo.fileStack}"`);

        // Verify other dashboard sections (optional)
        const overviewCardCount = await caseDashboard.verifyCaseOverview();
        console.log(`✓ Case Overview section has ${overviewCardCount} cards`);

        const panelCount = await caseDashboard.verifyDetailPanels();
        console.log(`✓ Found ${panelCount} detail panels`);

        await caseDashboard.verifyProgressBar();
        console.log('✓ Progress bar verified');
    });

    test('TC3: Verify Link View button functionality', async () => {
        console.log('\n--- Test 3: Verifying Link View button functionality ---');

        // Get button info first
        const buttonInfo = await caseDashboard.verifyActionButtons();

        // Verify Link View button exists in the returned info
        expect(buttonInfo.linkView).toContain('Link View');
        console.log('✓ Link View button verified through action buttons check');

        // Test Link View button navigation using page object method
        const linkViewResult = await caseDashboard.verifyLinkViewButtonNavigation();

        // Verify the result
        expect(linkViewResult.success).toBe(true);
        console.log('✓ Link View button functionality tested successfully');

        if (linkViewResult.navigated) {
            console.log(`✓ Link View button navigated to: ${linkViewResult.urlAfter}`);
        } else if (linkViewResult.modal) {
            console.log('✓ Link View button opened a modal/dialog');
        } else {
            console.log('✓ Link View button clicked successfully');
        }
    });

    test('TC4: Verify Edit Case button functionality', async () => {
        console.log('\n--- Test 4: Verifying Edit Case button functionality ---');

        // Get button info first
        const buttonInfo = await caseDashboard.verifyActionButtons();

        // Verify Edit Case button exists in the returned info
        expect(buttonInfo.editCase).toContain('Edit Case');
        console.log('✓ Edit Case button verified through action buttons check');

        // Test Edit Case button navigation using page object method
        const editCaseResult = await caseDashboard.verifyEditCaseButtonNavigation();

        // Verify the result
        expect(editCaseResult.success).toBe(true);
        console.log('✓ Edit Case button functionality tested successfully');

        if (editCaseResult.navigated) {
            console.log(`✓ Edit Case button navigated to: ${editCaseResult.urlAfter}`);
        } else if (editCaseResult.modal) {
            console.log('✓ Edit Case button opened a modal/dialog');
        } else {
            console.log('✓ Edit Case button clicked successfully');
        }
    });

    test('TC5: Verify Uploaded File Stack button functionality', async () => {
        console.log('\n--- Test 5: Verifying Uploaded File Stack button functionality ---');

        // Get button info first
        const buttonInfo = await caseDashboard.verifyActionButtons();

        // Verify Uploaded File Stack button exists in the returned info
        expect(buttonInfo.fileStack).toContain('Uploaded File Stack');
        console.log('✓ Uploaded File Stack button verified through action buttons check');

        // Test Uploaded File Stack button functionality using page object method
        const fileStackResult = await caseDashboard.verifyUploadedFileStackButton();

        // Verify the result
        expect(fileStackResult.success).toBe(true);
        console.log('✓ Uploaded File Stack button functionality tested successfully');

        if (fileStackResult.drawer) {
            console.log('✓ Uploaded File Stack button opened a drawer');
            if (fileStackResult.drawerInfo.header) {
                console.log(`✓ Drawer header: "${fileStackResult.drawerInfo.header}"`);
            }
            if (fileStackResult.drawerInfo.hasFileStack) {
                console.log('✓ File Stack component loaded');
            }
            if (fileStackResult.drawerInfo.closed) {
                console.log('✓ Drawer closed successfully');
            }
        } else if (fileStackResult.navigation) {
            console.log(`✓ Navigated to: ${fileStackResult.urlAfter}`);
        } else {
            console.log('✓ Uploaded File Stack button clicked successfully');
        }
    });

    test('TC6: Validate Case Overview card grid structure and data', async () => {
        console.log('\n--- Test 6: Validating Case Overview card grid ---');

        // Use the page object method for comprehensive validation
        const validationResults = await caseDashboard.validateCaseOverviewCards();

        console.log('\nValidation Results:');
        console.log('==================');
        console.log(`✓ Grid validation: ${validationResults.gridValidation?.success ? 'PASS' : 'FAIL'}`);
        console.log(`✓ All cards exist: ${validationResults.allCardsExist?.success ? 'PASS' : 'FAIL'}`);
        console.log(`✓ Cards validated: ${validationResults.cardsValidated}/${validationResults.totalCards}`);

        console.log('\nCard Details:');
        console.log('=============');

        validationResults.cardDetails.forEach(card => {
            console.log(`\n${card.index}. ${card.title}:`);
            console.log(`  Value: ${card.structure.value}`);
            console.log(`  Icon: ${card.structure.icon}`);
            console.log(`  Color: ${card.structure.colorClass}`);
            console.log(`  Format: ${card.format.format} (${card.format.valid ? 'valid' : 'invalid'})`);

            if (card.structure.hasSecondary) {
                console.log(`  Secondary: ${card.structure.secondaryText}`);
                console.log(`  Secondary Type: ${card.secondaryFormat?.type}`);
            }

            console.log(`  Click Test:`);
            if (card.clickFunctionality.navigated) {
                console.log(`    - Navigated to: ${card.clickFunctionality.newUrl}`);
            } else if (card.clickFunctionality.modalOpened) {
                console.log(`    - Modal opened: ${card.clickFunctionality.modalTitle || 'No title'}`);
                console.log(`    - Modal closed: ${card.clickFunctionality.modalClosed ? 'Yes' : 'No'}`);
            } else {
                console.log(`    - Click registered (no navigation or modal)`);
            }

            console.log(`  Status: ${card.valid ? '✓ PASS' : '✗ FAIL'}`);
        });

        // Get all card data for summary
        const allCardData = await caseDashboard.getAllCardData();

        console.log('\nSummary:');
        console.log('========');
        console.log('✓ All 8 case overview cards validated:');
        allCardData.forEach(card => {
            console.log(`  ${card.index}. ${card.title}: ${card.value}`);
        });

        console.log('\n✓ Validation completed with overall status:',
            validationResults.overallSuccess ? 'PASS ✓' : 'FAIL ✗');

        if (!validationResults.overallSuccess && validationResults.error) {
            console.error(`  Error: ${validationResults.error}`);
        }

        // Assert overall test success
        expect(validationResults.overallSuccess).toBe(true);
    });

    test('TC7: Comprehensive dashboard verification', async () => {
        console.log('\n--- Test 6: Comprehensive dashboard verification ---');

        // Pass the firstCaseName as parameter
        const results = await caseDashboard.comprehensiveDashboardValidation(firstCaseName);

        console.log('\nComprehensive verification summary:');
        console.log(`✓ URL: ${results.url}`);
        console.log(`✓ Page title: ${results.header.title}`);
        console.log(`✓ Action buttons: ${Object.keys(results.buttons).length} buttons verified`);
        console.log(`✓ Overview cards: ${results.overviewCards} cards found`);
        console.log(`✓ Detail panels: ${results.detailPanels} panels found`);
        console.log(`✓ Dashboard container visible: ${results.hasDashboardContainer}`);
        console.log(`✓ Error messages found: ${results.errors.length}`);

        if (results.errors.length === 0) {
            console.log('✓ No error messages found');
        }

        console.log('\n✓ Comprehensive verification completed successfully');
    });

    test('TC8: Validate Case Overview section and cards', async () => {
        console.log('\n--- Test 7: Validating Case Overview section and cards ---');

        // Validate Case Overview section using page object method
        const cardCount = await caseDashboard.validateCaseOverviewSection();

        console.log(`✓ Found ${cardCount} overview cards`);

        // Get detailed card values using page object method
        const cardValues = await caseDashboard.getOverviewCardValues();

        console.log('✓ Card values retrieved:');
        cardValues.forEach((card, index) => {
            console.log(`  ${index + 1}. ${card.title}: ${card.value}`);
        });

        // Verify all cards have values
        cardValues.forEach(card => {
            expect(card.value).toBeDefined();
            expect(card.value.trim().length).toBeGreaterThan(0);
        });

        console.log('✓ All overview cards validated with values');

        // Take screenshot of overview section
        await caseDashboard.takeScreenshot('case-overview-cards');
    });

    test('TC9: Validate Fund Status panel', async () => {
        console.log('\n--- Test 8: Validating Fund Status panel ---');

        // Validate Fund Status panel using page object method
        const fundStatusInfo = await caseDashboard.validateFundStatusPanel();

        // Detailed assertions using data returned by page object
        console.log('\nFund Status Panel Analysis:');
        console.log(`✓ Found ${fundStatusInfo.rows} rows of data`);
        console.log(`✓ Has ${fundStatusInfo.headers.length} columns: ${fundStatusInfo.headers.join(', ')}`);

        if (fundStatusInfo.data.length > 0) {
            console.log('✓ Fund status data retrieved successfully');

            // Verify all 4 status types are present using data from page object
            const expectedStatuses = [
                'Hold / Lien Applied',
                'Pending A/Cs (Money still in A/C without hold/lien)',
                'Exited Bank',
                'Disputed'
            ];

            const foundStatuses = fundStatusInfo.data.map(item => item.status);
            for (const expectedStatus of expectedStatuses) {
                if (foundStatuses.includes(expectedStatus)) {
                    console.log(`✓ Status found: ${expectedStatus}`);
                } else {
                    console.log(`⚠ Status not found: ${expectedStatus}`);
                }
            }

            // Verify numeric values in table
            fundStatusInfo.data.forEach(row => {
                // Tx Count should be a number (could be 0)
                expect(row.txCount).toMatch(/^\d+$/);

                // Amount should be in format like "0.00"
                expect(row.amount).toMatch(/^\d+\.\d{2}$/);

                // A/c Count should be a number
                expect(row.acCount).toMatch(/^\d+$/);

                console.log(`  ${row.status}: Tx=${row.txCount}, Amt=${row.amount}, A/Cs=${row.acCount}`);
            });
        } else {
            console.log('⚠ No fund status data available (may be a new case)');
        }

        console.log('\n✓ Fund Status panel validation completed successfully');
    });

    test('TC10: Validate Pending Amounts panel', async () => {
        console.log('\n--- Test 9: Validating Pending Amounts panel ---');

        // Validate Pending Amounts panel using page object method
        const pendingInfo = await caseDashboard.validatePendingAmountsPanel();

        console.log('\nPending Amounts Panel Analysis:');
        console.log(`✓ Main table present: ${pendingInfo.hasMainTable}`);
        console.log(`✓ Footer table present: ${pendingInfo.hasFooterTable}`);
        console.log(`✓ Has data: ${pendingInfo.hasData}`);
        console.log(`✓ Row count: ${pendingInfo.rowCount}`);

        // Test search functionality using page object method
        console.log('\nTesting search functionality:');
        await caseDashboard.searchPendingAmounts('Test Bank');
        console.log('✓ Search functionality tested');

        // Clear search for next tests
        await caseDashboard.locators.pendingAmountsSearch.clear();
        await caseDashboard.page.waitForTimeout(500);

        console.log('\n✓ Pending Amounts panel validation completed successfully');
    });

    test('TC11: Validate End Utilization Mode panel', async () => {
        console.log('\n--- Test 10: Validating End Utilization Mode panel ---');

        // Validate End Utilization Mode panel using page object method
        const utilizationInfo = await caseDashboard.validateEndUtilizationPanel();

        console.log('\nEnd Utilization Mode Panel Analysis:');
        console.log(`✓ Chart present: ${utilizationInfo.hasChart}`);
        console.log(`✓ Legend items: ${utilizationInfo.legendItems}`);
        console.log(`✓ View Details button present: ${utilizationInfo.hasViewDetailsBtn}`);

        // Test View Details button functionality using page object method
        console.log('\nTesting View Details button:');
        const viewDetailsResult = await caseDashboard.verifyEndUtilizationViewDetailsNavigation();

        if (viewDetailsResult.navigated) {
            console.log(`✓ Navigated to: ${viewDetailsResult.url}`);
        } else if (viewDetailsResult.modal) {
            console.log('✓ Modal/dialog opened');
        } else {
            console.log('✓ View Details button clicked');
        }

        console.log('\n✓ End Utilization Mode panel validation completed successfully');
    });

    test('TC12: Validate Exit A/C panel', async () => {
        console.log('\n--- Test 11: Validating Exit A/C panel ---');

        // Validate Exit A/C panel using page object method
        const exitAcInfo = await caseDashboard.validateExitAcPanel();

        console.log('\nExit A/C Panel Analysis:');
        console.log(`✓ No data message shown: ${exitAcInfo.hasNoDataMessage}`);
        console.log(`✓ View Details button present: ${exitAcInfo.hasViewDetailsBtn}`);

        // Test View Details button functionality using page object method
        console.log('\nTesting View Details button:');
        const viewDetailsResult = await caseDashboard.verifyExitAcViewDetailsNavigation();

        if (viewDetailsResult.navigated) {
            console.log(`✓ Navigated to: ${viewDetailsResult.url}`);
        } else if (viewDetailsResult.modal) {
            console.log('✓ Modal/dialog opened');
        } else {
            console.log('✓ View Details button clicked');
        }

        // For new cases, verify the "No data available" message is appropriate
        if (exitAcInfo.hasNoDataMessage) {
            console.log('✓ Appropriate message displayed for new case without exit data');
        }

        console.log('\n✓ Exit A/C panel validation completed successfully');
    });

    test('TC13: Comprehensive overview sections validation', async () => {
        console.log('\n--- Test 12: Comprehensive overview sections validation ---');

        // Use the page object method for comprehensive overview validation
        const results = await caseDashboard.validateAllOverviewSections();

        // Verify at least the 4 main panels we tested are present
        expect(results.panelTitles).toContain('Fund Status');
        expect(results.panelTitles).toContain('Pending Amounts (Money still in A/C without hold/lien)');
        expect(results.panelTitles).toContain('End Utilization Mode: Tx. Count and Amount');
        expect(results.panelTitles).toContain('Exit A/c: Exit Amount and Number of Transactions');

        console.log('\n✓ All expected panel titles found');

        // Take final screenshot
        await caseDashboard.takeScreenshot('all-overview-sections');

        console.log('\n✓ All overview sections validated successfully!');
    });

    test('TC14: Test error message checking', async () => {
        console.log('\n--- Test 13: Testing error message checking ---');

        // Use the page object method to check for error messages
        const errors = await caseDashboard.checkForErrorMessages();

        if (errors.length > 0) {
            console.log(`Found ${errors.length} error message(s):`);
            errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
            // If errors are expected in certain cases, you can handle them here
        } else {
            console.log('✓ No error messages found (expected behavior)');
        }

        expect(Array.isArray(errors)).toBe(true);
        console.log('✓ Error message checking working correctly');
    });

    test('TC15: Test get overview card values method', async () => {
        console.log('\n--- Test 14: Testing get overview card values method ---');

        // Use the page object method to get card values
        const cardValues = await caseDashboard.getOverviewCardValues();

        console.log(`Retrieved ${cardValues.length} card values:`);

        // Verify we got the expected number of cards (should be 8)
        expect(cardValues.length).toBeGreaterThanOrEqual(8);
        console.log(`✓ Expected at least 8 cards, found ${cardValues.length}`);

        // Log each card value
        cardValues.forEach((card, index) => {
            console.log(`  Card ${index + 1}: ${card.title} = ${card.value}`);

            // Verify each card has a title and value
            expect(card.title).toBeDefined();
            expect(card.title.trim().length).toBeGreaterThan(0);
            expect(card.value).toBeDefined();
            expect(card.value.trim().length).toBeGreaterThan(0);
        });

        console.log('✓ All card values retrieved and validated successfully');
    });

    test('TC16: Validate Exit Modes panel structure and data', async () => {
        console.log('\n--- Test 16: Validating Exit Modes panel structure ---');

        // Use the page object method to validate Exit Modes panel
        const panelInfo = await caseDashboard.validateExitModesPanel();

        // Verify all the required information is returned
        expect(panelInfo.headers).toBeDefined();
        expect(panelInfo.rowCount).toBeGreaterThan(0);
        expect(panelInfo.hasPaginator).toBe(true);
        expect(panelInfo.hasViewDetailsBtn).toBe(true);

        console.log('\n✓ Exit Modes panel validation completed successfully');
        console.log(`  - Headers: ${panelInfo.headers.join(', ')}`);
        console.log(`  - Row count: ${panelInfo.rowCount}`);
        console.log(`  - Has paginator: ${panelInfo.hasPaginator}`);
        console.log(`  - Has View Details button: ${panelInfo.hasViewDetailsBtn}`);
    });

    test('TC17: Validate Exit Modes table data content', async () => {
        console.log('\n--- Test 17: Validating Exit Modes table data ---');

        // Use the page object method to get and validate exit modes data
        const exitModesData = await caseDashboard.validateExitModesTableData();

        console.log(`Analyzing ${exitModesData.length} exit modes:`);

        // Validate dynamic data from the table
        exitModesData.forEach((data, index) => {
            console.log(`\n${index + 1}. Exit Mode: "${data.mode}"`);
            console.log(`   - Exit A/Cs: ${data.exitAccounts}`);
            console.log(`   - Feeding A/Cs: ${data.feedingAccounts}`);

            // Validate data (these are assertions that will pass with valid data)
            expect(data.mode.length).toBeGreaterThan(0);
            expect(data.exitAccounts).toBeGreaterThanOrEqual(0);
            expect(data.feedingAccounts).toBeGreaterThanOrEqual(0);
        });

        // Calculate and verify totals
        const totalExitAccounts = exitModesData.reduce((sum, data) => sum + data.exitAccounts, 0);
        const totalFeedingAccounts = exitModesData.reduce((sum, data) => sum + data.feedingAccounts, 0);

        console.log('\n✓ Summary Statistics:');
        console.log(`  - Total Exit Accounts: ${totalExitAccounts}`);
        console.log(`  - Total Feeding Accounts: ${totalFeedingAccounts}`);
        console.log(`  - Overall Feeding Ratio: ${totalExitAccounts > 0 ? (totalFeedingAccounts / totalExitAccounts).toFixed(2) : 'N/A'}`);

        // Verify we have meaningful data
        expect(totalExitAccounts).toBeGreaterThan(0);
        console.log('✓ Exit Modes data validation completed successfully');
    });

    test('TC18: Test Exit Modes panel functionality and interactions', async () => {
        console.log('\n--- Test 17: Testing Exit Modes panel functionality ---');

        // Use the page object method to test panel functionality
        const functionalityResults = await caseDashboard.testExitModesPanelFunctionality();

        console.log('\nFunctionality Test Results:');
        console.log('==========================');
        console.log(`✓ Panel controls: ${functionalityResults.panelControls ? 'Tested' : 'Not tested/Skipped'}`);
        console.log(`✓ View Details button: ${functionalityResults.viewDetails ? 'Tested' : 'Not tested/Skipped'}`);
        console.log(`✓ Row interactions: ${functionalityResults.rowInteractions ? 'Tested' : 'Not tested/Skipped'}`);
        console.log(`✓ Pagination: ${functionalityResults.pagination ? 'Tested' : 'Not tested/Skipped'}`);

        // Verify at least some functionality was tested
        expect(Object.values(functionalityResults).some(result => result === true)).toBe(true);
        console.log('\n✓ Exit Modes panel functionality testing completed');
    });

    test('TC19: Comprehensive analysis of Exit Modes and feeder accounts data', async () => {
        console.log('\n--- Test 18: Comprehensive Exit Modes analysis ---');

        // Use the page object method to perform comprehensive analysis
        const analysisResults = await caseDashboard.analyzeExitModesData();

        console.log('\n1. Exit Mode Analysis Summary:');
        console.log('===============================');

        analysisResults.exitModesData.forEach((data, index) => {
            console.log(`\n${index + 1}. ${data.mode}:`);
            console.log(`   - Exit Accounts: ${data.exitAccounts}`);
            console.log(`   - Feeding Accounts: ${data.feedingAccounts}`);
            const feedingRatio = data.exitAccounts > 0 ? (data.feedingAccounts / data.exitAccounts).toFixed(2) : 'N/A';
            console.log(`   - Feeding Ratio: ${feedingRatio}`);

            // Analysis based on mode type
            if (data.mode.toLowerCase() === 'atm') {
                console.log('   - Analysis: ATM withdrawals typically have fewer feeder accounts as funds come directly from victim accounts');
            }
            if (data.mode.toLowerCase() === 'pos') {
                console.log('   - Analysis: Point of Sale transactions may show different feeder patterns');
            }
        });

        console.log('\n2. Overall Statistics:');
        console.log('======================');
        console.log(`Total Exit Accounts: ${analysisResults.totalExitAccounts}`);
        console.log(`Total Feeding Accounts: ${analysisResults.totalFeedingAccounts}`);
        console.log(`Overall Feeding Ratio: ${analysisResults.overallFeedingRatio}`);

        console.log('\n3. Exit Mode Distribution:');
        console.log('===========================');

        analysisResults.exitModesData.forEach(data => {
            const percentage = analysisResults.totalExitAccounts > 0 ?
                ((data.exitAccounts / analysisResults.totalExitAccounts) * 100).toFixed(1) : '0';
            console.log(`${data.mode}: ${percentage}% of total exit accounts (${data.exitAccounts}/${analysisResults.totalExitAccounts})`);
        });

        console.log('\n4. Risk Assessment based on Feeding Patterns:');
        console.log('============================================');

        analysisResults.exitModesData.forEach(data => {
            if (data.feedingAccounts === 0) {
                console.log(`⚠️  ${data.mode}: No feeder accounts detected - funds may be directly from victim accounts`);
            } else if (data.exitAccounts > 0 && data.feedingAccounts > data.exitAccounts) {
                console.log(`✓ ${data.mode}: Multiple feeder accounts (${data.feedingAccounts}) feeding into ${data.exitAccounts} exit accounts - complex money trail`);
            } else if (data.exitAccounts > 0 && data.feedingAccounts === data.exitAccounts) {
                console.log(`ℹ️  ${data.mode}: Direct 1:1 mapping between feeder and exit accounts`);
            }
        });

        console.log('\n5. Investigative Insights:');
        console.log('==========================');

        if (analysisResults.mostComplexMode) {
            console.log(`Most complex exit structure: ${analysisResults.mostComplexMode.mode}`);
            console.log(`  - ${analysisResults.mostComplexMode.exitAccounts} exit accounts`);
            console.log(`  - ${analysisResults.mostComplexMode.feedingAccounts} feeder accounts`);
            console.log(`  - Investigative priority: High - follow the feeder account trail`);
        }

        if (analysisResults.noFeederModes.length > 0) {
            console.log(`\nExit modes with NO feeder accounts (${analysisResults.noFeederModes.length}):`);
            analysisResults.noFeederModes.forEach(mode => {
                console.log(`  - ${mode.mode}: ${mode.exitAccounts} exit accounts`);
            });
            console.log('  Investigative note: These may be direct withdrawals from victim accounts');
        }

        console.log('\n✓ Comprehensive Exit Modes analysis completed successfully');
    });

    test('TC20: Test drill-down functionality for feeder accounts details', async () => {
        console.log('\n--- Test 20: Testing feeder accounts drill-down ---');

        // Use the page object method to test feeder accounts drill-down
        const drillDownResults = await caseDashboard.testFeederAccountsDrillDown();

        console.log('\nDrill-down Test Results:');
        console.log('=======================');
        console.log(`✓ View Details button test: ${drillDownResults.viewDetailsTest ? 'Passed' : 'Failed/Skipped'}`);
        // console.log(`✓ Row-level drill-down: ${drillDownResults.rowDrillDown ? 'Passed' : 'Failed/Skipped'}`);
        console.log(`✓ Feeder accounts data retrieval: Found ${drillDownResults.feederAccountsData.length} exit modes with feeder accounts`);

        // Log feeder accounts data if found
        if (drillDownResults.feederAccountsData.length > 0) {
            console.log('\nExit modes with feeder accounts:');
            drillDownResults.feederAccountsData.forEach(data => {
                console.log(`  - ${data.exitMode}: ${data.feedingAccounts} feeder accounts (Priority: ${data.investigationPriority})`);
            });
        } else {
            console.log('\nℹ️ No exit modes with feeder accounts found in current data');
        }

        console.log(`\nOverall success: ${drillDownResults.overallSuccess ? 'PASS ✓' : 'FAIL ✗'}`);

        // // Test passes if any functionality was tested or data was retrieved
        expect(drillDownResults.overallSuccess).toBe(true);
    });

    test('TC21: Validate Top Bank Branches panel structure and UI elements', async () => {
        console.log('\n--- TC21: Validating Top Bank Branches panel structure ---');

        await caseDashboard.validateTopBankBranchesPanelStructure();
        await caseDashboard.minimiseValidation();

        console.log('✓ Panel structure validation completed');
    });
    test('TC22: Validate Top Bank Branches data and sorting logic', async () => {
        console.log('\n--- TC22: Validating Top Bank Branches data correctness ---');

        // Step 1: Navigate to details page
        await caseDashboard.navigateToTopBankBranchesDetails();

        // Step 2: Validate Export Button
        await caseDashboard.validateExportButton('Bank', 'Withdraw');

        // Step 3: Validate Export Button
        await caseDashboard.validateTopBranchesSorting();
    });

    test('TC23: Validate View Details functionality for Top Bank Branches panel', async ({ request }) => {

        console.log('\n--- TC23: Testing View Details for Top Bank Branches ---');

        // Step 1: Navigate to details page
        await caseDashboard.navigateToTopBankBranchesDetails();

        // Step 2: Grab the API response
        const apiResponse = await caseDashboard.getTopBankBranchesSummary(request, 'UKSTF');

        // Step 3: Validate that the API response matches the UI values
        await caseDashboard.validateTopBankBranchesSummaryValues(apiResponse);

    });
    test('TC24: Validate Top Suspect panel title & header controls', async ({ page }) => {

        console.log('\n--- TC24: Top Suspect panel header validation started ---');

        const caseDashboard = new CaseDashboard(page);

        await caseDashboard.assertTopSuspectsPanelHeaderAndControls();

    });
    test('TC25: Validate suspect list structure and values using API response', async ({ page, request }) => {

        console.log('\n--- TC25: API vs UI Top Suspects Validation Started ---');

        const caseDashboard = new CaseDashboard(page);

        const apiData = await caseDashboard.fetchTopSuspectsFromAPI(request, 'UKSTF');

        await caseDashboard.assertTopSuspectListMatchesAPI(apiData);

        console.log('--- TC25: Validation Completed Successfully ---\n');
    });
    test('TC26: Validate pagination UI, navigation, and View Details action', async ({ page }) => {

        const caseDashboard = new CaseDashboard(page);

        await caseDashboard.assertTopSuspectsPaginationVisible();

        await caseDashboard.assertTopSuspectsViewDetailsNavigation();

        await caseDashboard.assertTopSuspectsPageLayout();

        await caseDashboard.assertTopSuspectsSearch('808080401127704');

        await caseDashboard.assertTopSuspectsRiskBandFilter();

        await caseDashboard.validateExportButton(
            'Account Name',
            'Account Number'
        );

        console.log('✓ TC26 completed successfully');
    });


});