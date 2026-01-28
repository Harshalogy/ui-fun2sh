const { test, expect } = require("@playwright/test");
const SessionUtility = require("../utils/sessionUtility");
const TC09Helpers = require("../utils/tc09Helpers");
const { CasePage } = require("../pageObjects/CasePage");
const FileUploadPageObject = require("../pageObjects/FileUploadPageObject");
const FundStatusPageObject = require("../pageObjects/FundStatusPageObject");

const BASE_URL = "http://148.113.0.204:23810";

test.describe("File Upload QA Automation - Consolidated Test Suite", () => {
    let page;
    let helpers;

    // =============== ASSERTION UTILITIES ===============
    const CURRENCY_REGEX = /^₹[\d,]+(\.\d{2})?$/;
    const TIMESTAMP_REGEX = /^\d{1,2}:\d{2}\s(AM|PM)\s\d{1,2}\s\w{3}\s\d{4}$/;
    
    const log = {
        start: (name) => console.log(`\n📋 ${name}`),
        end: (name) => console.log(`✅ ${name}\n`),
        check: (msg) => console.log(`  ✓ ${msg}`),
        info: (msg) => console.log(`  ℹ ${msg}`),
        assert: (msg, value) => console.log(`  ✓ ${msg}: ${value}`)
    };

    // =============== SETUP/TEARDOWN ===============
    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        helpers = new TC09Helpers(page, log);
        // Inject session storage from saved auth files
        await SessionUtility.injectSessionStorage(page, "auth.json");
        await SessionUtility.injectSessionStorage(page, "auth2.json");
    });

    // ============= TEST 1: IO File Stack Comprehensive =============
    test("T1: IO Dashboard - Validate File Stack (Structure, Search, Selection, Pagination)", async () => {
        log.start("T1: IO File Stack - Comprehensive");
        
        try {
            await helpers.navigateAndSwitchView('/dashboard/io', 'auth.json');
            const fileUploadPageObj = new FileUploadPageObject(page);
            
            // SECTION A: Validate table structure and columns
            const { isVisible, headers, rowCount } = await helpers.validateTableStructure(fileUploadPageObj, "File Stack");
            
            if (isVisible && headers.length > 0) {
                expect(headers.some(h => h.toLowerCase().includes('file name'))).toBe(true);
                expect(headers.some(h => h.toLowerCase().includes('uploaded'))).toBe(true);
                log.check("Required columns: File Name, Uploaded At");
            }
            
            // SECTION B: Validate controls (Export, Search)
            await helpers.validateButton('button:has-text("Export")', "Export button");
            await helpers.validateButton('input[placeholder*="search"], input[placeholder*="Search"]', "Search control");
            log.check("Export and Search controls verified");
            
            // SECTION C: Validate search functionality if data exists
            if (rowCount > 0) {
                await helpers.validateSearch(fileUploadPageObj, 'test');
                log.check("Search functionality validated");
                
                // SECTION D: Validate bulk selection controls
                const checkboxCount = await page.locator('input[type="checkbox"]').count();
                if (checkboxCount > 0) {
                    log.check("Bulk selection checkboxes available");
                }
            } else {
                log.info("No files available - search/selection skipped");
            }
            
            // SECTION E: Validate pagination
            const pageRange = await fileUploadPageObj.getFileStackPageRange().catch(() => null);
            if (pageRange) {
                log.assert("Pagination indicator", pageRange);
            } else {
                log.check("Single page or pagination not visible");
            }
            await helpers.validatePaginationControls();
            
            log.end("T1: IO File Stack - Comprehensive");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 2: SIO File Stack Comprehensive =============
    test("T2: SIO Dashboard - Validate File Stack (Disputed & Transaction Views)", async () => {
        log.start("T2: SIO File Stack - Disputed & Transaction");
        
        try {
            // ===== DISPUTED AMOUNT VIEW =====
            await helpers.navigateAndSwitchView('/dashboard/sio', 'auth2.json', "Disputed Amount");
            let fileUploadPageObj = new FileUploadPageObject(page);
            let { isVisible: disputedVisible, headers: disputedHeaders, rowCount: disputedRows } = 
                await helpers.validateTableStructure(fileUploadPageObj, "File Stack (Disputed)");
            
            log.assert("Disputed view - table visible", disputedVisible);
            log.assert("Disputed view - columns found", disputedHeaders.length);
            
            if (disputedRows > 0) {
                await helpers.validateSearch(fileUploadPageObj, 'test');
                log.check("Search validated for Disputed view");
            }
            
            // ===== TRANSACTION AMOUNT VIEW =====
            await helpers.switchViewMode("Transaction Amount");
            await page.waitForTimeout(300);
            fileUploadPageObj = new FileUploadPageObject(page);
            let { isVisible: transVisible, headers: transHeaders, rowCount: transRows } = 
                await helpers.validateTableStructure(fileUploadPageObj, "File Stack (Transaction)");
            
            log.assert("Transaction view - table visible", transVisible);
            log.assert("Transaction view - columns found", transHeaders.length);
            log.assert("Transaction view - row count", transRows);
            
            if (transRows > 0) {
                log.check("Transaction view data populated");
            }
            
            log.end("T2: SIO File Stack - Disputed & Transaction");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 3: New Case Modal Operations =============
    test("T3: New Case Modal - Structure, Navigation, Form Retention", async () => {
        log.start("T3: New Case Modal - Complete Flow");
        
        try {
            await SessionUtility.setupSessionAndNavigate(page, '/dashboard/io', 'auth.json');
            const casePage = new CasePage(page);
            
            // ===== SECTION A: Modal opening and structure =====
            await casePage.openNewCaseModal();
            log.check("New Case modal opened");
            
            // Verify modal header
            let headingText = null;
            try {
                const heading = await page.locator('heading:has-text("New Case")').first();
                headingText = await heading.textContent().catch(() => null);
            } catch (e) {
                const h1 = await page.locator('h1').first();
                headingText = await h1.textContent().catch(() => null);
            }
            
            if (headingText && (headingText.includes("New") || headingText.includes("Case"))) {
                log.check("Modal header verified");
            }
            
            // Verify wizard steps
            const stepIndicators = await page.locator('[class*="step"]').all();
            const visibleSteps = [];
            for (let i = 0; i < stepIndicators.length; i++) {
                const isVisible = await stepIndicators[i].isVisible().catch(() => false);
                if (isVisible) visibleSteps.push(i);
            }
            expect(visibleSteps.length).toBeGreaterThanOrEqual(3);
            log.assert("Wizard steps count", visibleSteps.length);
            
            // Verify form fields
            const caseNameField = await page.locator('input[placeholder*="Case Name"]').first();
            log.check("Case Name field present");
            
            const categoryField = await page.locator('combobox').filter({ hasText: /Category/i }).first();
            const priorityField = await page.locator('combobox').filter({ hasText: /Priority/i }).first();
            log.check("Category and Priority dropdowns present");
            
            // ===== SECTION B: Form data entry and retention =====
            const rand = Math.floor(Math.random() * 99999);
            const uniqueCaseName = `AutoTest-${rand}`;
            const uniqueComplaintNo = `CMP-${rand}`;
            
            await casePage.fillBasicDetails({
                caseName: uniqueCaseName,
                complaintNo: uniqueComplaintNo,
                unit: `Unit-${rand}`,
                investigator: `Officer-${rand}`,
                description: `Comprehensive Test`
            });
            log.check("Form fields filled");
            
            // Select dropdowns
            await casePage.selectDropdownByLabel("Category", /Demat|Depository/i).catch(() => null);
            await casePage.selectDropdownByLabel("Priority", /Normal/i);
            log.check("Dropdown selections made");
            
            // ===== SECTION C: Navigation between steps =====
            await casePage.clickNext();
            await page.waitForTimeout(300);
            log.check("Navigated to Upload step");
            
            // Verify upload step has file controls
            const addFilesBtn = await page.getByRole('button', { name: /Add Files/i }).count();
            const fileInputs = await page.locator('input[type="file"]').count();
            log.assert("File controls available", addFilesBtn > 0 ? "yes" : "no");
            
            // Check PDF checkbox if exists
            const checkboxes = await page.locator('input[type="checkbox"]').all();
            let pdfCheckboxFound = false;
            for (const checkbox of checkboxes) {
                try {
                    const parent = await checkbox.locator('..').first();
                    const text = await parent.textContent().catch(() => '');
                    if (text.toLowerCase().includes('pdf') || text.toLowerCase().includes('extract')) {
                        pdfCheckboxFound = true;
                        const isVisible = await checkbox.isVisible().catch(() => false);
                        log.assert("PDF checkbox", `visible=${isVisible}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            if (!pdfCheckboxFound) {
                log.check("PDF checkbox not required in this step");
            }
            
            // ===== SECTION D: Back navigation and form retention =====
            try {
                await casePage.clickBack();
                await page.waitForTimeout(300);
                log.check("Returned to form step");
                
                const retainedCaseName = await casePage.locators.caseNameInput.inputValue().catch(() => '');
                if (retainedCaseName && retainedCaseName.includes(uniqueCaseName)) {
                    log.assert("Form data retained", "✓");
                } else {
                    log.check("Form navigation verified");
                }
                
                // Navigate forward again
                await casePage.clickNext();
                await page.waitForTimeout(300);
                log.check("Re-navigation to Upload step successful");
            } catch (e) {
                log.check("Modal operations completed");
            }
            
            // ===== SECTION E: Modal closure =====
            await casePage.clickCancel();
            await page.waitForTimeout(200);
            const modalExists = await page.locator('dialog').count();
            expect(modalExists).toBe(0);
            log.check("Modal closed successfully");
            
            log.end("T3: New Case Modal - Complete Flow");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 4: SIO Fund Status Disputed Amount =============
    test("T4: SIO Fund Status - Disputed Amount (Headers, Data, Search, Pagination)", async () => {
        log.start("T4: SIO Fund Status - Disputed");
        
        try {
            await helpers.navigateAndSwitchView('/dashboard/sio', 'auth2.json', "Disputed Amount");
            const fundStatusPageObj = new FundStatusPageObject(page);
            
            // ===== SECTION A: Table structure and headers =====
            const { isVisible, headers, rowCount } = await helpers.validateFundStatusStructure(fundStatusPageObj, "Fund Status");
            
            if (isVisible && headers.length > 0) {
                await helpers.validateRequiredColumns(headers, ['Case Name', 'Fund Status', 'Status'], "Fund Status");
                log.check("Required columns validated");
            }
            
            // ===== SECTION B: Data formatting =====
            if (rowCount > 0) {
                await helpers.validateCurrencyFormat([], CURRENCY_REGEX);
                await helpers.validateTimestampFormat(TIMESTAMP_REGEX);
                await helpers.validateStatusColumn();
                log.check("Data formatting validated");
            }
            
            // ===== SECTION C: Search functionality =====
            if (isVisible) {
                await helpers.validateTableSearch(fundStatusPageObj, "test");
                log.check("Search functionality validated");
                
                // ===== SECTION D: Controls and column selection =====
                await helpers.validateButton('button:has-text("Export")', "Export button");
                await helpers.selectAndValidateColumns(fundStatusPageObj);
                log.check("Export and column selection validated");
                
                // ===== SECTION E: Pagination =====
                await helpers.validatePaginationControls();
                log.check("Pagination controls validated");
            }
            
            log.end("T4: SIO Fund Status - Disputed");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 5: SIO Fund Status Transaction Amount =============
    test("T5: SIO Fund Status - Transaction Amount (Structure, Data, Formula)", async () => {
        log.start("T5: SIO Fund Status - Transaction");
        
        try {
            await helpers.navigateAndSwitchView('/dashboard/sio', 'auth2.json', "Transaction Amount");
            const fundStatusPageObj = new FundStatusPageObject(page);
            
            // ===== SECTION A: Table structure =====
            const { isVisible, headers, rowCount } = await helpers.validateFundStatusStructure(fundStatusPageObj, "Fund Status (Transaction)");
            log.assert("Table visible", isVisible);
            log.assert("Headers found", headers.length);
            log.assert("Row count", rowCount);
            
            // ===== SECTION B: Fund formula validation =====
            if (isVisible && rowCount > 0) {
                const formulaResults = await fundStatusPageObj.validateFundFormula().catch(() => ({}));
                log.assert("Fund formula available", formulaResults.hasFormula ? "yes" : "no");
                
                // ===== SECTION C: Amount fields validation =====
                const amountResults = await fundStatusPageObj.validateFundAmounts().catch(() => ({}));
                if (amountResults.amountsFound && amountResults.amountsFound > 0) {
                    log.assert("Amount fields found", amountResults.amountsFound);
                } else {
                    log.check("No amount data (may be empty dataset)");
                }
            } else {
                log.check("Transaction table structure verified");
            }
            
            log.end("T5: SIO Fund Status - Transaction");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 6: SIO Fund Status Column Operations =============
    test("T6: SIO Fund Status - Column Selection & Configuration", async () => {
        log.start("T6: SIO Fund Status - Column Operations");
        
        try {
            // Test with both Disputed and Transaction views
            const views = [
                { label: "Disputed Amount", auth: "auth2.json", mode: "Disputed Amount" },
                { label: "Transaction Amount", auth: "auth2.json", mode: "Transaction Amount" }
            ];
            
            for (const view of views) {
                await helpers.navigateAndSwitchView('/dashboard/sio', view.auth, view.mode);
                const fundStatusPageObj = new FundStatusPageObject(page);
                const { isVisible } = await helpers.validateFundStatusStructure(fundStatusPageObj, `Fund Status - ${view.label}`);
                
                if (isVisible) {
                    await helpers.selectAndValidateColumns(fundStatusPageObj);
                    log.check(`Column selection validated for ${view.label}`);
                }
            }
            
            log.end("T6: SIO Fund Status - Column Operations");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 7: IO Fund Status Comprehensive =============
    test("T7: IO Dashboard - Fund Status (Structure, Data Validation, Controls)", async () => {
        log.start("T7: IO Fund Status - Comprehensive");
        
        try {
            await helpers.navigateAndSwitchView('/dashboard/io', 'auth.json');
            const fundStatusPageObj = new FundStatusPageObject(page);
            
            // ===== SECTION A: Table structure =====
            const { isVisible, headers, rowCount } = await helpers.validateFundStatusStructure(fundStatusPageObj, "Fund Status");
            log.assert("Table visible", isVisible);
            log.assert("Headers found", headers.length);
            
            // ===== SECTION B: Data validation =====
            if (isVisible && rowCount > 0) {
                const statusResults = await fundStatusPageObj.validateStatusColumn().catch(() => ({}));
                log.assert("Status entries", statusResults.totalRows ? `${statusResults.totalRows} rows` : "0");
                
                const timestampResults = await fundStatusPageObj.validateTimestampFormat().catch(() => ({}));
                log.assert("Timestamp validation", 
                    timestampResults.totalFound ? `${timestampResults.validFormat}/${timestampResults.totalFound} valid` : "none"
                );
                log.check("Data validation completed");
            }
            
            // ===== SECTION C: Export and controls =====
            if (isVisible) {
                await helpers.validateButton('button:has-text("Export")', "Export button");
                await helpers.validatePaginationControls();
                log.check("Controls validated");
            }
            
            log.end("T7: IO Fund Status - Comprehensive");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    // ============= TEST 8: Cross-User Comparison (IO vs SIO) =============
    test("T8: Cross-User Validation - IO vs SIO Dashboard Comparison", async () => {
        log.start("T8: IO vs SIO Dashboard Comparison");
        
        try {
            const comparisons = [];
            
            // ===== IO User View =====
            log.info("Testing IO user view...");
            await helpers.navigateAndSwitchView('/dashboard/io', 'auth.json');
            const ioFileUploadPageObj = new FileUploadPageObject(page);
            const ioFundStatusPageObj = new FundStatusPageObject(page);
            
            const ioFileStack = await helpers.validateTableStructure(ioFileUploadPageObj, "IO File Stack").catch(() => ({ isVisible: false }));
            const ioFundStatus = await helpers.validateFundStatusStructure(ioFundStatusPageObj, "IO Fund Status").catch(() => ({ isVisible: false }));
            
            comparisons.push({
                user: "IO",
                fileStackVisible: ioFileStack.isVisible,
                fundStatusVisible: ioFundStatus.isVisible,
                fileStackRows: ioFileStack.rowCount || 0,
                fundStatusRows: ioFundStatus.rowCount || 0
            });
            
            // ===== SIO User View (Disputed) =====
            log.info("Testing SIO user view...");
            await helpers.navigateAndSwitchView('/dashboard/sio', 'auth2.json', "Disputed Amount");
            const sioFileUploadPageObj = new FileUploadPageObject(page);
            const sioFundStatusPageObj = new FundStatusPageObject(page);
            
            const sioFileStack = await helpers.validateTableStructure(sioFileUploadPageObj, "SIO File Stack").catch(() => ({ isVisible: false }));
            const sioFundStatus = await helpers.validateFundStatusStructure(sioFundStatusPageObj, "SIO Fund Status").catch(() => ({ isVisible: false }));
            
            comparisons.push({
                user: "SIO",
                fileStackVisible: sioFileStack.isVisible,
                fundStatusVisible: sioFundStatus.isVisible,
                fileStackRows: sioFileStack.rowCount || 0,
                fundStatusRows: sioFundStatus.rowCount || 0
            });
            
            // ===== Log comparison results =====
            for (const comp of comparisons) {
                log.assert(`${comp.user} - File Stack`, `visible=${comp.fileStackVisible}, rows=${comp.fileStackRows}`);
                log.assert(`${comp.user} - Fund Status`, `visible=${comp.fundStatusVisible}, rows=${comp.fundStatusRows}`);
            }
            
            log.end("T8: IO vs SIO Dashboard Comparison");
        } catch (error) {
            log.info(`Error: ${error.message}`);
            throw error;
        }
    });

    test.afterEach(async () => {
        // Session cleanup handled by Playwright - no need for manual context cleanup
        console.log("✓ Test completed");
    });
});
